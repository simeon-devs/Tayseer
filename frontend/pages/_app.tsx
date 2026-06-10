import type { AppProps } from 'next/app';
import { LanguageProvider } from '../lib/LanguageContext';
import { AccessibilityProvider } from '../lib/AccessibilityContext';
import AccessibilityPanel from '../components/AccessibilityPanel';
import '../styles/globals.css';
import '../styles/accessibility.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <Component {...pageProps} />
        <AccessibilityPanel />
      </AccessibilityProvider>
    </LanguageProvider>
  );
}
