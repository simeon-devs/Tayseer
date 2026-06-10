import { useLang } from '../../lib/LanguageContext';

export interface FinancialData {
  monthlyIncome: string;
  existingObligations: string;
  arrearsAmount: string;
  delayDuration: string;
  reason: string;
  originalLoanAmount: string;
  remainingLoanBalance: string;
  remainingLoanPeriod: string;
  numberOfFamilyMembers: string;
}

interface Props {
  data: FinancialData;
  errors: Partial<Record<keyof FinancialData, string>>;
  onChange: (field: keyof FinancialData, value: string) => void;
}

export default function StepFinancial({ data, errors, onChange }: Props) {
  const { t } = useLang();

  return (
    <div className="space-y-6">
      {/* Row 1: Income, Obligations, Arrears */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <CurrencyField
          id="monthlyIncome"
          label={t('monthlyIncome')}
          required
          value={data.monthlyIncome}
          error={errors.monthlyIncome}
          currency={t('aed')}
          onChange={(v) => onChange('monthlyIncome', v)}
        />
        <CurrencyField
          id="existingObligations"
          label={t('existingObligations')}
          required
          hint={t('existingObligationsHint')}
          value={data.existingObligations}
          error={errors.existingObligations}
          currency={t('aed')}
          onChange={(v) => onChange('existingObligations', v)}
        />
        <CurrencyField
          id="arrearsAmount"
          label={t('arrearsAmount')}
          required
          hint={t('arrearsAmountHint')}
          value={data.arrearsAmount}
          error={errors.arrearsAmount}
          currency={t('aed')}
          onChange={(v) => onChange('arrearsAmount', v)}
        />
      </div>

      {/* Delay Duration: free number input (1–60 months) */}
      <div>
        <label htmlFor="delayDuration" className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
          <span>{t('delayDurationInput')}</span>
          <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          id="delayDuration"
          type="number"
          min="1"
          max="60"
          step="1"
          className="form-input"
          value={data.delayDuration}
          onChange={(e) => onChange('delayDuration', e.target.value)}
          placeholder="6"
        />
        <p className="text-xs text-gray-500 mt-1">{t('delayDurationInputHint')}</p>
        {errors.delayDuration && <p className="field-error">{errors.delayDuration}</p>}
      </div>

      {/* Loan Details Section */}
      <div className="border-t border-gray-100 pt-5">
        <h4 className="text-sm font-bold text-gray-800 mb-4">{t('loanDetailsSection')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <CurrencyField
            id="originalLoanAmount"
            label={t('originalLoanAmount')}
            optional
            hint={t('leaveBlankIfUnknown')}
            value={data.originalLoanAmount}
            error={errors.originalLoanAmount}
            currency={t('aed')}
            onChange={(v) => onChange('originalLoanAmount', v)}
          />
          <CurrencyField
            id="remainingLoanBalance"
            label={t('remainingLoanBalance')}
            optional
            hint={t('leaveBlankIfUnknown')}
            value={data.remainingLoanBalance}
            error={errors.remainingLoanBalance}
            currency={t('aed')}
            onChange={(v) => onChange('remainingLoanBalance', v)}
          />
          <div>
            <label htmlFor="remainingLoanPeriod" className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
              <span>{t('remainingLoanPeriod')}</span>
              <span className="text-gray-400 font-normal text-xs">({t('optional')})</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent">
              <input
                id="remainingLoanPeriod"
                type="number"
                min="1"
                step="1"
                className="flex-1 px-4 py-3 text-gray-900 outline-none bg-white"
                value={data.remainingLoanPeriod}
                onChange={(e) => onChange('remainingLoanPeriod', e.target.value)}
                placeholder="60"
              />
              <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm font-medium border-l border-gray-300 flex-shrink-0">
                {t('months')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('leaveBlankIfUnknown')}</p>
            {errors.remainingLoanPeriod && <p className="field-error">{errors.remainingLoanPeriod}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="numberOfFamilyMembers" className="form-label">
              {t('numberOfFamilyMembers')}
            </label>
            <input
              id="numberOfFamilyMembers"
              type="number"
              min="1"
              step="1"
              className="form-input"
              value={data.numberOfFamilyMembers}
              onChange={(e) => onChange('numberOfFamilyMembers', e.target.value)}
              placeholder="1"
            />
            <p className="text-xs text-gray-500 mt-1">{t('numberOfFamilyMembersHint')}</p>
            {errors.numberOfFamilyMembers && <p className="field-error">{errors.numberOfFamilyMembers}</p>}
          </div>
        </div>
      </div>

      {/* Reason for Request */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="reason" className="text-sm font-semibold text-gray-700">
            {t('reasonForRequest')} <span className="text-red-500 font-bold">*</span>
          </label>
          <span className="text-xs text-gray-400">{data.reason ? data.reason.length : 0}/500</span>
        </div>
        <textarea
          id="reason"
          rows={4}
          maxLength={500}
          className="form-input resize-none"
          value={data.reason}
          onChange={(e) => onChange('reason', e.target.value)}
          placeholder="Please describe your financial situation..."
        />
        {errors.reason && <p className="field-error">{errors.reason}</p>}
      </div>
    </div>
  );
}

interface CurrencyFieldProps {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  value: string;
  error?: string;
  currency: string;
  onChange: (v: string) => void;
}

function CurrencyField({ id, label, required, optional, hint, value, error, currency, onChange }: CurrencyFieldProps) {
  const { t } = useLang();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
        <span>{label}</span>
        {required && <span className="text-red-500 font-bold">*</span>}
        {optional && <span className="text-gray-400 font-normal text-xs">({t('optional')})</span>}
      </label>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent bg-white shadow-sm">
        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          className="flex-1 px-4 py-3 text-gray-900 outline-none bg-transparent w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
        />
        <span className="px-4 py-3 bg-gray-50 text-gray-500 text-sm font-medium border-l border-gray-300 flex-shrink-0">
          {currency}
        </span>
      </div>
      {hint && <p className="text-[11px] text-gray-400 mt-1 leading-normal">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
