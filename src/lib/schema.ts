import { z } from 'zod';
import { EVENT_DATES, GRADUATION_OPTIONS, REFERRAL_OPTIONS, SESSION_IDS } from '@/data/event';

const DATE_IDS = EVENT_DATES.map((d) => d.id) as [string, ...string[]];

/** HTML タグ / スクリプトらしき文字列の混入を拒否する */
const NO_MARKUP = /<[^>]*>|javascript:|data:text\/html/i;

const safeText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max}文字以内で入力してください。`)
    .refine((v) => !NO_MARKUP.test(v), {
      message: '使用できない文字が含まれています。',
    });

const requiredText = (max: number, message: string) =>
  safeText(max).refine((v) => v.length > 0, { message });

/** 全角・半角カタカナ、ひらがな、長音、スペースを許容（過度に厳しくしない） */
const KANA = /^[゠-ヿ぀-ゟｦ-ﾟー\s　]+$/;

/** ハイフン有無・全角数字どちらも受け付ける */
export function normalizePhone(value: string): string {
  return value
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[-‐‑–—ー－(){}（）\s　.]/g, '');
}

export const entrySchema = z
  .object({
    eventDateId: z.enum(DATE_IDS, {
      errorMap: () => ({ message: '参加希望日を選択してください。' }),
    }),
    sessionId: z.enum(SESSION_IDS as [string, ...string[]], {
      errorMap: () => ({ message: '参加希望時間を選択してください。' }),
    }),
    name: requiredText(60, '氏名を入力してください。'),
    nameKana: requiredText(60, '氏名フリガナを入力してください。').refine(
      (v) => KANA.test(v),
      { message: '氏名フリガナはカタカナで入力してください。' },
    ),
    school: requiredText(80, '学校名を入力してください。'),
    faculty: requiredText(80, '学部・学科・研究科を入力してください。'),
    graduation: z.enum(GRADUATION_OPTIONS as unknown as [string, ...string[]], {
      errorMap: () => ({ message: '卒業予定年月を選択してください。' }),
    }),
    graduationOther: safeText(40).optional().default(''),
    email: z
      .string()
      .trim()
      .min(1, 'メールアドレスを入力してください。')
      .max(254, 'メールアドレスが長すぎます。')
      .email('正しいメールアドレスを入力してください。'),
    phone: z
      .string()
      .trim()
      .min(1, '電話番号を入力してください。')
      .transform(normalizePhone)
      .refine((v) => /^0\d{9,10}$/.test(v), {
        message: '正しい電話番号を入力してください。（例：09012345678）',
      }),
    referral: z
      .enum(REFERRAL_OPTIONS as unknown as [string, ...string[]])
      .optional()
      .or(z.literal('')),
    referralOther: safeText(60).optional().default(''),
    question: safeText(500).optional().default(''),
    privacyAgreed: z.literal(true, {
      errorMap: () => ({ message: '個人情報の取り扱いへの同意が必要です。' }),
    }),
    /** ハニーポット（ボット対策）。人間の入力では常に空。 */
    company: z.string().max(0).optional().default(''),
    /** フォーム表示時刻。極端に速い送信をボットとみなす。 */
    renderedAt: z.number().int().nonnegative().optional(),
    tracking: z
      .object({
        utm_source: safeText(120).optional().default(''),
        utm_medium: safeText(120).optional().default(''),
        utm_campaign: safeText(120).optional().default(''),
        utm_content: safeText(120).optional().default(''),
        utm_term: safeText(120).optional().default(''),
        referrer: safeText(500).optional().default(''),
        landingPage: safeText(500).optional().default(''),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.graduation === 'その他' && !data.graduationOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['graduationOther'],
        message: '卒業予定年月を入力してください。',
      });
    }
    if (data.referral === 'その他' && !data.referralOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['referralOther'],
        message: 'きっかけの詳細を入力してください。',
      });
    }
    const eventDate = EVENT_DATES.find((d) => d.id === data.eventDateId);
    if (eventDate) {
      const session = eventDate.sessions.find((s) => s.id === data.sessionId);
      if (!session) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sessionId'],
          message: '参加希望時間を選択してください。',
        });
      } else if (session.closed) {
        // 受付終了の時間帯は、画面側を書き換えられても受け付けません
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sessionId'],
          message: 'この時間帯は受付を終了しました。別の時間帯を選択してください。',
        });
      }
    }
  });

export type EntryInput = z.input<typeof entrySchema>;
export type EntryData = z.output<typeof entrySchema>;

/** フォームが保持する状態（未入力・未選択を許容する緩い型） */
export type EntryFormState = {
  eventDateId: string;
  sessionId: string;
  name: string;
  nameKana: string;
  school: string;
  faculty: string;
  graduation: string;
  graduationOther: string;
  email: string;
  phone: string;
  referral: string;
  referralOther: string;
  question: string;
  privacyAgreed: boolean;
  company: string;
};

export const EMPTY_FORM: EntryFormState = {
  eventDateId: '',
  sessionId: '',
  name: '',
  nameKana: '',
  school: '',
  faculty: '',
  graduation: GRADUATION_OPTIONS[0],
  graduationOther: '',
  email: '',
  phone: '',
  referral: '',
  referralOther: '',
  question: '',
  privacyAgreed: false,
  company: '',
};

/** 画面表示用のフィールド名（エラーサマリー・確認画面で共用） */
export const FIELD_LABELS: Record<string, string> = {
  eventDateId: '参加希望日',
  sessionId: '参加希望時間',
  name: '氏名',
  nameKana: '氏名フリガナ',
  school: '大学・大学院・学校名',
  faculty: '学部・学科・研究科',
  graduation: '卒業予定年月',
  graduationOther: '卒業予定年月（その他）',
  email: 'メールアドレス',
  phone: '電話番号',
  referral: 'このイベントを知ったきっかけ',
  referralOther: 'きっかけ（その他）',
  question: '当日聞いてみたいこと・質問',
  privacyAgreed: '個人情報の取り扱いへの同意',
};

/** フォーム上の並び順（最初のエラーへフォーカスを移すために使用） */
export const FIELD_ORDER = [
  'eventDateId',
  'sessionId',
  'name',
  'nameKana',
  'school',
  'faculty',
  'graduation',
  'graduationOther',
  'email',
  'phone',
  'referral',
  'referralOther',
  'question',
  'privacyAgreed',
] as const;
