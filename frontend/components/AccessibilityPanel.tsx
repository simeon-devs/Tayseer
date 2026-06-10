import React, { useEffect, useRef } from 'react';
import { useAccessibility } from '../lib/AccessibilityContext';
import { useLang } from '../lib/LanguageContext';
import { getA11yString } from '../lib/accessibilityStrings';
import AccessibilitySettings from './AccessibilitySettings';

export default function AccessibilityPanel() {
  const { lang } = useLang();
  const { isPanelOpen, setIsPanelOpen, resetAll } = useAccessibility();
  const panelRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';
  const t = (key: string) => getA11yString(lang, key);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) setIsPanelOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, setIsPanelOpen]);

  useEffect(() => {
    document.body.style.overflow = isPanelOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isPanelOpen]);

  useEffect(() => {
    if (!isPanelOpen || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { last.focus(); e.preventDefault(); }
      } else {
        if (document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    };
    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [isPanelOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/45 backdrop-blur-sm z-50 transition-opacity duration-300 ${isPanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsPanelOpen(false)}
      />

      <div
        ref={panelRef}
        id="a11y-options-panel"
        role="dialog"
        aria-label={t('a11yTitle')}
        aria-hidden={!isPanelOpen}
        className={`fixed top-0 bottom-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : isRtl ? '-translate-x-full' : 'translate-x-full'} ${isRtl ? 'left-0 border-r border-gray-100' : 'right-0 border-l border-gray-100'}`}
      >
        <div className="h-16 border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#8E702E]/10 rounded-lg text-[#8E702E]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="2" /><path d="M12 7v10" /><path d="M8 10h8" /><path d="M8 21l4-4 4 4" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900 leading-none">{t('a11yTitle')}</h2>
          </div>
          <button onClick={() => setIsPanelOpen(false)} aria-label={t('closePanel')}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8E702E] outline-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-7">
          <AccessibilitySettings isRtl={isRtl} />
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3 flex-shrink-0">
          <button onClick={resetAll}
            className="w-full py-2.5 px-4 bg-gray-200 hover:bg-gray-300/80 text-gray-700 font-bold text-xs rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#8E702E] flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18V4" />
            </svg>
            {t('reset')}
          </button>
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
            <span>{t('version')}</span>
            <span>{lang === 'ar' ? 'البوابة الإلكترونية' : 'Ministry Portal'}</span>
          </div>
        </div>
      </div>
    </>
  );
}
