import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useLang } from '../../lib/LanguageContext';
import { useAccessibility } from '../../lib/AccessibilityContext';

export default function UAEPassLogin() {
  const { t, lang, setLang } = useLang();
  const { setIsPanelOpen } = useAccessibility();
  const router = useRouter();
  const [simulating, setSimulating] = useState(false);

  function handleSignIn() {
    setSimulating(true);
    setTimeout(() => {
      sessionStorage.setItem('uae_pass_authenticated', '1');
      router.push('/citizen');
    }, 1800);
  }

  const toggleLanguage = (l: 'en' | 'ar') => {
    setLang(l);
  };

  return (
    <>
      <Head>
        <title>{`${t('appName')} - ${t('uaePassTitle')}`}</title>
      </Head>
      
      <div className={`min-h-screen bg-[#FAF9F6] flex flex-col font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
        
        {/* Header Bar */}
        <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between w-full">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <img src="/moei_logo.png" alt="MOEI Logo" className="h-10 w-auto" />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-5">
            {/* Accessibility Trigger Button */}
            <button
              onClick={() => setIsPanelOpen(true)}
              className="text-gray-500 hover:text-[#8E702E] transition-colors p-1.5 rounded-full hover:bg-gray-50 flex items-center justify-center"
              title={lang === 'ar' ? 'خيارات سهولة الوصول' : 'Accessibility Options'}
              aria-label={lang === 'ar' ? 'خيارات سهولة الوصول' : 'Accessibility Options'}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v10" />
                <path d="M8 10h8" />
                <path d="M8 21l4-4 4 4" />
              </svg>
            </button>

            {/* Pill-shaped Language Toggle */}
            <div className="flex items-center bg-[#F4F2EB] rounded-full p-0.5 border border-gray-200/50">
              <button
                type="button"
                onClick={() => toggleLanguage('en')}
                className={`text-[10px] font-bold py-1 px-3 rounded-full transition-all ${
                  lang === 'en'
                    ? 'bg-gold text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => toggleLanguage('ar')}
                className={`text-[10px] font-bold py-1 px-3 rounded-full transition-all ${
                  lang === 'ar'
                    ? 'bg-gold text-white shadow-sm font-arabic'
                    : 'text-gray-400 hover:text-gray-600 font-arabic'
                }`}
              >
                AR
              </button>
            </div>

            {/* Help Link */}
            <button className="text-gray-400 hover:text-gold transition-colors" aria-label="Help">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Globe Link */}
            <button className="text-gray-400 hover:text-gold transition-colors" aria-label="Globe">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-6 w-full max-w-7xl mx-auto">
          
          {/* Card Container */}
          <div className="w-full max-w-[460px] bg-white rounded-2xl border border-gray-200 border-opacity-70 shadow-sm p-8 text-center mt-2">
            
            {/* UAE PASS Gold Circle Emblem */}
            <div className="w-16 h-16 rounded-xl bg-gold flex items-center justify-center mx-auto mb-6 shadow-sm text-white">
              <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            {/* Titles */}
            <h1 className="text-xl font-bold text-gold tracking-wide">
              {t('uaePassTitle')}
            </h1>
            <p className="text-[13px] text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
              {t('uaePassSubtitle')}
            </p>

            {/* Action Button */}
            <button
              onClick={handleSignIn}
              disabled={simulating}
              className="w-full py-3.5 px-6 rounded-lg font-bold text-white bg-gold hover:bg-gold-dark transition-all disabled:opacity-60 flex items-center justify-center gap-3 mt-8 shadow-sm active:scale-[0.98]"
            >
              {simulating ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('uaePassSimulating')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  {t('uaePassButton')}
                </>
              )}
            </button>

            {/* Disclaimer */}
            <p className="text-[11px] text-gray-400 mt-6 leading-relaxed border-t border-gray-100 pt-5 px-1 italic">
              {t('uaePassDisclaimer')}
            </p>

            {/* Bottom Links */}
            <div className="flex items-center justify-center gap-2 mt-6 text-xs">
              <a 
                href="https://selfservice.uaepass.ae/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gold font-bold hover:underline"
              >
                {lang === 'ar' ? 'ما هي الهوية الرقمية؟' : 'What is UAE PASS?'}
              </a>
              <span className="text-gray-300">•</span>
              <a 
                href="mailto:support@moei.gov.ae" 
                className="text-gold font-bold hover:underline"
              >
                {lang === 'ar' ? 'الدعم الفني' : 'Support'}
              </a>
            </div>
          </div>

          {/* Bottom horizontal banner image card */}
          <div className="w-full max-w-[940px] h-48 sm:h-56 rounded-2xl overflow-hidden relative shadow-sm mt-10">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('/uae_towers.png')` }}
            />
            {/* Elegant dark gold gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold/95 via-gold/60 to-transparent rtl:bg-gradient-to-l rtl:from-gold/95 rtl:via-gold/60 rtl:to-transparent" />
            
            {/* Banner content */}
            <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-center h-full max-w-lg text-white text-left rtl:text-right">
              <h2 className="font-bold text-2xl sm:text-3xl leading-tight">
                {lang === 'ar' ? 'تكامل سلس' : 'Seamless Integration'}
              </h2>
              <p className="text-xs sm:text-sm text-white text-opacity-90 mt-2.5 leading-relaxed font-medium">
                {lang === 'ar' 
                  ? 'إدارة إعادة جدولة التزاماتك السكنية بأمان عبر البنية الرقمية لدولة الإمارات.' 
                  : 'Securely managing your housing rescheduling with the latest UAE digital infrastructure.'}
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-6 border-t border-gray-200 border-opacity-70 flex flex-col md:flex-row items-center justify-between gap-4 w-full mt-auto text-xs text-gray-400">
          <div>
            <span className="font-bold text-gray-700">MOEI</span>
            <p className="mt-0.5">© 2024 Housing Arrears Management System. All rights reserved. Government of UAE.</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gold transition-colors">Contact Us</a>
          </div>
        </footer>

      </div>
    </>
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
