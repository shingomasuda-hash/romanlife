/**
 * イベント情報の一元管理ファイル。
 *
 * 開催日 / 時間帯 / 締切 の変更は、必ずこのファイルだけを編集してください。
 * ページ表示・フォーム・確認画面・完了画面・サーバー側バリデーション・構造化データの
 * すべてがこのデータを参照しています。
 */

export type SessionId = 'morning' | 'afternoon';

export type EventSession = {
  id: SessionId;
  label: string;
  time: string;
  /** 支援技術・構造化データ向けの ISO 時刻（JST） */
  startTime: string;
  endTime: string;
};

export type EventDate = {
  id: string;
  date: string;
  displayDate: string;
  /** 「2026年8月11日（火）」から年を除いた短縮表記 */
  displayDateShort: string;
  /** 曜日を含まない「8月11日」（ボタン文言などに使用） */
  monthDay: string;
  shortDate: string;
  weekday: string;
  /** スクリーンリーダー向けの読み上げ用テキスト */
  readableDate: string;
  sessions: EventSession[];
  /** 申込締切（JST）。この時刻を過ぎた日程は受付終了。 */
  deadline: string;
  deadlineDisplay: string;
  deadlineDisplayShort: string;
  deadlineNote: string;
};

export const EVENT_DATES: EventDate[] = [
  {
    id: '2026-08-11',
    date: '2026-08-11',
    displayDate: '2026年8月11日（火）',
    displayDateShort: '8月11日（火）',
    monthDay: '8月11日',
    shortDate: '08.11',
    weekday: 'TUE',
    readableDate: '2026年8月11日 火曜日',
    sessions: [
      {
        id: 'morning',
        label: '午前の部',
        time: '10:00〜13:00',
        startTime: '2026-08-11T10:00:00+09:00',
        endTime: '2026-08-11T13:00:00+09:00',
      },
      {
        id: 'afternoon',
        label: '午後の部',
        time: '14:30〜17:30',
        startTime: '2026-08-11T14:30:00+09:00',
        endTime: '2026-08-11T17:30:00+09:00',
      },
    ],
    deadline: '2026-08-11T00:00:00+09:00',
    deadlineDisplay: '2026年8月11日（火）0:00',
    deadlineDisplayShort: '8月11日（火）0:00',
    deadlineNote: '開催日前日の深夜までにお申し込みください。',
  },
  {
    id: '2026-08-31',
    date: '2026-08-31',
    displayDate: '2026年8月31日（月）',
    displayDateShort: '8月31日（月）',
    monthDay: '8月31日',
    shortDate: '08.31',
    weekday: 'MON',
    readableDate: '2026年8月31日 月曜日',
    sessions: [
      {
        id: 'morning',
        label: '午前の部',
        time: '10:00〜13:00',
        startTime: '2026-08-31T10:00:00+09:00',
        endTime: '2026-08-31T13:00:00+09:00',
      },
      {
        id: 'afternoon',
        label: '午後の部',
        time: '14:30〜17:30',
        startTime: '2026-08-31T14:30:00+09:00',
        endTime: '2026-08-31T17:30:00+09:00',
      },
    ],
    deadline: '2026-08-31T00:00:00+09:00',
    deadlineDisplay: '2026年8月31日（月）0:00',
    deadlineDisplayShort: '8月31日（月）0:00',
    deadlineNote: '開催日前日の深夜までにお申し込みください。',
  },
];

export const EVENT = {
  name: 'ロマンライフ オープン・カンパニー',
  nameFull: '2028年卒向け ロマンライフ オープン・カンパニー',
  target: '2028年卒業予定の大学生・大学院生',
  graduationYear: 2028,
  venue: {
    company: '株式会社ロマンライフ 本社',
    building: 'マールブランシュ ロマンの森 2階',
    postalCode: '607-8326',
    address: '京都府京都市山科区大塚北溝町30',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=%E4%BA%AC%E9%83%BD%E5%BA%9C%E4%BA%AC%E9%83%BD%E5%B8%82%E5%B1%B1%E7%A7%91%E5%8C%BA%E5%A4%A7%E5%A1%9A%E5%8C%97%E6%BA%9D%E7%94%BA30',
    access: [
      { line: '京都市営地下鉄東西線', station: '「東野駅」', detail: '徒歩約15分' },
      { line: 'JR', station: '「山科駅」', detail: '京阪バスを利用' },
      { line: '京阪バス', station: '「国道大塚」または「大塚野溝町」', detail: '下車、徒歩約5分' },
    ],
  },
} as const;

/** 卒業予定年月の選択肢（初期値は先頭） */
export const GRADUATION_OPTIONS = [
  '2028年3月卒業予定',
  '2027年9月卒業予定',
  '2028年9月卒業予定',
  'その他',
] as const;

/** このイベントを知ったきっかけの選択肢 */
export const REFERRAL_OPTIONS = [
  'ロマンライフの公式サイト',
  'ロマンライフの採用サイト',
  'キャリタス就活',
  '学校・キャリアセンター',
  'SNS',
  '友人・知人からの紹介',
  '検索エンジン',
  'その他',
] as const;

export const SESSION_IDS: SessionId[] = ['morning', 'afternoon'];

export function getEventDate(id: string): EventDate | undefined {
  return EVENT_DATES.find((d) => d.id === id);
}

/**
 * 締切判定。日本時間（Asia/Tokyo）の絶対時刻で比較するため、
 * 端末のタイムゾーン設定に依存しません。
 * サーバー側でも同じ関数を使って再検証します。
 */
export function isClosed(eventDate: EventDate, now: Date = new Date()): boolean {
  return now.getTime() >= new Date(eventDate.deadline).getTime();
}

export function isAllClosed(now: Date = new Date()): boolean {
  return EVENT_DATES.every((d) => isClosed(d, now));
}
