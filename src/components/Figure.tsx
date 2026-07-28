import Image from 'next/image';
import { IMAGES, type ImageKey } from '@/data/images';
import styles from './Figure.module.css';

type Props = {
  name: ImageKey;
  /** ratio を上書きしたい場合 */
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  compact?: boolean;
  /** プレースホルダーの表現。'deep' はファーストビューなど面として見せたい場所で使用 */
  tone?: 'default' | 'deep';
  /** プレースホルダーの説明を右寄せにする（FV で左側のコピー領域と重ねないため） */
  align?: 'left' | 'right';
};

/**
 * 画像スロット。公式素材が設定されていれば next/image で表示し、
 * 未設定の間は「どんな写真が入るか」と推奨比率が分かるプレースホルダーを表示します。
 * どちらの場合も領域を先に確保するため、CLS が発生しません。
 */
export function Figure({
  name,
  ratio,
  priority,
  sizes,
  className,
  compact,
  tone = 'default',
  align = 'left',
}: Props) {
  const slot = IMAGES[name];
  const aspect = ratio ?? slot.ratio;

  return (
    <figure
      className={[styles.figure, compact ? styles.compact : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{ aspectRatio: aspect }}
    >
      {slot.src ? (
        <Image
          src={slot.src}
          alt={slot.alt}
          fill
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          sizes={sizes ?? '(max-width: 900px) 100vw, 50vw'}
        />
      ) : (
        <div
          className={[
            styles.placeholder,
            tone === 'deep' ? styles.toneDeep : '',
            align === 'right' ? styles.alignRight : '',
          ]
            .filter(Boolean)
            .join(' ')}
          role="img"
          aria-label={`（写真準備中）${slot.alt}`}
        >
          <span className={styles.mark} aria-hidden="true">
            Photo
          </span>
          <div className={styles.body}>
            <p className={styles.note}>{slot.note}</p>
            <p className={styles.meta}>
              {aspect.replace(/\s/g, '')} ／ {slot.size}
            </p>
          </div>
        </div>
      )}
    </figure>
  );
}
