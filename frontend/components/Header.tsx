import { useLang } from '../lib/LanguageContext';

export default function Header() {
  const { t, lang, setLang, isRtl } = useLang();

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <img src="/moei_logo.png" alt="MOEI Logo" className="h-10 w-auto" />
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-6">
          {/* Language Selector Link */}
          <button
            onClick={toggleLanguage}
            className="text-sm font-semibold text-gray-500 hover:text-gold transition-colors"
          >
            EN/AR
          </button>

          {/* UAE PASS Login button */}
          <button
            onClick={() => {
              sessionStorage.setItem('uae_pass_authenticated', '1');
              window.location.reload();
            }}
            className="bg-gold hover:bg-gold-dark text-white font-semibold text-sm py-2 px-4 rounded transition-colors"
          >
            UAE PASS Login
          </button>

          {/* Icon Actions */}
          <div className="flex items-center gap-4 text-gray-500 border-l border-gray-200 pl-4 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-4">
            {/* Globe Icon */}
            <button className="hover:text-gold transition-colors" aria-label="Globe">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
              </svg>
            </button>

            {/* Bell Icon */}
            <button className="hover:text-gold transition-colors relative" aria-label="Notifications">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Avatar Profile Icon */}
            <button className="hover:text-gold transition-colors rounded-full border border-gray-200 p-0.5" aria-label="Profile">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function GoldShieldLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-7 h-7 text-gold flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}
