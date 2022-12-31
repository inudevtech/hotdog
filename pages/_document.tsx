import Document, { Head, Html, Main, NextScript } from "next/document";
import { GA_ID } from "../util/gtag";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          {GA_ID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              />
              <script
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
        `,
                }}
              />
            </>
          )}
          <meta
            name="description"
            content="ファイルのアップロードサイト、ホットドッグ"
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:title" content="ホットドッグ" />
          <meta
            property="og:description"
            content="ファイルのアップロードサイト、ホットドッグ"
          />
          <meta
            property="og:image"
            content="https://hotdog.inu-dev.tech/icon.png"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
