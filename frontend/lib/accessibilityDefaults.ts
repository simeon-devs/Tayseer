export interface AccessibilityState {
  dyslexicFont: boolean;
  contrastMode: 'default' | 'high' | 'inverted' | 'dark' | 'yellow-navy';
  saturation: 'default' | 'low' | 'high' | 'mono';
  bigCursor: boolean;
  textScale: number;
  letterSpacing: 'default' | 'wide' | 'wider' | 'widest';
  lineSpacing: 'default' | 'comfortable' | 'loose' | 'extra-loose';
  highlightLinks: boolean;
  readSpeakerActive: boolean;
  seizureSafety: boolean;
  adhdActive: boolean;
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  activeProfile: string | null;
}

export interface AccessibilityContextType extends AccessibilityState {
  setDyslexicFont: (val: boolean) => void;
  setContrastMode: (val: 'default' | 'high' | 'inverted' | 'dark' | 'yellow-navy') => void;
  setSaturation: (val: 'default' | 'low' | 'high' | 'mono') => void;
  setBigCursor: (val: boolean) => void;
  setTextScale: (val: number) => void;
  setLetterSpacing: (val: 'default' | 'wide' | 'wider' | 'widest') => void;
  setLineSpacing: (val: 'default' | 'comfortable' | 'loose' | 'extra-loose') => void;
  setHighlightLinks: (val: boolean) => void;
  setReadSpeakerActive: (val: boolean) => void;
  setSeizureSafety: (val: boolean) => void;
  setAdhdActive: (val: boolean) => void;
  setColorBlindMode: (val: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia') => void;
  activateProfile: (profileName: string | null) => void;
  resetAll: () => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (val: boolean) => void;
}

export const DEFAULT_STATE: AccessibilityState = {
  dyslexicFont: false,
  contrastMode: 'default',
  saturation: 'default',
  bigCursor: false,
  textScale: 100,
  letterSpacing: 'default',
  lineSpacing: 'default',
  highlightLinks: false,
  readSpeakerActive: false,
  seizureSafety: false,
  adhdActive: false,
  colorBlindMode: 'none',
  activeProfile: null,
};
