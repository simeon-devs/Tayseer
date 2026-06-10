import React, { useEffect, useRef } from 'react';
import { useAccessibility } from '../lib/AccessibilityContext';
import { useLang } from '../lib/LanguageContext';

export default function AccessibilityPanel() {
  const { lang } = useLang();
  const {
    isPanelOpen,
    setIsPanelOpen,
    dyslexicFont,
    contrastMode,
    saturation,
    bigCursor,
    textScale,
    letterSpacing,
    lineSpacing,
    highlightLinks,
    readSpeakerActive,
    seizureSafety,
    adhdActive,
    colorBlindMode,
    activeProfile,
    setDyslexicFont,
    setContrastMode,
    setSaturation,
    setBigCursor,
    setTextScale,
    setLetterSpacing,
    setLineSpacing,
    setHighlightLinks,
    setReadSpeakerActive,
    setSeizureSafety,
    setAdhdActive,
    setColorBlindMode,
    activateProfile,
    resetAll,
  } = useAccessibility();

  const panelRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  // Keyboard close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) {
        setIsPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, setIsPanelOpen]);

  // Prevent scroll when open
  useEffect(() => {
    if (isPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPanelOpen]);

  // Focus trapping when open
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
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [isPanelOpen]);

  // Translations
  const t = (key: string): string => {
    const strings: Record<string, Record<string, string>> = {
      en: {
        a11yTitle: 'Accessibility Options',
        closePanel: 'Close Accessibility Menu',
        profilesSection: 'Accessibility Profiles',
        adjustersSection: 'Granular Adjustments',
        reset: 'Reset All Options',
        version: 'Portal v1.2.0',
        visuallyImpaired: 'Visually Impaired',
        visuallyImpairedDesc: 'High contrast, scaled text, large cursor',
        dyslexic: 'Dyslexic Font',
        dyslexicDesc: 'Specialized typeface for reading clarity',
        adhd: 'ADHD Friendly',
        adhdDesc: 'Focus tools and comfortable spacings',
        colorBlind: 'Color Blind Mode',
        colorBlindDesc: 'Custom filter for green/red weakness',
        cognitive: 'Cognitive Support',
        cognitiveDesc: 'Speech assist, highlighted targets & reduced motion safety',
        carouselTitle1: 'Base Settings',
        carouselDesc1: 'Typography, scale, spacing and layout options.',
        carouselTitle2: 'Seizure Safety',
        carouselDesc2: 'Cap saturation, stop motion and animations.',
        carouselTitle3: 'Color Correction',
        carouselDesc3: 'Tailored options for deuteranopia & protanopia.',
        textScale: 'Text Size',
        fontDyslexic: 'Dyslexic Fonts',
        fontDyslexicDesc: 'Adapt font for dyslexic readability',
        contrast: 'Contrast Mode',
        contrastDefault: 'Default',
        contrastHigh: 'High Contrast (B&W)',
        contrastInverted: 'Inverted (W&B)',
        contrastDark: 'Dark Mode',
        contrastYellowNavy: 'Yellow on Navy',
        satMode: 'Saturation Control',
        satDefault: 'Default',
        satLow: 'Low Saturation',
        satHigh: 'High Saturation',
        satMono: 'Grayscale',
        cursorBig: 'Big Cursor',
        cursorBigDesc: 'Increase cursor size for visibility',
        spacingLetter: 'Letter Spacing',
        spacingLine: 'Line Spacing',
        letterSpacingDefault: 'Default',
        letterSpacingWide: 'Wide',
        letterSpacingWider: 'Wider',
        letterSpacingWidest: 'Widest',
        lineSpacingDefault: 'Default',
        lineSpacingComfortable: 'Comfortable',
        lineSpacingLoose: 'Loose',
        lineSpacingExtraLoose: 'Extra Loose',
        highlightLinks: 'Highlight Links',
        highlightLinksDesc: 'Add underline & borders to links',
        readSpeaker: 'Speech Co-Pilot',
        readSpeakerDesc: 'Read text aloud on hover/focus',
        seizureSafety: 'Seizure Safe Mode',
        seizureSafetyDesc: 'Stop flash risks & slow animation',
        adhdFocus: 'ADHD Reading Ruler',
        adhdFocusDesc: 'Add a sliding ruler to assist reading focus',
        cbMode: 'Color Blind Mode',
        cbNone: 'None',
        cbDeuteranopia: 'Deuteranopia',
        cbProtanopia: 'Protanopia',
        cbTritanopia: 'Tritanopia',
        active: 'Active',
        featurePreviews: 'Feature Previews',
      },
      ar: {
        a11yTitle: 'خيارات سهولة الوصول',
        closePanel: 'أغلق قائمة سهولة الوصول',
        profilesSection: 'ملفات سهولة الوصول الجاهزة',
        adjustersSection: 'التعديلات التفصيلية',
        reset: 'إعادة تعيين كافة الخيارات',
        version: 'بوابة الإصدار 1.2.0',
        visuallyImpaired: 'ضعاف البصر',
        visuallyImpairedDesc: 'تباين عالٍ، تكبير النص، ومؤشر كبير',
        dyslexic: 'خط عسر القراءة',
        dyslexicDesc: 'تطبيق خطوط خاصة ومريحة للقراءة',
        adhd: 'صديق لـ ADHD',
        adhdDesc: 'أدوات التركيز البصري وتباعد مريح',
        colorBlind: 'حالة عمى الألوان',
        colorBlindDesc: 'تفعيل فلاتر تباين مخصصة لعمى الألوان',
        cognitive: 'الدعم المعرفي',
        cognitiveDesc: 'تمييز الروابط، القراءة الصوتية، وحركة آمنة',
        carouselTitle1: 'الإعدادات الأساسية',
        carouselDesc1: 'تعديلات الخطوط والأحجام والتباعد المناسبة للقراءة.',
        carouselTitle2: 'حماية الصرع',
        carouselDesc2: 'تقليل الوميض وإيقاف الحركة والتحكم بالتشبع.',
        carouselTitle3: 'تصحيح الألوان',
        carouselDesc3: 'فلاتر بصرية مخصصة لمختلف حالات عمى الألوان.',
        textScale: 'حجم النص',
        fontDyslexic: 'خط عسر القراءة',
        fontDyslexicDesc: 'تحسين شكل الخط ليسهل القراءة لمن يعانون من عسر القراءة',
        contrast: 'وضع التباين',
        contrastDefault: 'الافتراضي',
        contrastHigh: 'تباين عالٍ (أبيض وأسود)',
        contrastInverted: 'تباين معكوس (أسود وأبيض)',
        contrastDark: 'الوضع الداكن',
        contrastYellowNavy: 'أصفر على كحلي',
        satMode: 'التحكم بالتشبع',
        satDefault: 'الافتراضي',
        satLow: 'تشبع منخفض',
        satHigh: 'تشبع مرتفع',
        satMono: 'أحادي اللون (رمادي)',
        cursorBig: 'مؤشر كبير',
        cursorBigDesc: 'تكبير حجم مؤشر الماوس لزيادة وضوحه',
        spacingLetter: 'تباعد الأحرف',
        spacingLine: 'تباعد السطور',
        letterSpacingDefault: 'الافتراضي',
        letterSpacingWide: 'واسع',
        letterSpacingWider: 'أوسع',
        letterSpacingWidest: 'الأوسع',
        lineSpacingDefault: 'الافتراضي',
        lineSpacingComfortable: 'مريح',
        lineSpacingLoose: 'واسع',
        lineSpacingExtraLoose: 'واسع جداً',
        highlightLinks: 'تمييز الروابط',
        highlightLinksDesc: 'إضافة خطوط وحدود حول جميع الروابط النشطة',
        readSpeaker: 'المساعد الصوتي',
        readSpeakerDesc: 'نطق النصوص المكتوبة عند تمرير الماوس عليها',
        seizureSafety: 'حماية الصرع',
        seizureSafetyDesc: 'إلغاء التحريكات والوميض لضمان السلامة الكاملة',
        adhdFocus: 'محدد التركيز (ADHD)',
        adhdFocusDesc: 'إضافة مسطرة قراءة متحركة للتركيز البصري',
        cbMode: 'نوع عمى الألوان',
        cbNone: 'بلا',
        cbDeuteranopia: 'دوتيرانوبيا',
        cbProtanopia: 'بروتانوبيا',
        cbTritanopia: 'تريتانوبيا',
        active: 'نشط',
        featurePreviews: 'نظرة عامة على الميزات',
      },
    };
    return strings[lang]?.[key] ?? key;
  };

  const profiles = [
    {
      id: 'visually-impaired',
      title: t('visuallyImpaired'),
      desc: t('visuallyImpairedDesc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      id: 'dyslexic',
      title: t('dyslexic'),
      desc: t('dyslexicDesc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
      )
    },
    {
      id: 'adhd',
      title: t('adhd'),
      desc: t('adhdDesc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    {
      id: 'color-blind',
      title: t('colorBlind'),
      desc: t('colorBlindDesc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
        </svg>
      )
    },
    {
      id: 'cognitive',
      title: t('cognitive'),
      desc: t('cognitiveDesc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.808 13.019A5.969 5.969 0 0112 15a5.969 5.969 0 013.842 1.356" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* ── Backdrop Overlay ── */}
      <div
        className={`fixed inset-0 bg-black/45 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isPanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsPanelOpen(false)}
      />

      {/* ── Sidebar Drawer Panel ── */}
      <div
        ref={panelRef}
        id="a11y-options-panel"
        role="dialog"
        aria-label={t('a11yTitle')}
        aria-hidden={!isPanelOpen}
        className={`fixed top-0 bottom-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isPanelOpen
            ? 'translate-x-0'
            : isRtl
            ? '-translate-x-full'
            : 'translate-x-full'
        } ${isRtl ? 'left-0 border-r border-gray-100' : 'right-0 border-l border-gray-100'}`}
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#8E702E]/10 rounded-lg text-[#8E702E]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v10" />
                <path d="M8 10h8" />
                <path d="M8 21l4-4 4 4" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900 leading-none">
              {t('a11yTitle')}
            </h2>
          </div>
          <button
            onClick={() => setIsPanelOpen(false)}
            aria-label={t('closePanel')}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8E702E] outline-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7">

          {/* Preset Profiles Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase">
              {t('profilesSection')}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {profiles.map((p) => {
                const isActive = activeProfile === p.id;
                const isFullWidth = p.id === 'cognitive';
                return (
                  <button
                    key={p.id}
                    onClick={() => activateProfile(isActive ? null : p.id)}
                    className={`flex flex-col text-left rtl:text-right p-4 rounded-xl border transition-all duration-200 ${
                      isFullWidth ? 'col-span-2' : 'col-span-1'
                    } ${
                      isActive
                        ? 'border-[#8E702E] bg-[#FAF9F6] ring-2 ring-[#8E702E]/10'
                        : 'border-gray-200 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full mb-3">
                      <div className={`p-1.5 rounded-lg transition-colors duration-200 ${isActive ? 'bg-[#8E702E]/15 text-[#8E702E]' : 'bg-gray-100 text-gray-400'}`}>
                        {p.icon}
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 ${
                        isActive ? 'border-[#8E702E] bg-[#8E702E]' : 'border-gray-300 bg-white'
                      }`}>
                        {isActive && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    <span className="font-bold text-xs text-gray-900 leading-tight">
                      {p.title}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 leading-normal">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Adjusters Section */}
          <div className="space-y-5 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase">
              {t('adjustersSection')}
            </h3>

            {/* Text Scale Slider */}
            <div className="space-y-2 bg-[#FAF9F6] border border-gray-100/50 p-4 rounded-xl">
              <label htmlFor="a11y-text-scaler" className="flex justify-between text-xs font-bold text-gray-700">
                <span>{t('textScale')}</span>
                <span className="text-[#8E702E] font-mono font-bold text-sm">{textScale}%</span>
              </label>
              <input
                id="a11y-text-scaler"
                type="range"
                min="100"
                max="200"
                step="10"
                value={textScale}
                onChange={(e) => setTextScale(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8E702E] focus:outline-none"
              />
            </div>

            {/* Dropdowns Grid (Row 1) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="a11y-contrast-select" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {t('contrast')}
                </label>
                <select
                  id="a11y-contrast-select"
                  value={contrastMode}
                  onChange={(e) => setContrastMode(e.target.value as any)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8E702E]/30 outline-none transition-colors"
                >
                  <option value="default">{t('contrastDefault')}</option>
                  <option value="high">{t('contrastHigh')}</option>
                  <option value="inverted">{t('contrastInverted')}</option>
                  <option value="dark">{t('contrastDark')}</option>
                  <option value="yellow-navy">{t('contrastYellowNavy')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="a11y-saturation-select" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {t('satMode')}
                </label>
                <select
                  id="a11y-saturation-select"
                  value={saturation}
                  onChange={(e) => setSaturation(e.target.value as any)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8E702E]/30 outline-none transition-colors"
                >
                  <option value="default">{t('satDefault')}</option>
                  <option value="low">{t('satLow')}</option>
                  <option value="high">{t('satHigh')}</option>
                  <option value="mono">{t('satMono')}</option>
                </select>
              </div>
            </div>

            {/* Dropdowns Grid (Row 2) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="a11y-letterspace-select" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {t('spacingLetter')}
                </label>
                <select
                  id="a11y-letterspace-select"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(e.target.value as any)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8E702E]/30 outline-none transition-colors"
                >
                  <option value="default">{t('letterSpacingDefault')}</option>
                  <option value="wide">{t('letterSpacingWide')}</option>
                  <option value="wider">{t('letterSpacingWider')}</option>
                  <option value="widest">{t('letterSpacingWidest')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="a11y-linespace-select" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {t('spacingLine')}
                </label>
                <select
                  id="a11y-linespace-select"
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(e.target.value as any)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8E702E]/30 outline-none transition-colors"
                >
                  <option value="default">{t('lineSpacingDefault')}</option>
                  <option value="comfortable">{t('lineSpacingComfortable')}</option>
                  <option value="loose">{t('lineSpacingLoose')}</option>
                  <option value="extra-loose">{t('lineSpacingExtraLoose')}</option>
                </select>
              </div>
            </div>

            {/* Dropdowns Grid (Row 3) */}
            <div className="space-y-1">
              <label htmlFor="a11y-colorblind-select" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t('cbMode')}
              </label>
              <select
                id="a11y-colorblind-select"
                value={colorBlindMode}
                onChange={(e) => setColorBlindMode(e.target.value as any)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8E702E]/30 outline-none transition-colors"
              >
                <option value="none">{t('cbNone')}</option>
                <option value="deuteranopia">{t('cbDeuteranopia')}</option>
                <option value="protanopia">{t('cbProtanopia')}</option>
                <option value="tritanopia">{t('cbTritanopia')}</option>
              </select>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3.5 pt-2">
              
              {/* Dyslexic Font Switch */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex flex-col text-left rtl:text-right">
                  <span className="text-xs font-bold text-gray-800">{t('fontDyslexic')}</span>
                  <span className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{t('fontDyslexicDesc')}</span>
                </div>
                <button
                  id="a11y-dyslexic-switch"
                  role="switch"
                  aria-checked={dyslexicFont}
                  onClick={() => setDyslexicFont(!dyslexicFont)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none focus:ring-2 focus:ring-[#8E702E]/30 ${
                    dyslexicFont ? 'bg-[#8E702E]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 transform ${
                    dyslexicFont ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Big Cursor Switch */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex flex-col text-left rtl:text-right">
                  <span className="text-xs font-bold text-gray-800">{t('cursorBig')}</span>
                  <span className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{t('cursorBigDesc')}</span>
                </div>
                <button
                  id="a11y-cursor-switch"
                  role="switch"
                  aria-checked={bigCursor}
                  onClick={() => setBigCursor(!bigCursor)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none focus:ring-2 focus:ring-[#8E702E]/30 ${
                    bigCursor ? 'bg-[#8E702E]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 transform ${
                    bigCursor ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Highlight Links Switch */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex flex-col text-left rtl:text-right">
                  <span className="text-xs font-bold text-gray-800">{t('highlightLinks')}</span>
                  <span className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{t('highlightLinksDesc')}</span>
                </div>
                <button
                  id="a11y-links-switch"
                  role="switch"
                  aria-checked={highlightLinks}
                  onClick={() => setHighlightLinks(!highlightLinks)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none focus:ring-2 focus:ring-[#8E702E]/30 ${
                    highlightLinks ? 'bg-[#8E702E]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 transform ${
                    highlightLinks ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Speech Co-Pilot Switch */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex flex-col text-left rtl:text-right">
                  <span className="text-xs font-bold text-gray-800">{t('readSpeaker')}</span>
                  <span className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{t('readSpeakerDesc')}</span>
                </div>
                <button
                  id="a11y-tts-switch"
                  role="switch"
                  aria-checked={readSpeakerActive}
                  onClick={() => setReadSpeakerActive(!readSpeakerActive)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none focus:ring-2 focus:ring-[#8E702E]/30 ${
                    readSpeakerActive ? 'bg-[#8E702E]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 transform ${
                    readSpeakerActive ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Seizure Safety Switch */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex flex-col text-left rtl:text-right">
                  <span className="text-xs font-bold text-gray-800">{t('seizureSafety')}</span>
                  <span className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{t('seizureSafetyDesc')}</span>
                </div>
                <button
                  id="a11y-seizure-switch"
                  role="switch"
                  aria-checked={seizureSafety}
                  onClick={() => setSeizureSafety(!seizureSafety)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none focus:ring-2 focus:ring-[#8E702E]/30 ${
                    seizureSafety ? 'bg-[#8E702E]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 transform ${
                    seizureSafety ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* ADHD Reading Ruler Switch */}
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col text-left rtl:text-right">
                  <span className="text-xs font-bold text-gray-800">{t('adhdFocus')}</span>
                  <span className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{t('adhdFocusDesc')}</span>
                </div>
                <button
                  id="a11y-adhd-switch"
                  role="switch"
                  aria-checked={adhdActive}
                  onClick={() => setAdhdActive(!adhdActive)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none focus:ring-2 focus:ring-[#8E702E]/30 ${
                    adhdActive ? 'bg-[#8E702E]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 transform ${
                    adhdActive ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3 flex-shrink-0">
          <button
            onClick={resetAll}
            className="w-full py-2.5 px-4 bg-gray-200 hover:bg-gray-300/80 text-gray-700 font-bold text-xs rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#8E702E] flex items-center justify-center gap-2"
          >
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
