import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import StepPersonal, { PersonalData } from '../../components/citizen/StepPersonal';
import StepFinancial, { FinancialData } from '../../components/citizen/StepFinancial';
import StepDocuments, { DocumentFiles } from '../../components/citizen/StepDocuments';
import { useLang } from '../../lib/LanguageContext';
import { createCase, extractDocument, runDecision } from '../../lib/api';
import type { CitizenFinancialProfile } from '../../lib/types';

const EMIRATES_ID_RE = /^784-\d{4}-\d{7}-\d$/;
const REQUIRED_DOCS = ['salary_certificate', 'bank_statement', 'emirates_id'] as const;

const emptyPersonal: PersonalData = {
  nameAr: '', nameEn: '', emiratesId: '', phone: '', email: '',
};
const emptyFinancial: FinancialData = {
  monthlyIncome: '', existingObligations: '', arrearsAmount: '', delayDuration: '3', reason: '',
  originalLoanAmount: '', remainingLoanBalance: '', remainingLoanPeriod: '', unpaidInstalments: '',
  numberOfFamilyMembers: '1',
};

function sanitizeProfile(profile: CitizenFinancialProfile): CitizenFinancialProfile {
  return {
    ...profile,
    has_expired_id: profile.has_expired_id ?? false,
    is_unemployed: profile.is_unemployed ?? false,
    has_temporary_circumstance: profile.has_temporary_circumstance ?? false,
    missing_documents: profile.missing_documents ?? [],
    number_of_family_members: profile.number_of_family_members ?? 1,
    number_of_unpaid_instalments: profile.number_of_unpaid_instalments ?? 0,
    remaining_loan_period_months: profile.remaining_loan_period_months ?? 60,
  };
}

export default function CitizenIntake() {
  const { t, isRtl } = useLang();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('uae_pass_authenticated')) {
      setAuthenticated(true);
    } else {
      router.replace('/citizen/login');
    }
  }, [router]);

  const [activeStep, setActiveStep] = useState(1);
  const [isSocialOpen, setIsSocialOpen] = useState(true);
  const [isFinancialOpen, setIsFinancialOpen] = useState(true);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(true);

  const [personal, setPersonal] = useState<PersonalData>(emptyPersonal);
  const [financial, setFinancial] = useState<FinancialData>(emptyFinancial);
  const [files, setFiles] = useState<DocumentFiles>({});
  const [personalErrors, setPersonalErrors] = useState<Partial<Record<keyof PersonalData, string>>>({});
  const [financialErrors, setFinancialErrors] = useState<Partial<Record<keyof FinancialData, string>>>({});
  
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [showDraftToast, setShowDraftToast] = useState(false);

  function updatePersonal(field: keyof PersonalData, value: string) {
    setPersonal((p) => ({ ...p, [field]: value }));
    setPersonalErrors((e) => ({ ...e, [field]: undefined }));
    setActiveStep(1);
  }

  function updateFinancial(field: keyof FinancialData, value: string) {
    setFinancial((f) => ({ ...f, [field]: value }));
    setFinancialErrors((e) => ({ ...e, [field]: undefined }));
    setActiveStep(2);
  }

  function updateFile(type: keyof DocumentFiles, file: File | undefined) {
    setFiles((f) => ({ ...f, [type]: file }));
    setActiveStep(3);
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

  const navigateToSection = (stepNum: number) => {
    setActiveStep(stepNum);
    if (stepNum === 1) {
      setIsSocialOpen(true);
      document.getElementById('section-social')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (stepNum === 2) {
      setIsFinancialOpen(true);
      document.getElementById('section-financial')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (stepNum === 3) {
      setIsDocumentsOpen(true);
      document.getElementById('section-documents')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSaveDraft = () => {
    setShowDraftToast(true);
    setTimeout(() => setShowDraftToast(false), 3000);
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard your draft? All unsaved inputs will be cleared.')) {
      setPersonal(emptyPersonal);
      setFinancial(emptyFinancial);
      setFiles({});
      setPersonalErrors({});
      setFinancialErrors({});
      setSubmitError('');
      navigateToSection(1);
    }
  };

  async function handleSubmit() {
    setSubmitError('');
    const isPersonalValid = validatePersonal();
    const isFinancialValid = validateFinancial();

    if (!isPersonalValid) {
      navigateToSection(1);
      setIsSocialOpen(true);
      return;
    }
    
    if (!isFinancialValid) {
      navigateToSection(2);
      setIsFinancialOpen(true);
      return;
    }

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
      const rawProfile: CitizenFinancialProfile = {
        monthly_income: Number(financial.monthlyIncome),
        existing_obligations: Number(financial.existingObligations),
        arrears_amount: Number(financial.arrearsAmount),
        delay_duration_months: Number(financial.delayDuration),
        missing_documents: missingDocs,
        has_expired_id: false,
        is_unemployed: false,
        has_temporary_circumstance: false,
        original_loan_amount: financial.originalLoanAmount ? Number(financial.originalLoanAmount) : undefined,
        remaining_loan_balance: financial.remainingLoanBalance ? Number(financial.remainingLoanBalance) : undefined,
        remaining_loan_period_months: financial.remainingLoanPeriod ? Number(financial.remainingLoanPeriod) : undefined,
        number_of_unpaid_instalments: financial.unpaidInstalments ? Number(financial.unpaidInstalments) : undefined,
        number_of_family_members: financial.numberOfFamilyMembers ? Number(financial.numberOfFamilyMembers) : 1,
      };
      const profile = sanitizeProfile(rawProfile);
      console.log('[Tayseer] Decision profile payload:', JSON.stringify(profile, null, 2));
      await runDecision(caseId, profile);

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
      
      {/* Toast Alert */}
      {showDraftToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#8e702e] text-white px-6 py-3 rounded-lg shadow-lg font-semibold text-sm transition-all animate-bounce">
          Draft saved successfully.
        </div>
      )}

      <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">
        <Header />

        {/* Toolbar Bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-end gap-3.5">
            <button
              onClick={handleSaveDraft}
              className="btn-gold-secondary"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Draft
            </button>
            <button
              onClick={handleDiscard}
              className="btn-gold-secondary"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Discard
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-gold flex items-center gap-2"
            >
              <svg className="w-4 h-4 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Submit Application
            </button>
          </div>
        </div>

        {/* Core Layout container */}
        <main className="max-w-7xl mx-auto px-6 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          
          {/* Left Column: Sticky Steps Sidebar */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
            <div className="bg-[#F4F2EB] rounded-2xl p-6 border border-gray-200 border-opacity-60 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 border-opacity-70">
                <div className="w-9 h-9 rounded-lg bg-[#8e702e] bg-opacity-10 flex items-center justify-center text-gold">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Application Steps</h3>
                  <p className="text-[11px] text-gray-400">Housing Debt Rescheduling</p>
                </div>
              </div>

              {/* Vertical Stepper */}
              <div className="space-y-6 relative pl-1 rtl:pl-0 rtl:pr-1">
                {/* Step 1 */}
                <div 
                  onClick={() => navigateToSection(1)}
                  className="flex gap-4 items-start cursor-pointer group relative"
                >
                  <div className="flex flex-col items-center z-10 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                      activeStep === 1 
                        ? 'bg-gold border-gold text-white shadow-sm' 
                        : 'border-gray-300 text-gray-400 bg-white group-hover:border-gold group-hover:text-gold'
                    }`}>
                      1
                    </div>
                    <div className="w-[1.5px] h-10 border-l border-dashed border-gray-300 mt-2"></div>
                  </div>
                  <div className="pt-0.5">
                    <p className={`font-bold text-xs transition-colors ${activeStep === 1 ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      Social Status
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Personal information & UAE PASS</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div 
                  onClick={() => navigateToSection(2)}
                  className="flex gap-4 items-start cursor-pointer group relative"
                >
                  <div className="flex flex-col items-center z-10 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                      activeStep === 2 
                        ? 'bg-gold border-gold text-white shadow-sm' 
                        : 'border-gray-300 text-gray-400 bg-white group-hover:border-gold group-hover:text-gold'
                    }`}>
                      2
                    </div>
                    <div className="w-[1.5px] h-10 border-l border-dashed border-gray-300 mt-2"></div>
                  </div>
                  <div className="pt-0.5">
                    <p className={`font-bold text-xs transition-colors ${activeStep === 2 ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      Assistance Request
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Financial and debt details</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div 
                  onClick={() => navigateToSection(3)}
                  className="flex gap-4 items-start cursor-pointer group relative"
                >
                  <div className="flex flex-col items-center z-10 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                      activeStep === 3 
                        ? 'bg-gold border-gold text-white shadow-sm' 
                        : 'border-gray-300 text-gray-400 bg-white group-hover:border-gold group-hover:text-gold'
                    }`}>
                      3
                    </div>
                  </div>
                  <div className="pt-0.5">
                    <p className={`font-bold text-xs transition-colors ${activeStep === 3 ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      Supporting Documents
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Upload required files</p>
                  </div>
                </div>
              </div>

              {/* Bottom divider and Need Help */}
              <div className="border-t border-gray-200 border-opacity-70 mt-6 pt-4 flex justify-center">
                <a 
                  href="mailto:support@moei.gov.ae" 
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Need Help?
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Stacked Accordion Sections */}
          <div className="lg:col-span-9 space-y-6">
            
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {submitError}
              </div>
            )}

            {/* Accordion 1: Social Status */}
            <div id="section-social" className="bg-white rounded-2xl border border-gray-200 border-opacity-65 shadow-sm overflow-hidden">
              <div 
                onClick={() => setIsSocialOpen(!isSocialOpen)}
                className="p-5 flex items-center justify-between cursor-pointer select-none bg-gray-50 bg-opacity-40 hover:bg-opacity-80 transition-all border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8e702e] text-white flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="font-bold text-base text-gray-800">Social Status</h2>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isSocialOpen ? 'transform rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isSocialOpen && (
                <div className="p-6 sm:p-8">
                  <StepPersonal data={personal} errors={personalErrors} onChange={updatePersonal} />
                </div>
              )}
            </div>

            {/* Accordion 2: Assistance Request Details */}
            <div id="section-financial" className="bg-white rounded-2xl border border-gray-200 border-opacity-65 shadow-sm overflow-hidden">
              <div 
                onClick={() => setIsFinancialOpen(!isFinancialOpen)}
                className="p-5 flex items-center justify-between cursor-pointer select-none bg-gray-50 bg-opacity-40 hover:bg-opacity-80 transition-all border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8e702e] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h2 className="font-bold text-base text-gray-800">Assistance Request Details</h2>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isFinancialOpen ? 'transform rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isFinancialOpen && (
                <div className="p-6 sm:p-8">
                  <StepFinancial data={financial} errors={financialErrors} onChange={updateFinancial} />
                </div>
              )}
            </div>

            {/* Accordion 3: Supporting Documents */}
            <div id="section-documents" className="bg-white rounded-2xl border border-gray-200 border-opacity-65 shadow-sm overflow-hidden">
              <div 
                onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
                className="p-5 flex items-center justify-between cursor-pointer select-none bg-gray-50 bg-opacity-40 hover:bg-opacity-80 transition-all border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8e702e] text-white flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h2 className="font-bold text-base text-gray-800">Supporting Documents</h2>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDocumentsOpen ? 'transform rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isDocumentsOpen && (
                <div className="p-6 sm:p-8">
                  <StepDocuments files={files} onChange={updateFile} />
                </div>
              )}
            </div>

          </div>
        </main>

        {/* Official Bilingual Footer */}
        <footer className="bg-gray-50 border-t border-gray-150 py-8 px-6 mt-16 text-sm text-gray-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gold">MOEI</span>
              <span className="text-gray-300">|</span>
              <span className="font-arabic font-semibold text-gold">تيسير</span>
              <span className="ml-2">© 2024 Ministry of Energy & Infrastructure. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gold transition-colors">Compliance</a>
              <a href="#" className="hover:text-gold transition-colors">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="w-14 h-14 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 text-lg mb-2">{t('processingTitle')}</h3>
            <p className="text-sm text-gray-600">{loadingMsg}</p>
          </div>
        </div>
      )}
    </>
  );
}
