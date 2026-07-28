import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Shippori_Mincho } from 'next/font/google';
import { RevealScript } from '@/components/RevealScript';
import { EVENT, EVENT_DATES } from '@/data/event';
import './globals.css';

/**
 * 和文の見出し用明朝。本文はデバイス標準のゴシック体を使用するため、
 * Web フォントの読み込みは「見出しの明朝」と「欧文セリフ」の 2 種類だけに絞っています。
 */
const shipporiMincho = Shippori_Mincho({
  weight: ['500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jp-serif',
  preload: false,
});

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-latin-serif',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'ロマンライフ オープン・カンパニー2026｜2028年卒向け採用イベント',
  description:
    'マールブランシュを展開する株式会社ロマンライフの2028年卒向けオープン・カンパニー。業界紹介、販売職体験ワーク、社員座談会、社内見学を通して、仕事と会社のリアルを体験できます。2026年8月11日・31日、京都本社で開催。',
  keywords: [
    'ロマンライフ',
    'マールブランシュ',
    'オープン・カンパニー',
    '2028年卒',
    '採用イベント',
    '京都',
    '洋菓子',
    '販売職',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
    siteName: 'ロマンライフ オープン・カンパニー',
    title:
      'お菓子の先にある、しあわせを届ける仕事。｜ロマンライフ オープン・カンパニー',
    description:
      '2028年卒向けオープン・カンパニー。販売職体験ワーク、社員座談会、社内見学。2026年8月11日（火）・8月31日（月）京都本社で開催。',
    images: [
      {
        url: '/ogp.png',
        width: 1200,
        height: 630,
        alt: 'ロマンライフ オープン・カンパニー 2028年卒向け 2026年8月11日・8月31日 京都本社開催',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'お菓子の先にある、しあわせを届ける仕事。｜ロマンライフ オープン・カンパニー',
    description:
      '2028年卒向けオープン・カンパニー。2026年8月11日（火）・8月31日（月）京都本社で開催。',
    images: ['/ogp.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#265036',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/** 構造化データ：開催日 × 時間帯ごとに Event を出力（申込締切は開催終了時刻として扱わない） */
function structuredData() {
  const organization = {
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: '株式会社ロマンライフ',
    url: 'https://www.romanlife.co.jp/',
    brand: [
      { '@type': 'Brand', name: '京都北山 マールブランシュ' },
      { '@type': 'Brand', name: '侘家古暦堂' },
      { '@type': 'Brand', name: '菓子wabiya' },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'JP',
      addressRegion: '京都府',
      addressLocality: '京都市山科区',
      streetAddress: '大塚北溝町30',
      postalCode: EVENT.venue.postalCode,
    },
  };

  const events = EVENT_DATES.flatMap((date) =>
    date.sessions.map((session) => ({
      '@type': 'Event',
      name: `${EVENT.nameFull}（${date.displayDate} ${session.label}）`,
      description:
        'お菓子・食品業界の紹介、ロマンライフの紹介、販売職体験グループワーク、本社・社内見学、若手社員および採用担当者との座談会を行います。',
      startDate: session.startTime,
      endDate: session.endTime,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      inLanguage: 'ja',
      audience: {
        '@type': 'EducationalAudience',
        educationalRole: 'student',
        audienceType: EVENT.target,
      },
      location: {
        '@type': 'Place',
        name: `${EVENT.venue.company}（${EVENT.venue.building}）`,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'JP',
          addressRegion: '京都府',
          addressLocality: '京都市山科区',
          streetAddress: '大塚北溝町30',
          postalCode: EVENT.venue.postalCode,
        },
      },
      organizer: { '@id': `${SITE_URL}#organization` },
      url: `${SITE_URL}#entry-form`,
    })),
  );

  return { '@context': 'https://schema.org', '@graph': [organization, ...events] };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${shipporiMincho.variable} ${cormorant.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
      </head>
      <body>
        <RevealScript />
        <a href="#main" className="skip-link">
          本文へスキップ
        </a>
        {children}
        {/*
          Google Analytics / 広告計測タグはここに追加できます。
          例）next/script で gtag.js を読み込み、tracking.ts の dataLayer と連携。
        */}
      </body>
    </html>
  );
}
