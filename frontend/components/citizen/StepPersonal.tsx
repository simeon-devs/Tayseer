import { useLang } from '../../lib/LanguageContext';

export interface PersonalData {
  nameAr: string;
  nameEn: string;
  emiratesId: string;
  phone: string;
  email: string;
}

interface Props {
  data: PersonalData;
  errors: Partial<Record<keyof PersonalData, string>>;
  onChange: (field: keyof PersonalData, value: string) => void;
}

export default function StepPersonal({ data, errors, onChange }: Props) {
  const { t } = useLang();

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="nameAr" className="form-label">
          {t('nameAr')} <Required />
        </label>
        <input
          id="nameAr"
          type="text"
          dir="rtl"
          className="form-input"
          value={data.nameAr}
          onChange={(e) => onChange('nameAr', e.target.value)}
          placeholder="محمد عبدالله الرشيدي"
        />
        {errors.nameAr && <p className="field-error">{errors.nameAr}</p>}
      </div>

      <div>
        <label htmlFor="nameEn" className="form-label">
          {t('nameEn')} <Required />
        </label>
        <input
          id="nameEn"
          type="text"
          className="form-input"
          value={data.nameEn}
          onChange={(e) => onChange('nameEn', e.target.value)}
          placeholder="Mohammed Al Rashidi"
        />
        {errors.nameEn && <p className="field-error">{errors.nameEn}</p>}
      </div>

      <div>
        <label htmlFor="emiratesId" className="form-label">
          {t('emiratesId')} <Required />
        </label>
        <input
          id="emiratesId"
          type="text"
          className="form-input font-mono"
          value={data.emiratesId}
          onChange={(e) => onChange('emiratesId', e.target.value)}
          placeholder={t('emiratesIdPlaceholder')}
        />
        {errors.emiratesId && <p className="field-error">{errors.emiratesId}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className="form-label">
            {t('phone')} <Optional />
          </label>
          <input
            id="phone"
            type="tel"
            className="form-input"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder={t('phonePlaceholder')}
          />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            {t('email')} <Optional />
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder={t('emailPlaceholder')}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
      </div>
    </div>
  );
}

function Required() {
  return <span className="text-red-500 ms-0.5">*</span>;
}

function Optional() {
  const { t } = useLang();
  return <span className="text-gray-400 font-normal ms-1 text-xs">({t('optional')})</span>;
}
