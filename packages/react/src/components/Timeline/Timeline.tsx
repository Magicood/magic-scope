import type { ComponentPropsWithoutRef, KeyboardEvent, ReactNode } from 'react';
import { forwardRef } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';

/**
 * 时间线条目的语义色入口。`default` = 中性(不上色);其余对齐全库 tone resolver,
 * 经 `ms-tone-*` 派生 6 槽位,节点强调色读 `--ms-c`、柔底 `--ms-c-soft`、发光 `--ms-c-glow`。
 */
export type TimelineVariant =
  | 'default'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 左右轴排布:left=轴在左(默认)/ right=轴在右 / alternate=左右交替。 */
export type TimelineMode = 'left' | 'right' | 'alternate';

/** 连线样式:实线 / 虚线。 */
export type TimelineLineStyle = 'solid' | 'dashed';

export interface TimelineProps extends ComponentPropsWithoutRef<'ol'> {
  /** 左右轴排布。默认 left。 */
  mode?: TimelineMode;
  /** 反向(最新在上 / 视觉倒序)。仅翻转视觉顺序,不改 DOM 语义顺序。默认 false。 */
  reverse?: boolean;
  /** 连线样式(可被单条 Item 覆盖)。默认 solid。 */
  lineStyle?: TimelineLineStyle;
  /**
   * 末尾「进行中」节点:虚线连线 + 呼吸圆点。
   * 传 ReactNode 作为该节点内容(如「加载更多…」),自动追加在所有 Item 之后。
   */
  pending?: ReactNode;
}

/**
 * Timeline —— 时间线 / 信息流(旗舰深度)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 语义化 <ol>,内含若干 <TimelineItem>;竖向轴 + 节点圆点 + 连线,节点可换图标、按 tone 着色。
 * mode 控制左右轴 / 交替排布;reverse 视觉倒序;pending 末节点(虚线 + 呼吸点)表示进行中。
 * 接全库 tone resolver(只读 6 槽位)、密度 / 动效 / 发光总闸、交互式选择(active + onSelect + 键盘)。
 * 样式见同目录 Timeline.css,需引入 @magic-scope/react/styles.css。
 */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  (
    { mode = 'left', reverse = false, lineStyle = 'solid', pending, className, children, ...props },
    ref,
  ) => {
    const t = useMessages();
    return (
      <ol
        ref={ref}
        className={[
          'ms-timeline',
          `ms-timeline--${mode}`,
          reverse && 'ms-timeline--reverse',
          lineStyle === 'dashed' && 'ms-timeline--dashed',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
        {pending != null && pending !== false && (
          <li className="ms-timeline__item ms-timeline__item--pending">
            <div className="ms-timeline__node" aria-hidden="true">
              <span className="ms-timeline__dot ms-timeline__dot--pulse" />
            </div>
            <div className="ms-timeline__content">
              <div className="ms-timeline__body">
                {pending === true ? t('timeline.pending') : pending}
              </div>
            </div>
          </li>
        )}
      </ol>
    );
  },
);
Timeline.displayName = 'Timeline';

export interface TimelineItemProps extends Omit<ComponentPropsWithoutRef<'li'>, 'title'> {
  /** 节点圆点的语义色。默认 default(中性,不上色)。 */
  variant?: TimelineVariant;
  /** 自定义节点内容(图标等),替代默认圆点。 */
  icon?: ReactNode;
  /** 次级元信息(时间 / 日期),渲染为 <time>。 */
  time?: ReactNode;
  /** 条目标题。 */
  title?: ReactNode;
  /** 条目正文内容。 */
  children?: ReactNode;
  /** 圆点呼吸发光(进行中 / 强调当前节点)。默认 false。 */
  pulse?: boolean;
  /** 本条连线样式,覆盖 Timeline 级 lineStyle。 */
  lineStyle?: TimelineLineStyle;
  /**
   * 标记为可交互(可聚焦、hover/active 态、Enter/Space 触发 onSelect)。
   * 传了 onSelect 时自动视为可交互。
   */
  interactive?: boolean;
  /** 选中态(受控)。交互式时间线高亮当前条目。 */
  active?: boolean;
  /** 选中语义回调(点击 / 键盘 Enter·Space 触发)。提供即视为交互式。 */
  onSelect?: () => void;
}

/**
 * TimelineItem —— 时间线的一条。节点(圆点或图标)+ 连线(非末项)+ 内容(标题 / 时间 / 正文)。
 * variant 经 ms-tone-* 上色;可 pulse 呼吸;可交互(active + onSelect + 键盘可聚焦)。
 * onClick 与内部选择逻辑用 composeEventHandlers 合并(先用户、未 preventDefault 再内部)。
 */
export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(
  (
    {
      variant = 'default',
      icon,
      time,
      title,
      pulse = false,
      lineStyle,
      interactive,
      active,
      onSelect,
      onClick,
      onKeyDown,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const toned = variant !== 'default';
    const isInteractive = interactive ?? onSelect != null;

    const handleSelect = isInteractive
      ? () => {
          onSelect?.();
        }
      : undefined;

    // Enter / Space 触发选择(交互式)。先调用户 onKeyDown,未 preventDefault 再走内部。
    const internalKeyDown = isInteractive
      ? (event: KeyboardEvent<HTMLLIElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelect?.();
          }
        }
      : undefined;

    return (
      <li
        ref={ref}
        className={[
          'ms-timeline__item',
          toned && 'ms-timeline__item--toned',
          toned && `ms-tone-${variant}`,
          pulse && 'ms-timeline__item--pulse',
          isInteractive && 'ms-timeline__item--interactive',
          active && 'ms-timeline__item--active',
          lineStyle === 'dashed' && 'ms-timeline__item--dashed',
          lineStyle === 'solid' && 'ms-timeline__item--solid',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...(isInteractive
          ? {
              tabIndex: props.tabIndex ?? 0,
              'aria-current': active || undefined,
              'data-interactive': '',
            }
          : null)}
        onClick={composeEventHandlers(onClick, handleSelect)}
        onKeyDown={composeEventHandlers(onKeyDown, internalKeyDown)}
        {...props}
      >
        <div className="ms-timeline__node" aria-hidden="true">
          {icon ? (
            <span className="ms-timeline__icon">{icon}</span>
          ) : (
            <span
              className={['ms-timeline__dot', pulse && 'ms-timeline__dot--pulse']
                .filter(Boolean)
                .join(' ')}
            />
          )}
          <span className="ms-timeline__line" aria-hidden="true" />
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
    );
  },
);
TimelineItem.displayName = 'TimelineItem';
