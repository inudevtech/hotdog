import '../styles/global.scss';
import type { AppProps } from 'next/app';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import {
  createContext, useEffect, useMemo, useState,
} from 'react';
import { User } from '@firebase/auth';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Script from 'next/script';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { onAuthStateChanged } from '../util/firebase/auth';
import { AccountType } from '../util/global';

config.autoAddCss = false;

const AccountContext = createContext<AccountType>({} as AccountType);

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [AccountState, setAccountState] = useState<User | null>(null);
  const [Loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    onAuthStateChanged((user) => {
      setAccountState(user);
      setLoading(false);
    });
  }, []);
  const value = useMemo(() => ({ AccountState, setAccountState }), [AccountState, setAccountState]);

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY!}
      useEnterprise
      language="ja"
    >
      <AccountContext.Provider value={value}>
        <Script
          id="ga"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
        />
        <Script id="ga" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}');
        `}
        </Script>
        {Loading ? (
          <div className="flex justify-center items-center h-screen flex-col">
            <h3 className="m-2 text-2xl">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin px-2" />
              読み込み中
            </h3>
            <blockquote className="md:w-1/2">
              ホットドッグ（英語: hot dog）は、ソーセージを細長いバンで挟んだ食品である。
              <br />
              なお、英語の&quot;hot dog&quot;（熱い犬）は、ソーセージ単体と、ソーセージを細長いバンで挟んだ食品との両方の意味を持つ。
              <cite>https://ja.wikipedia.org/wiki/ホットドッグ</cite>
            </blockquote>
          </div>
        ) : <Component {...pageProps} />}
      </AccountContext.Provider>
    </GoogleReCaptchaProvider>
  );
};

export default MyApp;
export { AccountContext };
