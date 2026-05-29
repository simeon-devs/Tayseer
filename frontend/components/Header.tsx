import { useLang } from '../lib/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const { t, isRtl } = useLang();

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-3">
            <ShieldIcon />
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {t('appName')}
                <span className="mx-2 opacity-50">|</span>
                <span className="font-normal opacity-90">{isRtl ? 'Tayseer' : 'تيسير'}</span>
              </h1>
              <p className="text-xs opacity-75 mt-0.5">{t('tagline')}</p>
            </div>
          </div>
        </div>
        <LanguageToggle />
      </div>
    </header>
  );
}

function ShieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-9 w-9 text-accent flex-shrink-0"
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
