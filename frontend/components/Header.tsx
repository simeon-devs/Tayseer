import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLang } from '../lib/LanguageContext';
import { useAccessibility } from '../lib/AccessibilityContext';

export default function Header() {
  const { t, lang, setLang, isRtl } = useLang();
  const { setIsPanelOpen } = useAccessibility();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Treat as authenticated if the UAE PASS simulation cookie is set, or if we are in staff dashboard
    const isAuth = sessionStorage.getItem('uae_pass_authenticated') === '1' || router.pathname.startsWith('/staff');
    setIsAuthenticated(isAuth);
  }, [router.pathname]);

  const isCitizen = router.pathname.startsWith('/citizen');
  const isStaff = router.pathname.startsWith('/staff');

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">

        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <img src="/moei_logo.png" alt="MOEI Logo" className="h-10 w-auto" />
          <div className="flex flex-col border-l border-gray-200 pl-3 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-3">
            <span className="font-bold text-gray-800 text-lg leading-tight">Tayseer | تيسير</span>
            <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase leading-none mt-0.5">
              {lang === 'ar' ? 'وزارة الطاقة والبنية التحتية' : 'Ministry of Energy & Infrastructure'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        {isCitizen && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            <Link
              href="/citizen"
              className={`hover:text-[#8E702E] transition-colors ${
                router.pathname === '/citizen' || router.pathname.includes('/decision')
                  ? 'text-[#8E702E] border-b-2 border-[#8E702E] pb-1'
                  : ''
              }`}
            >
              {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </Link>
            <Link href="/citizen/applications" className="hover:text-[#8E702E] transition-colors">
              {lang === 'ar' ? 'طلباتي' : 'My Applications'}
            </Link>
            <Link href="#" className="hover:text-[#8E702E] transition-colors">
              {lang === 'ar' ? 'اتصل بالدعم' : 'Contact Support'}
            </Link>
          </nav>
        )}
        {isStaff && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            <Link
              href="/staff/cases"
              className={`hover:text-[#8E702E] transition-colors ${
                router.pathname.includes('/staff/cases')
                  ? 'text-[#8E702E] border-b-2 border-[#8E702E] pb-1'
                  : ''
              }`}
            >
              {lang === 'ar' ? 'قائمة الطلبات' : 'Cases'}
            </Link>
            <Link
              href="/staff/analytics"
              className={`hover:text-[#8E702E] transition-colors ${
                router.pathname.includes('/staff/analytics')
                  ? 'text-[#8E702E] border-b-2 border-[#8E702E] pb-1'
                  : ''
              }`}
            >
              {lang === 'ar' ? 'التحليلات' : 'Analytics'}
            </Link>
          </nav>
        )}

        {/* Header Right Actions */}
        <div className="flex items-center gap-6">
          {/* Language Selector Link */}
          <div className="flex items-center gap-4">
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
            
            <div className="flex items-center bg-[#F4F2EB] rounded-full p-0.5 border border-gray-200/50">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`text-[10px] font-bold py-1.5 px-3 rounded-full transition-all ${
                  lang === 'en'
                    ? 'bg-[#8E702E] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`text-[10px] font-bold py-1.5 px-3 rounded-full transition-all ${
                  lang === 'ar'
                    ? 'bg-[#8E702E] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                AR
              </button>
            </div>
          </div>

          {!isAuthenticated ? (
            /* UAE PASS Login button */
            <button
              onClick={() => {
                sessionStorage.setItem('uae_pass_authenticated', '1');
                window.location.reload();
              }}
              className="bg-gold hover:bg-gold-dark text-white font-semibold text-sm py-2 px-4 rounded transition-colors"
            >
              UAE PASS Login
            </button>
          ) : (
            /* Icon Actions shown when authenticated */
            <div className="flex items-center gap-4 text-gray-500 border-l border-gray-200 pl-4 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-4">
              {/* Bell Icon with Notification indicator */}
              <button className="hover:text-gold transition-colors relative" aria-label="Notifications">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <span className="absolute top-0.5 right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              {/* Avatar Profile Icon */}
              <button className="hover:text-gold transition-colors rounded-full border border-gray-200 p-0.5" aria-label="Profile">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
