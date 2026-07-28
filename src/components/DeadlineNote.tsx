import { Icon } from './Icon';
import { EVENT_DATES } from '@/data/event';

type Props = {
  /** 特定の開催日の締切だけを表示する場合に指定 */
  dateId?: string;
  onDark?: boolean;
  className?: string;
};

/**
 * 申込締切の表示。
 * 開催日と締切日が同日になるため、必ず「0:00」まで明記し、
 * 「開催日になった時点で受付終了」であることを補足します。
 */
export function DeadlineNote({ dateId, onDark, className }: Props) {
  const targets = dateId ? EVENT_DATES.filter((d) => d.id === dateId) : EVENT_DATES;

  return (
    <p
      className={['deadline', onDark ? 'deadline--on-dark' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon name="clock" size={17} className="deadline-icon" />
      <span>
        <span className="deadline-en">Entry Deadline</span>
        {targets.map((d) => (
          <span className="deadline-main" key={d.id}>
            {dateId ? '' : `${d.displayDateShort}開催分：`}
            {d.deadlineDisplayShort}締切
          </span>
        ))}
        <span className="deadline-note">開催日になった時点で受付終了となります。</span>
      </span>
    </p>
  );
}
