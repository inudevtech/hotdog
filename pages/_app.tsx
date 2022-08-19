import '../styles/global.scss';
import type { AppProps } from 'next/app';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import {
  createContext, useEffect, useMemo, useState,
} from 'react';
import { User } from '@firebase/auth';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { onAuthStateChanged } from '../util/firebase/auth';
import { AccountType } from '../util/global';

config.autoAddCss = false;

const AccountContext = createContext<AccountType>({} as AccountType);

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [AccountState, setAccountState] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged((user) => setAccountState(user));
  }, []);
  const value = useMemo(() => ({ AccountState, setAccountState }), [AccountState, setAccountState]);

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY!}
      useEnterprise
      language="ja"
    >
      <AccountContext.Provider value={value}>
        <Component {...pageProps} />
      </AccountContext.Provider>
    </GoogleReCaptchaProvider>
  );
};

export default MyApp;
export { AccountContext };
