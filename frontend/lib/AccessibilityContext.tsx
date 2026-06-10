import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AccessibilityState, AccessibilityContextType, DEFAULT_STATE } from './accessibilityDefaults';

export type { AccessibilityState, AccessibilityContextType };

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Granular settings states
  const [dyslexicFont, setDyslexicFontState] = useState(DEFAULT_STATE.dyslexicFont);
  const [contrastMode, setContrastModeState] = useState(DEFAULT_STATE.contrastMode);
  const [saturation, setSaturationState] = useState(DEFAULT_STATE.saturation);
  const [bigCursor, setBigCursorState] = useState(DEFAULT_STATE.bigCursor);
  const [textScale, setTextScaleState] = useState(DEFAULT_STATE.textScale);
  const [letterSpacing, setLetterSpacingState] = useState(DEFAULT_STATE.letterSpacing);
  const [lineSpacing, setLineSpacingState] = useState(DEFAULT_STATE.lineSpacing);
  const [highlightLinks, setHighlightLinksState] = useState(DEFAULT_STATE.highlightLinks);
  const [readSpeakerActive, setReadSpeakerActiveState] = useState(DEFAULT_STATE.readSpeakerActive);
  const [seizureSafety, setSeizureSafetyState] = useState(DEFAULT_STATE.seizureSafety);
  const [adhdActive, setAdhdActiveState] = useState(DEFAULT_STATE.adhdActive);
  const [colorBlindMode, setColorBlindModeState] = useState(DEFAULT_STATE.colorBlindMode);
  const [activeProfile, setActiveProfile] = useState<string | null>(DEFAULT_STATE.activeProfile);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tayseer_a11y_settings');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AccessibilityState>;
        if (parsed.dyslexicFont !== undefined) setDyslexicFontState(parsed.dyslexicFont);
        if (parsed.contrastMode !== undefined) setContrastModeState(parsed.contrastMode);
        if (parsed.saturation !== undefined) setSaturationState(parsed.saturation);
        if (parsed.bigCursor !== undefined) setBigCursorState(parsed.bigCursor);
        if (parsed.textScale !== undefined) setTextScaleState(parsed.textScale);
        if (parsed.letterSpacing !== undefined) setLetterSpacingState(parsed.letterSpacing);
        if (parsed.lineSpacing !== undefined) setLineSpacingState(parsed.lineSpacing);
        if (parsed.highlightLinks !== undefined) setHighlightLinksState(parsed.highlightLinks);
        if (parsed.readSpeakerActive !== undefined) setReadSpeakerActiveState(parsed.readSpeakerActive);
        if (parsed.seizureSafety !== undefined) setSeizureSafetyState(parsed.seizureSafety);
        if (parsed.adhdActive !== undefined) setAdhdActiveState(parsed.adhdActive);
        if (parsed.colorBlindMode !== undefined) setColorBlindModeState(parsed.colorBlindMode);
        if (parsed.activeProfile !== undefined) setActiveProfile(parsed.activeProfile);
      }
    } catch (e) {
      console.error('Failed to load accessibility settings', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when settings change
  useEffect(() => {
    if (!isLoaded) return;
    const state: AccessibilityState = {
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
    };
    localStorage.setItem('tayseer_a11y_settings', JSON.stringify(state));
  }, [
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
    isLoaded,
  ]);

  // Synchronize CSS custom properties and element classes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    // Remove old classes
    root.classList.remove(
      'a11y-font-dyslexic',
      'a11y-sat-low',
      'a11y-sat-high',
      'a11y-sat-mono',
      'a11y-cursor-large',
      'a11y-letter-spacing-wide',
      'a11y-letter-spacing-wider',
      'a11y-letter-spacing-widest',
      'a11y-line-spacing-comfortable',
      'a11y-line-spacing-loose',
      'a11y-line-spacing-extra-loose',
      'a11y-highlight-links',
      'a11y-contrast-high',
      'a11y-contrast-inverted',
      'a11y-contrast-dark',
      'a11y-contrast-yellow-navy',
      'a11y-cb-deuteranopia',
      'a11y-cb-protanopia',
      'a11y-cb-tritanopia',
      'a11y-seizure-safety',
      'a11y-adhd-active'
    );

    // Apply new classes
    if (dyslexicFont) root.classList.add('a11y-font-dyslexic');
    if (bigCursor) root.classList.add('a11y-cursor-large');
    if (highlightLinks) root.classList.add('a11y-highlight-links');
    if (seizureSafety) root.classList.add('a11y-seizure-safety');
    if (adhdActive) root.classList.add('a11y-adhd-active');

    // Saturation
    if (saturation === 'low') root.classList.add('a11y-sat-low');
    else if (saturation === 'high') root.classList.add('a11y-sat-high');
    else if (saturation === 'mono') root.classList.add('a11y-sat-mono');

    // Contrast
    if (contrastMode === 'high') root.classList.add('a11y-contrast-high');
    else if (contrastMode === 'inverted') root.classList.add('a11y-contrast-inverted');
    else if (contrastMode === 'dark') root.classList.add('a11y-contrast-dark');
    else if (contrastMode === 'yellow-navy') root.classList.add('a11y-contrast-yellow-navy');

    // Letter Spacing
    if (letterSpacing === 'wide') root.classList.add('a11y-letter-spacing-wide');
    else if (letterSpacing === 'wider') root.classList.add('a11y-letter-spacing-wider');
    else if (letterSpacing === 'widest') root.classList.add('a11y-letter-spacing-widest');

    // Line Spacing
    if (lineSpacing === 'comfortable') root.classList.add('a11y-line-spacing-comfortable');
    else if (lineSpacing === 'loose') root.classList.add('a11y-line-spacing-loose');
    else if (lineSpacing === 'extra-loose') root.classList.add('a11y-line-spacing-extra-loose');

    // Color Blind Mode
    if (colorBlindMode === 'deuteranopia') root.classList.add('a11y-cb-deuteranopia');
    else if (colorBlindMode === 'protanopia') root.classList.add('a11y-cb-protanopia');
    else if (colorBlindMode === 'tritanopia') root.classList.add('a11y-cb-tritanopia');

    // Text scale custom property
    root.style.setProperty('--a11y-text-scale', `${textScale}%`);
  }, [
    dyslexicFont,
    contrastMode,
    saturation,
    bigCursor,
    textScale,
    letterSpacing,
    lineSpacing,
    highlightLinks,
    seizureSafety,
    adhdActive,
    colorBlindMode,
  ]);

  // Read Speaker (Text-To-Speech) Implementation
  const speakingElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!readSpeakerActive || typeof window === 'undefined') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const docLang = document.documentElement.lang || 'en';

    const handleSpeech = (text: string, element: HTMLElement) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      if (speakingElementRef.current) {
        speakingElementRef.current.classList.remove('a11y-speaking');
      }

      speakingElementRef.current = element;
      element.classList.add('a11y-speaking');

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select appropriate voice based on page language
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(docLang)) || voices.find((v) => v.lang.startsWith('en'));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        element.classList.remove('a11y-speaking');
        if (speakingElementRef.current === element) {
          speakingElementRef.current = null;
        }
      };

      utterance.onerror = () => {
        element.classList.remove('a11y-speaking');
      };

      window.speechSynthesis.speak(utterance);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Filter elements to avoid reading layout blocks
      const validTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'SPAN', 'LABEL'];
      if (!validTags.includes(target.tagName) || target.closest('.a11y-drawer')) return;

      const text = target.innerText?.trim();
      if (text) {
        handleSpeech(text, target);
      }
    };

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const text = target.innerText?.trim();
      if (text) {
        handleSpeech(text, target);
      }
    };

    const handleMouseLeave = () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (speakingElementRef.current) {
        speakingElementRef.current.classList.remove('a11y-speaking');
        speakingElementRef.current = null;
      }
    };

    document.addEventListener('mouseover', handleHover);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('mouseout', handleMouseLeave);

    // Warmup voices array
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      document.removeEventListener('mouseover', handleHover);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('mouseout', handleMouseLeave);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [readSpeakerActive]);

  // Setters with active profile clearing
  const setDyslexicFont = (val: boolean) => {
    setDyslexicFontState(val);
    setActiveProfile(null);
  };
  const setContrastMode = (val: 'default' | 'high' | 'inverted' | 'dark' | 'yellow-navy') => {
    setContrastModeState(val);
    setActiveProfile(null);
  };
  const setSaturation = (val: 'default' | 'low' | 'high' | 'mono') => {
    setSaturationState(val);
    setActiveProfile(null);
  };
  const setBigCursor = (val: boolean) => {
    setBigCursorState(val);
    setActiveProfile(null);
  };
  const setTextScale = (val: number) => {
    setTextScaleState(val);
    setActiveProfile(null);
  };
  const setLetterSpacing = (val: 'default' | 'wide' | 'wider' | 'widest') => {
    setLetterSpacingState(val);
    setActiveProfile(null);
  };
  const setLineSpacing = (val: 'default' | 'comfortable' | 'loose' | 'extra-loose') => {
    setLineSpacingState(val);
    setActiveProfile(null);
  };
  const setHighlightLinks = (val: boolean) => {
    setHighlightLinksState(val);
    setActiveProfile(null);
  };
  const setReadSpeakerActive = (val: boolean) => {
    setReadSpeakerActiveState(val);
    setActiveProfile(null);
  };
  const setSeizureSafety = (val: boolean) => {
    setSeizureSafetyState(val);
    if (val) {
      // Strict overrides for seizure safety
      setSaturationState('low');
    }
    setActiveProfile(null);
  };
  const setAdhdActive = (val: boolean) => {
    setAdhdActiveState(val);
    setActiveProfile(null);
  };
  const setColorBlindMode = (val: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia') => {
    setColorBlindModeState(val);
    setActiveProfile(null);
  };

  // Reset helper
  const resetAll = () => {
    setDyslexicFontState(DEFAULT_STATE.dyslexicFont);
    setContrastModeState(DEFAULT_STATE.contrastMode);
    setSaturationState(DEFAULT_STATE.saturation);
    setBigCursorState(DEFAULT_STATE.bigCursor);
    setTextScaleState(DEFAULT_STATE.textScale);
    setLetterSpacingState(DEFAULT_STATE.letterSpacing);
    setLineSpacingState(DEFAULT_STATE.lineSpacing);
    setHighlightLinksState(DEFAULT_STATE.highlightLinks);
    setReadSpeakerActiveState(DEFAULT_STATE.readSpeakerActive);
    setSeizureSafetyState(DEFAULT_STATE.seizureSafety);
    setAdhdActiveState(DEFAULT_STATE.adhdActive);
    setColorBlindModeState(DEFAULT_STATE.colorBlindMode);
    setActiveProfile(null);
  };

  // One-click profile applicator
  const activateProfile = (profileName: string | null) => {
    if (!profileName) {
      resetAll();
      return;
    }

    // Reset base settings first
    setDyslexicFontState(false);
    setContrastModeState('default');
    setSaturationState('default');
    setBigCursorState(false);
    setTextScaleState(100);
    setLetterSpacingState('default');
    setLineSpacingState('default');
    setHighlightLinksState(false);
    setReadSpeakerActiveState(false);
    setSeizureSafetyState(false);
    setAdhdActiveState(false);
    setColorBlindModeState('none');
    setActiveProfile(profileName);

    switch (profileName) {
      case 'visually-impaired':
        setTextScaleState(130);
        setContrastModeState('yellow-navy');
        setHighlightLinksState(true);
        setBigCursorState(true);
        break;
      case 'dyslexic':
        setDyslexicFontState(true);
        setLetterSpacingState('wide');
        setLineSpacingState('comfortable');
        break;
      case 'adhd':
        setAdhdActiveState(true);
        setLineSpacingState('comfortable');
        break;
      case 'color-blind':
        setColorBlindModeState('deuteranopia');
        break;
      case 'cognitive':
        setHighlightLinksState(true);
        setReadSpeakerActiveState(true);
        setSeizureSafetyState(true); // limits animations to help attention/focus
        break;
      case 'seizure-safety':
        setSeizureSafetyState(true);
        setSaturationState('low');
        break;
      default:
        break;
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
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
        isPanelOpen,
        setIsPanelOpen,
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
      }}
    >
      {children}
      
      {/* ── Global SVG Color Blindness filters in DOM ── */}
      <svg
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0, 0, 0
                      0.7,   0.3,   0, 0, 0
                      0,     0.3,   0.7, 0, 0
                      0,     0,     0, 1, 0"
            />
          </filter>
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0, 0, 0
                      0.558, 0.442, 0, 0, 0
                      0,     0.242, 0.758, 0, 0
                      0,     0,     0, 1, 0"
            />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05,  0, 0, 0
                      0,    0.433, 0.567, 0, 0
                      0,    0.475, 0.525, 0, 0
                      0,    0,     0, 1, 0"
            />
          </filter>
        </defs>
      </svg>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
