import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { Lang, makeTranslator } from './i18n';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => undefined,
  t: (k) => k,
  isRtl: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = l;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, []);

  const t = useMemo(() => makeTranslator(lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
