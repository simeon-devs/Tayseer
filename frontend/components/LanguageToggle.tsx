import { useLang } from '../lib/LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center bg-white bg-opacity-10 rounded-full p-0.5 gap-0.5">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
          lang === 'en'
            ? 'bg-white text-primary'
            : 'text-white hover:bg-white hover:bg-opacity-20'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLang('ar')}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
          lang === 'ar'
            ? 'bg-white text-primary'
            : 'text-white hover:bg-white hover:bg-opacity-20'
        }`}
        aria-pressed={lang === 'ar'}
      >
        عر
      </button>
    </div>
  );
}
