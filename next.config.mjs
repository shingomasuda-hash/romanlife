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
        { source: '/styles.css', destination: '/static-lp/styles.css' },
        { source: '/script.js', destination: '/static-lp/script.js' },
        { source: '/assets/:path*', destination: '/static-lp/assets/:path*' },
      ],
      // /image-lp、/static-lp をディレクトリのように開けるようにする
      // （public/ 配下の静的ファイルは index.html を自動では解決しないため）
      afterFiles: [
        { source: '/image-lp', destination: '/image-lp/index.html' },
        { source: '/image-lp/', destination: '/image-lp/index.html' },
        { source: '/static-lp', destination: '/static-lp/index.html' },
        { source: '/static-lp/', destination: '/static-lp/index.html' },
      ],
    };
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
