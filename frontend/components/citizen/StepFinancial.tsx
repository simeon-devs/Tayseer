import { useLang } from '../../lib/LanguageContext';

export interface FinancialData {
  monthlyIncome: string;
  existingObligations: string;
  arrearsAmount: string;
  delayDuration: string;
  reason: string;
}

interface Props {
  data: FinancialData;
  errors: Partial<Record<keyof FinancialData, string>>;
  onChange: (field: keyof FinancialData, value: string) => void;
}

export default function StepFinancial({ data, errors, onChange }: Props) {
  const { t } = useLang();

  return (
    <div className="space-y-5">
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
