/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return {
      // トップページは HTML/CSS 実装版LP（static-lp）を配信する。
      // beforeFiles でないと src/app/page.tsx のルートが先に一致してしまう。
      // Next.js版LPに戻す場合は、この beforeFiles ごと消してください（/next-lp でも見られます）。
      //
      // index.html が相対パス（styles.css / script.js / assets/…）で参照しているため、
      // それらも合わせて /static-lp/ 配下へ向ける。
      beforeFiles: [
        { source: '/', destination: '/static-lp/index.html' },
        // 申込完了（サンクス）ページ。計測ツールから独立したページとして扱えるよう、
        // 専用のURLで配信します。
        { source: '/thanks', destination: '/static-lp/thanks.html' },
        { source: '/styles.css', destination: '/static-lp/styles.css' },
        { source: '/script.js', destination: '/static-lp/script.js' },
        { source: '/assets/:path*', destination: '/static-lp/assets/:path*' },
      ],
      afterFiles: [],
    };
  },
  // 各版へのショートURL。
  // リライトではなくリダイレクトにしているのは、index.html が相対パスで
  // styles.css / script.js / assets/… を参照しているため。
  // /image-lp のまま配信するとブラウザは /assets/… を要求してしまい、
  // トップ用のリライト（static-lp向け）と衝突する。
  async redirects() {
    return [
      { source: '/static-lp', destination: '/static-lp/index.html', permanent: false },
      { source: '/static-lp/', destination: '/static-lp/index.html', permanent: false },
      { source: '/image-lp', destination: '/image-lp/index.html', permanent: false },
      { source: '/image-lp/', destination: '/image-lp/index.html', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
