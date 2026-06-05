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
  unpaidInstalments: string;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <CurrencyField
          id="monthlyIncome"
          label={`${t('monthlyIncome')} *`}
          value={data.monthlyIncome}
          error={errors.monthlyIncome}
          currency={t('aed')}
          onChange={(v) => onChange('monthlyIncome', v)}
        />

        <CurrencyField
          id="existingObligations"
          label={`${t('existingObligations')} *`}
          hint={t('existingObligationsHint')}
          value={data.existingObligations}
          error={errors.existingObligations}
          currency={t('aed')}
          onChange={(v) => onChange('existingObligations', v)}
        />

        <CurrencyField
          id="arrearsAmount"
          label={`${t('arrearsAmount')} *`}
          hint={t('arrearsAmountHint')}
          value={data.arrearsAmount}
          error={errors.arrearsAmount}
          currency={t('aed')}
          onChange={(v) => onChange('arrearsAmount', v)}
        />

        <div>
          <label htmlFor="delayDuration" className="form-label">
            {t('delayDuration')} <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
            <input
              id="delayDuration"
              type="number"
              min="1"
              step="1"
              className="flex-1 px-4 py-3 text-gray-900 outline-none bg-white"
              value={data.delayDuration}
              onChange={(e) => onChange('delayDuration', e.target.value)}
              placeholder="3"
            />
            <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm font-medium border-l border-gray-300">
              {t('months')}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t('delayDurationHint')}</p>
          {errors.delayDuration && <p className="field-error">{errors.delayDuration}</p>}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">{t('loanDetailsSection')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <CurrencyField
            id="originalLoanAmount"
            label={t('originalLoanAmount')}
            value={data.originalLoanAmount}
            error={errors.originalLoanAmount}
            currency={t('aed')}
            onChange={(v) => onChange('originalLoanAmount', v)}
          />

          <CurrencyField
            id="remainingLoanBalance"
            label={t('remainingLoanBalance')}
            value={data.remainingLoanBalance}
            error={errors.remainingLoanBalance}
            currency={t('aed')}
            onChange={(v) => onChange('remainingLoanBalance', v)}
          />

          <div>
            <label htmlFor="remainingLoanPeriod" className="form-label">
              {t('remainingLoanPeriod')}
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
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
              <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm font-medium border-l border-gray-300">
                {t('months')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('remainingLoanPeriodHint')}</p>
            {errors.remainingLoanPeriod && <p className="field-error">{errors.remainingLoanPeriod}</p>}
          </div>

          <div>
            <label htmlFor="unpaidInstalments" className="form-label">
              {t('unpaidInstalments')}
            </label>
            <input
              id="unpaidInstalments"
              type="number"
              min="0"
              step="1"
              className="form-input"
              value={data.unpaidInstalments}
              onChange={(e) => onChange('unpaidInstalments', e.target.value)}
              placeholder="0"
            />
            {errors.unpaidInstalments && <p className="field-error">{errors.unpaidInstalments}</p>}
          </div>

          <div>
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

      <div>
        <label htmlFor="reason" className="form-label">
          {t('reasonForRequest')} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="reason"
          rows={4}
          className="form-input resize-none"
          value={data.reason}
          onChange={(e) => onChange('reason', e.target.value)}
          placeholder={t('reasonPlaceholder')}
        />
        {errors.reason && <p className="field-error">{errors.reason}</p>}
      </div>
    </div>
  );
}

interface CurrencyFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  currency: string;
  onChange: (v: string) => void;
}

function CurrencyField({ id, label, hint, value, error, currency, onChange }: CurrencyFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
        <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-300 flex-shrink-0">
          {currency}
        </span>
        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          className="flex-1 px-4 py-3 text-gray-900 outline-none bg-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
        />
      </div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
