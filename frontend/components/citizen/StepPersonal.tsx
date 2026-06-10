import { useLang } from '../../lib/LanguageContext';

export interface PersonalData {
  nameAr: string;
  nameEn: string;
  emiratesId: string;
  phone: string;
  email: string;
  socialStatus: string;
}

interface Props {
  data: PersonalData;
  errors: Partial<Record<keyof PersonalData, string>>;
  onChange: (field: keyof PersonalData, value: string) => void;
}

export default function StepPersonal({ data, errors, onChange }: Props) {
  const { t, isRtl } = useLang();

  // Function to mock-connect and pre-fill details from UAE PASS
  const handleConnectUAEPass = () => {
    onChange('nameAr', 'أحمد محمد سالم الرميثي');
    onChange('nameEn', 'Ahmed Mohamed Salem Al Rumaithi');
    onChange('emiratesId', '784-1985-7654321-1');
    onChange('phone', '+971 50 123 4567');
    onChange('email', 'ahmed.alrumaithi@example.ae');
  };

  return (
    <div className="space-y-6">
      {/* UAE PASS Banner */}
      <div className="bg-[#8e702e] rounded-xl p-5 flex items-center justify-between text-white shadow-sm flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white bg-opacity-10 flex items-center justify-center flex-shrink-0">
            {/* UAE PASS Logo Mock */}
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12.5l3 3 5-6" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-base tracking-wide">Log in with UAE PASS</h4>
            <p className="text-xs text-white text-opacity-80 mt-0.5">
              Faster application: We'll pre-fill your information automatically.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleConnectUAEPass}
          className="bg-white hover:bg-gray-50 text-gold font-bold text-sm py-2 px-6 rounded-lg shadow-sm transition-all active:scale-[0.98]"
        >
          Connect Now
        </button>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name (Arabic) */}
        <div>
          <label htmlFor="nameAr" className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
            <span>{t('nameAr')}</span>
            <span className="text-red-500 font-bold">*</span>
          </label>
          <input
            id="nameAr"
            type="text"
            dir="rtl"
            className="form-input text-right font-arabic"
            value={data.nameAr}
            onChange={(e) => onChange('nameAr', e.target.value)}
            placeholder="أحمد محمد سالم الرميثي"
          />
          {errors.nameAr && <p className="field-error">{errors.nameAr}</p>}
        </div>

        {/* Full Name (English) */}
        <div>
          <label htmlFor="nameEn" className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
            <span>{t('nameEn')}</span>
            <span className="text-red-500 font-bold">*</span>
          </label>
          <input
            id="nameEn"
            type="text"
            className="form-input"
            value={data.nameEn}
            onChange={(e) => onChange('nameEn', e.target.value)}
            placeholder="Ahmed Mohamed Salem Al Rumaithi"
          />
          {errors.nameEn && <p className="field-error">{errors.nameEn}</p>}
        </div>

        {/* Emirates ID */}
        <div>
          <label htmlFor="emiratesId" className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
            <span>{t('emiratesId')}</span>
            <span className="text-red-500 font-bold">*</span>
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

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
            <span>{t('phone')}</span>
            <span className="text-gray-400 font-normal text-xs">({t('optional')})</span>
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
      </div>

      {/* Email Address - Full Width */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
          <span>{t('email')}</span>
          <span className="text-gray-400 font-normal text-xs">({t('optional')})</span>
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

      {/* Social Status Dropdown */}
      <div>
        <label htmlFor="socialStatus" className="block text-sm font-semibold text-gray-700 mb-1.5">
          {t('socialStatus')}
        </label>
        <select
          id="socialStatus"
          className="form-input bg-white"
          value={data.socialStatus}
          onChange={(e) => onChange('socialStatus', e.target.value)}
        >
          <option value="Standard">{t('socialStatusStandard')}</option>
          <option value="Senior Citizen">{t('socialStatusSenior')}</option>
          <option value="Widow">{t('socialStatusWidow')}</option>
          <option value="Divorced">{t('socialStatusDivorced')}</option>
          <option value="Person of Determination">{t('socialStatusPOD')}</option>
          <option value="Married to Non-Citizen">{t('socialStatusMarriedNonCitizen')}</option>
        </select>
      </div>
    </div>
  );
}
