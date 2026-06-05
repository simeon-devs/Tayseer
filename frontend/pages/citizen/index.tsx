import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import StepIndicator from '../../components/StepIndicator';
import StepPersonal, { PersonalData } from '../../components/citizen/StepPersonal';
import StepFinancial, { FinancialData } from '../../components/citizen/StepFinancial';
import StepDocuments, { DocumentFiles } from '../../components/citizen/StepDocuments';
import { useLang } from '../../lib/LanguageContext';
import { createCase, extractDocument, runDecision } from '../../lib/api';

const EMIRATES_ID_RE = /^784-\d{4}-\d{7}-\d$/;
const REQUIRED_DOCS = ['salary_certificate', 'bank_statement', 'emirates_id'] as const;

const emptyPersonal: PersonalData = {
  nameAr: '', nameEn: '', emiratesId: '', phone: '', email: '',
};
const emptyFinancial: FinancialData = {
  monthlyIncome: '', existingObligations: '', arrearsAmount: '', delayDuration: '', reason: '',
  originalLoanAmount: '', remainingLoanBalance: '', remainingLoanPeriod: '', unpaidInstalments: '',
  numberOfFamilyMembers: '1',
};

export default function CitizenIntake() {
  const { t } = useLang();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('uae_pass_authenticated')) {
      setAuthenticated(true);
    } else {
      router.replace('/citizen/login');
    }
  }, [router]);

  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState<PersonalData>(emptyPersonal);
  const [financial, setFinancial] = useState<FinancialData>(emptyFinancial);
  const [files, setFiles] = useState<DocumentFiles>({});
  const [personalErrors, setPersonalErrors] = useState<Partial<Record<keyof PersonalData, string>>>({});
  const [financialErrors, setFinancialErrors] = useState<Partial<Record<keyof FinancialData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [submitError, setSubmitError] = useState('');

  function updatePersonal(field: keyof PersonalData, value: string) {
    setPersonal((p) => ({ ...p, [field]: value }));
    setPersonalErrors((e) => ({ ...e, [field]: undefined }));
  }

  function updateFinancial(field: keyof FinancialData, value: string) {
    setFinancial((f) => ({ ...f, [field]: value }));
    setFinancialErrors((e) => ({ ...e, [field]: undefined }));
  }

  function updateFile(type: keyof DocumentFiles, file: File | undefined) {
    setFiles((f) => ({ ...f, [type]: file }));
  }

  function validatePersonal(): boolean {
    const errs: Partial<Record<keyof PersonalData, string>> = {};
    if (!personal.nameAr.trim()) errs.nameAr = t('fieldRequired');
    if (!personal.nameEn.trim()) errs.nameEn = t('fieldRequired');
    if (!personal.emiratesId.trim()) {
      errs.emiratesId = t('fieldRequired');
    } else if (!EMIRATES_ID_RE.test(personal.emiratesId.trim())) {
      errs.emiratesId = t('invalidEmiratesId');
    }
    if (personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) {
      errs.email = t('invalidEmail');
    }
    setPersonalErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateFinancial(): boolean {
    const errs: Partial<Record<keyof FinancialData, string>> = {};
    const checkPositive = (key: keyof FinancialData) => {
      const val = Number(financial[key]);
      if (!financial[key]) { errs[key] = t('fieldRequired'); return; }
      if (isNaN(val) || val < 0) errs[key] = t('mustBePositive');
    };
    checkPositive('monthlyIncome');
    checkPositive('existingObligations');
    checkPositive('arrearsAmount');
    if (!financial.delayDuration) {
      errs.delayDuration = t('fieldRequired');
    } else if (Number(financial.delayDuration) < 1) {
      errs.delayDuration = t('mustBePositive');
    }
    if (!financial.reason.trim()) errs.reason = t('fieldRequired');
    setFinancialErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (step === 1 && !validatePersonal()) return;
    if (step === 2 && !validateFinancial()) return;
    setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => s - 1);
    setSubmitError('');
  }

  async function handleSubmit() {
    setSubmitError('');
    setLoading(true);

    try {
      setLoadingMsg(t('processingCase'));
      const uploadedTypes = REQUIRED_DOCS.filter((k) => files[k]);
      const caseRes = await createCase({
        citizen_name_ar: personal.nameAr.trim(),
        citizen_name_en: personal.nameEn.trim(),
        emirates_id: personal.emiratesId.trim(),
        phone: personal.phone.trim() || undefined,
        email: personal.email.trim() || undefined,
        monthly_income: Number(financial.monthlyIncome),
        existing_obligations: Number(financial.existingObligations),
        arrears_amount: Number(financial.arrearsAmount),
        delay_duration_months: Number(financial.delayDuration),
        reason_for_request: financial.reason.trim(),
        documents_submitted: uploadedTypes,
      });

      const caseId = caseRes.id;

      setLoadingMsg(t('processingDocs'));
      for (const key of REQUIRED_DOCS) {
        const file = files[key];
        if (file) {
          try {
            await extractDocument(file, caseId);
          } catch {
            // extraction failure is non-fatal; the decision engine handles missing docs
          }
        }
      }

      const missingDocs = REQUIRED_DOCS.filter((k) => !files[k]);

      setLoadingMsg(t('processingDecision'));
      await runDecision(caseId, {
        monthly_income: Number(financial.monthlyIncome),
        existing_obligations: Number(financial.existingObligations),
        arrears_amount: Number(financial.arrearsAmount),
        delay_duration_months: Number(financial.delayDuration),
        missing_documents: missingDocs,
        original_loan_amount: financial.originalLoanAmount ? Number(financial.originalLoanAmount) : undefined,
        remaining_loan_balance: financial.remainingLoanBalance ? Number(financial.remainingLoanBalance) : undefined,
        remaining_loan_period_months: financial.remainingLoanPeriod ? Number(financial.remainingLoanPeriod) : undefined,
        number_of_unpaid_instalments: financial.unpaidInstalments ? Number(financial.unpaidInstalments) : undefined,
        number_of_family_members: financial.numberOfFamilyMembers ? Number(financial.numberOfFamilyMembers) : 1,
      });

      setLoadingMsg(t('processingComplete'));
      router.push(`/citizen/decision/${caseId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('submissionFailed'));
      setLoading(false);
    }
  }

  if (!authenticated) return null;

  return (
    <>
      <Head>
        <title>{t('appName')} - {t('tagline')}</title>
      </Head>
      <div className="min-h-screen bg-surface">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <StepIndicator currentStep={step} totalSteps={3} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {step === 1 && t('stepPersonal')}
              {step === 2 && t('stepFinancial')}
              {step === 3 && t('documentsTitle')}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {t('poweredBy')}
            </p>

            {step === 1 && (
              <StepPersonal data={personal} errors={personalErrors} onChange={updatePersonal} />
            )}
            {step === 2 && (
              <StepFinancial data={financial} errors={financialErrors} onChange={updateFinancial} />
            )}
            {step === 3 && (
              <StepDocuments files={files} onChange={updateFile} />
            )}

            {submitError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button type="button" onClick={handleBack} className="btn-secondary">
                  {t('back')}
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button type="button" onClick={handleNext} className="btn-primary">
                  {t('next')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary"
                >
                  {t('submit')}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 text-lg mb-2">{t('processingTitle')}</h3>
            <p className="text-sm text-gray-600">{loadingMsg}</p>
          </div>
        </div>
      )}
    </>
  );
}
