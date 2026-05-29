import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Tayseer - Housing Debt Rescheduling Portal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-surface">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
