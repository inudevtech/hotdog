export const GA_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || '';

// PV 測定
export const pageview = (url: string): void => {
  // GA_TRACKING_ID が設定されていない場合は、処理終了
  if (!GA_ID) return;
  window.gtag('config', GA_ID, {
    page_path: url,
  });
};
