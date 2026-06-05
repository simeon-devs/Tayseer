import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useLang } from '../../lib/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function UAEPassLogin() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [simulating, setSimulating] = useState(false);

  function handleSignIn() {
    setSimulating(true);
    setTimeout(() => {
      sessionStorage.setItem('uae_pass_authenticated', '1');
      router.push('/citizen');
    }, 1800);
  }

  return (
    <>
      <Head>
        <title>{t('appName')} - {t('uaePassTitle')}</title>
      </Head>
      <div className={`min-h-screen bg-surface flex flex-col ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="flex justify-end p-4">
          <LanguageToggle />
        </div>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <UAEPassLogo />

              <h1 className="text-xl font-bold text-gray-900 mt-6 mb-2">
                {t('uaePassTitle')}
              </h1>
              <p className="text-sm text-gray-500 mb-8">
                {t('uaePassSubtitle')}
              </p>

              <button
                onClick={handleSignIn}
                disabled={simulating}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-[#003087] hover:bg-[#002070] transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
              >
                {simulating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('uaePassSimulating')}
                  </>
                ) : (
                  <>
                    <UAEPassShield />
                    {t('uaePassButton')}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 mt-6 leading-relaxed">
                {t('uaePassDisclaimer')}
              </p>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              {lang === 'ar'
                ? 'تيسير | نظام إعادة جدولة الديون السكنية'
                : 'Tayseer | Housing Arrears Rescheduling System'}
            </p>
          </div>
        </main>
      </div>
    </>
  );
}

function UAEPassLogo() {
  return (
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#003087] mx-auto shadow-md">
      <svg viewBox="0 0 60 60" className="w-12 h-12" fill="none">
        <circle cx="30" cy="30" r="26" stroke="white" strokeWidth="2.5" />
        <path
          d="M20 30 L28 38 L42 22"
          stroke="#00C896"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M30 10 L30 16 M30 44 L30 50 M10 30 L16 30 M44 30 L50 30"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}

function UAEPassShield() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
