import React from 'react';
import { useAccessibility } from '../lib/AccessibilityContext';
import { useLang } from '../lib/LanguageContext';
import { getA11yString } from '../lib/accessibilityStrings';

interface ToggleProps {
  id: string;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  isRtl: boolean;
  noBorder?: boolean;
}

function ToggleSwitch({ id, label, desc, checked, onChange, isRtl, noBorder }: ToggleProps) {
  return (
    <div className={`flex items-center justify-between py-2 ${noBorder ? '' : 'border-b border-gray-50'}`}>
      <div className="flex flex-col text-left rtl:text-right">
        <span className="text-xs font-bold text-gray-800">{label}</span>
        <span className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{desc}</span>
      </div>
      <button id={id} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none focus:ring-2 focus:ring-[#8E702E]/30 ${checked ? 'bg-[#8E702E]' : 'bg-gray-200'}`}>
        <span className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 transform ${checked ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

interface SelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: any) => void;
  options: [string, string][];
}

function SelectField({ id, label, value, onChange, options }: SelectProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#8E702E]/30 outline-none transition-colors">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

export default function AccessibilitySettings({ isRtl }: { isRtl: boolean }) {
  const { lang } = useLang();
  const t = (key: string) => getA11yString(lang, key);
  const {
    dyslexicFont, contrastMode, saturation, bigCursor, textScale,
    letterSpacing, lineSpacing, highlightLinks, readSpeakerActive,
    seizureSafety, adhdActive, colorBlindMode, activeProfile,
    setDyslexicFont, setContrastMode, setSaturation, setBigCursor, setTextScale,
    setLetterSpacing, setLineSpacing, setHighlightLinks, setReadSpeakerActive,
    setSeizureSafety, setAdhdActive, setColorBlindMode, activateProfile,
  } = useAccessibility();

  const profiles = [
    { id: 'visually-impaired', title: t('visuallyImpaired'), desc: t('visuallyImpairedDesc'),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
    { id: 'dyslexic', title: t('dyslexic'), desc: t('dyslexicDesc'),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg> },
    { id: 'adhd', title: t('adhd'), desc: t('adhdDesc'),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg> },
    { id: 'color-blind', title: t('colorBlind'), desc: t('colorBlindDesc'),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" /></svg> },
    { id: 'cognitive', title: t('cognitive'), desc: t('cognitiveDesc'),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.808 13.019A5.969 5.969 0 0112 15a5.969 5.969 0 013.842 1.356" /></svg> },
  ];

  return (
    <>
      {/* Preset Profiles */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase">{t('profilesSection')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {profiles.map((p) => {
            const isActive = activeProfile === p.id;
            return (
              <button key={p.id} onClick={() => activateProfile(isActive ? null : p.id)}
                className={`flex flex-col text-left rtl:text-right p-4 rounded-xl border transition-all duration-200 ${p.id === 'cognitive' ? 'col-span-2' : ''} ${isActive ? 'border-[#8E702E] bg-[#FAF9F6] ring-2 ring-[#8E702E]/10' : 'border-gray-200 hover:bg-gray-50 bg-white'}`}>
                <div className="flex justify-between items-start w-full mb-3">
                  <div className={`p-1.5 rounded-lg transition-colors duration-200 ${isActive ? 'bg-[#8E702E]/15 text-[#8E702E]' : 'bg-gray-100 text-gray-400'}`}>{p.icon}</div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 ${isActive ? 'border-[#8E702E] bg-[#8E702E]' : 'border-gray-300 bg-white'}`}>
                    {isActive && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <span className="font-bold text-xs text-gray-900 leading-tight">{p.title}</span>
                <span className="text-[10px] text-gray-400 mt-1 leading-normal">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Granular Adjusters */}
      <div className="space-y-5 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase">{t('adjustersSection')}</h3>

        <div className="space-y-2 bg-[#FAF9F6] border border-gray-100/50 p-4 rounded-xl">
          <label htmlFor="a11y-text-scaler" className="flex justify-between text-xs font-bold text-gray-700">
            <span>{t('textScale')}</span>
            <span className="text-[#8E702E] font-mono font-bold text-sm">{textScale}%</span>
          </label>
          <input id="a11y-text-scaler" type="range" min="100" max="200" step="10" value={textScale}
            onChange={(e) => setTextScale(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8E702E] focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField id="a11y-contrast" label={t('contrast')} value={contrastMode} onChange={setContrastMode}
            options={[['default', t('contrastDefault')], ['high', t('contrastHigh')], ['inverted', t('contrastInverted')], ['dark', t('contrastDark')], ['yellow-navy', t('contrastYellowNavy')]]} />
          <SelectField id="a11y-sat" label={t('satMode')} value={saturation} onChange={setSaturation}
            options={[['default', t('satDefault')], ['low', t('satLow')], ['high', t('satHigh')], ['mono', t('satMono')]]} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField id="a11y-letter" label={t('spacingLetter')} value={letterSpacing} onChange={setLetterSpacing}
            options={[['default', t('letterSpacingDefault')], ['wide', t('letterSpacingWide')], ['wider', t('letterSpacingWider')], ['widest', t('letterSpacingWidest')]]} />
          <SelectField id="a11y-line" label={t('spacingLine')} value={lineSpacing} onChange={setLineSpacing}
            options={[['default', t('lineSpacingDefault')], ['comfortable', t('lineSpacingComfortable')], ['loose', t('lineSpacingLoose')], ['extra-loose', t('lineSpacingExtraLoose')]]} />
        </div>

        <SelectField id="a11y-cb" label={t('cbMode')} value={colorBlindMode} onChange={setColorBlindMode}
          options={[['none', t('cbNone')], ['deuteranopia', t('cbDeuteranopia')], ['protanopia', t('cbProtanopia')], ['tritanopia', t('cbTritanopia')]]} />

        <div className="space-y-3.5 pt-2">
          <ToggleSwitch id="a11y-dyslexic" label={t('fontDyslexic')} desc={t('fontDyslexicDesc')} checked={dyslexicFont} onChange={setDyslexicFont} isRtl={isRtl} />
          <ToggleSwitch id="a11y-cursor" label={t('cursorBig')} desc={t('cursorBigDesc')} checked={bigCursor} onChange={setBigCursor} isRtl={isRtl} />
          <ToggleSwitch id="a11y-links" label={t('highlightLinks')} desc={t('highlightLinksDesc')} checked={highlightLinks} onChange={setHighlightLinks} isRtl={isRtl} />
          <ToggleSwitch id="a11y-tts" label={t('readSpeaker')} desc={t('readSpeakerDesc')} checked={readSpeakerActive} onChange={setReadSpeakerActive} isRtl={isRtl} />
          <ToggleSwitch id="a11y-seizure" label={t('seizureSafety')} desc={t('seizureSafetyDesc')} checked={seizureSafety} onChange={setSeizureSafety} isRtl={isRtl} />
          <ToggleSwitch id="a11y-adhd" label={t('adhdFocus')} desc={t('adhdFocusDesc')} checked={adhdActive} onChange={setAdhdActive} isRtl={isRtl} noBorder />
        </div>
      </div>
    </>
  );
}
