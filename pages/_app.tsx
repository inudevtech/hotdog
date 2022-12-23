import "../styles/global.scss";
import type { AppProps } from "next/app";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { createContext, useEffect, useMemo, useState } from "react";
import { User } from "@firebase/auth";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import Head from "next/head";
import { MDXProvider } from "@mdx-js/react";
import { onAuthStateChanged } from "../util/firebase/auth";
import { AccountType, UploadFileType } from "../@types";
import { GA_ID, pageview } from "../util/gtag";
import Header from "../components/Header";
import { H1, H2, Li, P } from "../util/markdownNode";

config.autoAddCss = false;

const AccountContext = createContext<AccountType>({} as AccountType);
const UploadFileContext = createContext<UploadFileType>({} as UploadFileType);

const components = {
  h1: H1,
  h2: H2,
  p: P,
  li: Li,
};

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [AccountState, setAccountState] = useState<User | null>(null);
  const [Loading, setLoading] = useState<boolean>(true);
  const [uploadFile, setUploadFile] = useState<File[]>([]);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged((user) => {
      setAccountState(user);
      setLoading(false);
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
          {Loading ? (
            <div className="flex justify-center items-center h-screen flex-col loading">
              <h3 className="m-2 text-2xl monospace">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin px-2"
                />
                Loading...
              </h3>
              <blockquote className="max-w-lg">
                ホットドッグ（英語: hot
                dog）は、ソーセージを細長いバンで挟んだ食品である。
                <br />
                なお、英語の&quot;hot
                dog&quot;（熱い犬）は、ソーセージ単体と、ソーセージを細長いバンで挟んだ食品との両方の意味を持つ。
                <cite>https://ja.wikipedia.org/wiki/ホットドッグ</cite>
              </blockquote>
            </div>
          ) : (
            <>
              <Header />
              <div
                id="page-warp"
                className={`min-h-screen ${
                  router.pathname.startsWith("/static/")
                    ? "pt-[120px] p-3 sm:pt-[100px]"
                    : ""
                }`}
              >
                {router.pathname.startsWith("/static/") ? (
                  <MDXProvider components={components}>
                    <Component {...pageProps} />
                  </MDXProvider>
                ) : (
                  <Component {...pageProps} />
                )}
              </div>
            </>
          )}
        </UploadFileContext.Provider>
      </AccountContext.Provider>
    </GoogleReCaptchaProvider>
  );
};
MyApp.getInitialProps = async () => ({ pageProps: {} });

export default MyApp;
export { AccountContext, UploadFileContext };
