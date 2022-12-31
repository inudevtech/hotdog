import "../styles/global.scss";
import type { AppProps } from "next/app";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { createContext, useEffect, useMemo, useState } from "react";
import { User } from "@firebase/auth";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useRouter } from "next/router";
import Head from "next/head";
import { MDXProvider } from "@mdx-js/react";
import { onAuthStateChanged } from "../util/firebase/auth";
import { AccountType, UploadFileType } from "../@types";
import { GA_ID, pageview } from "../util/gtag";
import Header from "../components/Header";
import { H1, H2, H3, Li, P } from "../util/markdownNode";
import SimpleTransition from "../components/transitions/simple";

config.autoAddCss = false;

const AccountContext = createContext<AccountType>({} as AccountType);
const UploadFileContext = createContext<UploadFileType>({} as UploadFileType);

const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  li: Li,
};

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [AccountState, setAccountState] = useState<User | null>(null);
  const [uploadFile, setUploadFile] = useState<File[]>([]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged((user) => {
      setAccountState(user);
    });
  }, []);
  const accountContextValue = useMemo(
    () => ({ AccountState, setAccountState }),
    [AccountState, setAccountState]
  );

  const uploadFIleContextValue = useMemo(
    () => ({ uploadFile, setUploadFile }),
    [uploadFile, setUploadFile]
  );

  useEffect(() => {
    // GA_TRACKING_ID が設定されていない場合は、処理終了
    if (!GA_ID) return;

    const handleRouteChange = (url: string) => {
      pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY!}
      useEnterprise
      language="ja"
    >
      <AccountContext.Provider value={accountContextValue}>
        <UploadFileContext.Provider value={uploadFIleContextValue}>
          <Head>
            <title>🌭ホットドッグ</title>
          </Head>
          <SimpleTransition
            isTransitioning={isTransitioning}
            setIsTransitioning={setIsTransitioning}
          />
          <Header />
          <div id="page-warp" className="min-h-screen">
            {router.pathname.startsWith("/static/") ? (
              <div className="mt-[120px] sm:mt-[100px] p-5 max-w-[1024px] m-auto shadow-xl rounded-lg border">
                <MDXProvider components={components}>
                  <Component {...pageProps} />
                </MDXProvider>
              </div>
            ) : (
              <Component {...pageProps} />
            )}
          </div>
        </UploadFileContext.Provider>
      </AccountContext.Provider>
    </GoogleReCaptchaProvider>
  );
};
MyApp.getInitialProps = async () => ({ pageProps: {} });

export default MyApp;
export { AccountContext, UploadFileContext };
