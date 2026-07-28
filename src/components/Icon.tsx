import type { SVGProps } from 'react';

/**
 * LP 内で使用するアイコンを 1 セットに統一（線幅 1.5 / 24px グリッド / ストローク）。
 * 絵文字は UI アイコンとして使用しません。
 */
export type IconName =
  | 'arrow-right'
  | 'arrow-down'
  | 'clock'
  | 'calendar'
  | 'pin'
  | 'users'
  | 'sparkle'
  | 'chat'
  | 'building'
  | 'gift'
  | 'check'
  | 'alert'
  | 'plus'
  | 'external'
  | 'leaf'
  | 'route'
  | 'eye';

const PATHS: Record<IconName, React.ReactNode> = {
  'arrow-right': <path d="M4 12h15m-6-6 6 6-6 6" />,
  'arrow-down': <path d="M12 4v15m-6-6 6 6 6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.75h17M8.25 3v4M15.75 3v4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.2" />
      <path d="M3.5 20a6 6 0 0 1 12 0M16.5 6.2a3.2 3.2 0 0 1 0 6.1M18 20a5.6 5.6 0 0 0-2.2-4.3" />
    </>
  ),
  sparkle: <path d="M12 3.5 13.9 9 19.5 11l-5.6 2L12 18.5 10.1 13 4.5 11 10.1 9 12 3.5Z" />,
  chat: (
    <>
      <path d="M20.5 12.4c0 3.9-3.8 7-8.5 7a10 10 0 0 1-2.6-.34L4.5 20.5l1.2-3.6a6.6 6.6 0 0 1-2.2-4.5c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7Z" />
    </>
  ),
  building: (
    <>
      <path d="M4 20.5V6.4a1.4 1.4 0 0 1 .9-1.3l6.6-2.4a1.4 1.4 0 0 1 1.9 1.3v16.5M4 20.5h16.5M13.4 8.5h4.7a1.4 1.4 0 0 1 1.4 1.4v10.6" />
      <path d="M7.4 8.6h2.6M7.4 12.4h2.6M7.4 16.2h2.6" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="9" width="17" height="11.5" rx="2" />
      <path d="M3.5 13.4h17M12 9v11.5" />
      <path d="M12 9S10.8 4 8.4 4a2.2 2.2 0 0 0 0 5M12 9s1.2-5 3.6-5a2.2 2.2 0 0 1 0 5" />
    </>
  ),
  check: <path d="M5 12.8 9.7 17.5 19 6.9" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.8v4.8M12 16.1h.01" />
    </>
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  external: (
    <>
      <path d="M14 4.5h5.5V10" />
      <path d="M19.5 4.5 11 13" />
      <path d="M18.2 14.4v4.1a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18.5V7.3a1.5 1.5 0 0 1 1.5-1.5h4.1" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4.5c0 8.6-4.4 13-11 13a5.6 5.6 0 0 1-2.8-.7C6.6 10.2 11.6 5.5 20 4.5Z" />
      <path d="M4 20.5c1-4.4 3.6-8 7.6-10.4" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M6 8.5v4.2a3.3 3.3 0 0 0 3.3 3.3h6.2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};

type Props = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
  /** 意味を持つアイコンの場合はラベルを渡す。省略時は装飾として扱う。 */
  label?: string;
};

export function Icon({ name, size = 20, label, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
