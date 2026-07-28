/**
 * 画像スロットの一元管理。
 *
 * 【差し替え方法】
 *   1. 公式素材（利用許諾を確認したもの）を /public/images/ に配置する
 *   2. 下記の `src` に '/images/xxx.webp' を設定する
 *   3. `alt` を実際の写真の内容に合わせて修正する
 *
 * `src` が null の間は、写真の内容と推奨比率を明示したプレースホルダーが表示されます。
 * 無関係なフリー素材は使用していません。
 */

export type ImageSlot = {
  /** 公開後に差し替える画像パス。null の間はプレースホルダー表示。 */
  src: string | null;
  /** 差し替え後に使用する代替テキスト */
  alt: string;
  /** 制作者向け：どんな写真を入れるべきか */
  note: string;
  /** 推奨アスペクト比（CSS aspect-ratio 用） */
  ratio: string;
  /** 推奨実寸 */
  size: string;
};

export const IMAGES = {
  /** ファーストビュー（PC）。別途提供の FV 生成画像をここに設定します。 */
  heroPc: {
    src: null,
    alt: 'マールブランシュの店舗で、若手社員が自然に会話しながらお菓子を準備している様子',
    note: 'FV用／明るく上品な洋菓子店・アトリエ。画面右側に人物と商品、左側にコピー用の余白',
    ratio: '16 / 9',
    size: '2400 × 1350px 以上',
  },
  /** ファーストビュー（スマートフォン専用トリミング） */
  heroSp: {
    src: null,
    alt: 'マールブランシュの店舗で、若手社員が自然に会話しながらお菓子を準備している様子',
    note: 'FV用SPトリミング／人物を中央〜上寄せ。顔が切れない構図',
    ratio: '4 / 5',
    size: '1200 × 1500px 以上',
  },
  introHandover: {
    src: null,
    alt: '店頭で社員がお客さまへお菓子を手渡している瞬間',
    note: '商品を手渡す瞬間。社員とお客さまの表情・関係性が伝わるもの',
    ratio: '4 / 5',
    size: '1000 × 1250px 以上',
  },
  introCounter: {
    src: null,
    alt: '売場のカウンターで商品を整えている社員の手元',
    note: '売場づくり・商品を整える手元のディテールカット',
    ratio: '1 / 1',
    size: '900 × 900px 以上',
  },
  benefit01: {
    src: null,
    alt: '洋菓子が製造されている工房の様子',
    note: '業界紹介パート／工房・製造ラインなど「つくる」現場',
    ratio: '3 / 2',
    size: '1200 × 800px 以上',
  },
  benefit02: {
    src: null,
    alt: 'マールブランシュ ロマンの森の店内',
    note: 'ロマンの森の外観または内観。ブランドの世界観が伝わるもの',
    ratio: '3 / 2',
    size: '1200 × 800px 以上',
  },
  benefit03: {
    src: null,
    alt: 'グループワークで学生同士が話し合っている様子',
    note: 'グループワーク／机を囲んで意見を出し合う様子',
    ratio: '3 / 2',
    size: '1200 × 800px 以上',
  },
  benefit04: {
    src: null,
    alt: '社員同士が笑顔で打ち合わせをしている様子',
    note: '座談会・社内見学／社員の自然な表情と職場の空気',
    ratio: '3 / 2',
    size: '1200 × 800px 以上',
  },
  aboutBrand: {
    src: null,
    alt: 'マールブランシュの店舗ファサード',
    note: '会社紹介／ブランドの象徴となる店舗写真',
    ratio: '3 / 4',
    size: '900 × 1200px 以上',
  },
  aboutTeam: {
    src: null,
    alt: '厨房で仕込みをするスタッフ',
    note: '会社紹介／つくり手の仕事風景',
    ratio: '1 / 1',
    size: '900 × 900px 以上',
  },
  voices: {
    src: null,
    alt: '若手社員が学生の質問に答えている様子',
    note: '座談会セクション／若手社員の自然な表情。作り込んだポートレートは避ける',
    ratio: '4 / 3',
    size: '1200 × 900px 以上',
  },
  recommend: {
    src: null,
    alt: '店頭で接客する社員',
    note: 'おすすめセクション／接客中の生き生きとした表情',
    ratio: '3 / 4',
    size: '900 × 1200px 以上',
  },
  access: {
    src: null,
    alt: 'マールブランシュ ロマンの森の外観',
    note: '会場アクセス／ロマンの森または本社の外観。当日の目印になる構図',
    ratio: '16 / 9',
    size: '1600 × 900px 以上',
  },
} satisfies Record<string, ImageSlot>;

export type ImageKey = keyof typeof IMAGES;
