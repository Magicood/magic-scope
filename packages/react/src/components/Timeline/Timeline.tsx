import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef } from 'react';

export type TimelineVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export type TimelineProps = ComponentPropsWithoutRef<'ol'>;

/**
 * Timeline —— 时间线 / 信息流。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 语义化 <ol>,内含若干 <TimelineItem>;竖向轴 + 节点圆点 + 连线,节点可换图标、按变体着色。
 * 适合历史记录、进度、动态流。样式见同目录 Timeline.css,需引入 @magic-scope/react/styles.css。
 */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, children, ...props }, ref) => (
    <ol ref={ref} className={['ms-timeline', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </ol>
  ),
);
Timeline.displayName = 'Timeline';

export interface TimelineItemProps extends Omit<ComponentPropsWithoutRef<'li'>, 'title'> {
  /** 节点圆点的语义色。默认 default(中性)。 */
  variant?: TimelineVariant;
  /** 自定义节点内容(图标等),替代默认圆点。 */
  icon?: ReactNode;
  /** 次级元信息(时间 / 日期),渲染为 <time>。 */
  time?: ReactNode;
  /** 条目标题。 */
  title?: ReactNode;
  /** 条目正文内容。 */
  children?: ReactNode;
}

/**
 * TimelineItem —— 时间线的一条。节点(圆点或图标)+ 连线(非末项)+ 内容(标题 / 时间 / 正文)。
 */
export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ variant = 'default', icon, time, title, className, children, ...props }, ref) => (
    <li
      ref={ref}
      className={[
        'ms-timeline__item',
        variant !== 'default' && `ms-timeline__item--${variant}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div className="ms-timeline__node" aria-hidden="true">
        {icon ? (
          <span className="ms-timeline__icon">{icon}</span>
        ) : (
          <span className="ms-timeline__dot" />
        )}
      </div>
      <div className="ms-timeline__content">
        {(title != null || time != null) && (
          <div className="ms-timeline__header">
            {title != null && <span className="ms-timeline__title">{title}</span>}
            {time != null && <time className="ms-timeline__time">{time}</time>}
          </div>
        )}
        {children != null && <div className="ms-timeline__body">{children}</div>}
      </div>
    </li>
  ),
);
TimelineItem.displayName = 'TimelineItem';
