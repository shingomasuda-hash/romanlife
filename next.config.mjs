/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // /image-lp、/static-lp をディレクトリのように開けるようにする
  // （public/ 配下の静的ファイルは index.html を自動では解決しないため）
  async rewrites() {
    return [
      { source: '/image-lp', destination: '/image-lp/index.html' },
      { source: '/image-lp/', destination: '/image-lp/index.html' },
      { source: '/static-lp', destination: '/static-lp/index.html' },
      { source: '/static-lp/', destination: '/static-lp/index.html' },
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
