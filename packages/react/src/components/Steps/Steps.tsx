import type {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react';
import { Children, forwardRef, isValidElement, useCallback, useId, useMemo, useState } from 'react';
import {
  clampPercent,
  findClickableIndex,
  isStepClickable,
  resolveStepStatus,
  resolveTailStatus,
  type StepItemLike,
  type StepStatus,
  type StepsDirection,
  type StepsLabelPlacement,
  type StepsTone,
  statusToTone,
} from './logic';

export type { StepStatus, StepsDirection, StepsLabelPlacement, StepsTone };

export type StepsSize = 'sm' | 'default';

/** 单个步骤的数据描述(items 数组入口)。 */
export interface StepItem extends StepItemLike {
  /** 主标题。 */
  title?: ReactNode;
  /** 副描述(标题下方弱化文本)。 */
  description?: ReactNode;
  /** 自定义圆点 / 图标内容(覆盖默认序号 / 状态图标)。 */
  icon?: ReactNode;
  /** 该步的无障碍 key(列表渲染优化用,默认用 index)。 */
  key?: string | number;
}

/** 部件级 className 定制。 */
export interface StepsClassNames {
  /** 单个步骤项容器。 */
  item?: string;
  /** 圆点 / 图标容器。 */
  icon?: string;
  /** 标题。 */
  title?: string;
  /** 描述。 */
  description?: string;
  /** 步与步之间的连线。 */
  tail?: string;
}

export interface StepsProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'title'> {
  /** 步骤数据数组(也可改用复合子组件 Steps.Step,二选一)。 */
  items?: StepItem[];
  /** 当前步索引(受控)。从 0 开始。 */
  current?: number;
  /** 默认当前步索引(非受控)。默认 0。 */
  defaultCurrent?: number;
  /** 当前步整体状态:wait / process / finish / error。默认 process。 */
  status?: StepStatus;
  /**
   * 点击某步跳转(提供后各可用步可点击 / 键盘可达)。
   * @param current 被跳转到的步骤索引(从 0 开始)。
   */
  onChange?: (current: number) => void;
  /** 方向。默认 horizontal。 */
  direction?: StepsDirection;
  /** 尺寸:紧凑 sm / 默认。默认 default。 */
  size?: StepsSize;
  /** 点状步骤(以小圆点替代序号圆圈,更轻量)。 */
  progressDot?: boolean;
  /** 标题相对圆点的位置(仅 horizontal 生效)。默认 horizontal。 */
  labelPlacement?: StepsLabelPlacement;
  /** 当前步进度环百分比(0-100);配合 status="process" 在当前圆点上画环。 */
  percent?: number;
  /** 语义色调,派生主色档(finish/process 圆点与连线)。默认 primary。 */
  tone?: StepsTone;
  /** 部件级 className。 */
  classNames?: StepsClassNames | undefined;
  /** 复合子组件入口(<Steps.Step />);与 items 二选一。 */
  children?: ReactNode;
}

/** Steps.Step 的 props(复合子组件入口,等价于 items 的一项)。 */
export interface StepProps extends StepItem {
  /** 透传到该步根节点的类名。 */
  className?: string;
}

/**
 * Steps.Step —— 复合子组件入口。本身不渲染,仅作为 Steps 的声明式数据载体;
 * Steps 在内部把子组件 props 收集为 items 数组统一渲染。
 */
export function Step(_props: StepProps): ReactElement | null {
  return null;
}
Step.displayName = 'Steps.Step';

const isStepElement = (node: ReactNode): node is ReactElement<StepProps> =>
  isValidElement(node) && (node.type as { displayName?: string })?.displayName === 'Steps.Step';

/** 把复合子组件 <Steps.Step /> 收集为 items 数组(供与 items prop 二选一)。 */
function childrenToItems(children: ReactNode): StepItem[] {
  const items: StepItem[] = [];
  Children.forEach(children, (child, index) => {
    if (!isStepElement(child)) {
      return;
    }
    const { className: _omit, ...rest } = child.props;
    items.push({ key: child.key ?? index, ...rest });
  });
  return items;
}

/** 默认状态图标:finish 打勾、error 叉、其余回退序号(由调用方传入 fallback)。 */
function defaultIcon(status: StepStatus, fallback: ReactNode): ReactNode {
  if (status === 'finish') {
    return (
      <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
        <path
          d="M3.5 8.5l3 3 6-6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === 'error') {
    return (
      <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
        <path
          d="M4 4l8 8M12 4l-8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return fallback;
}

/**
 * Steps —— 步骤条 / 向导(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 数据入口双通道:items 数组 或 复合子组件 <Steps.Step />(二选一)。
 * current 受控/非受控双通道 + onChange(提供后各可用步可点击、键盘 ←→/↑↓/Home/End/Enter/Space 可达);
 * status(当前步 wait/process/finish/error)、direction(horizontal/vertical)、size(sm/default)、
 * progressDot(点状)、labelPlacement(horizontal/vertical)、percent(当前步进度环)。
 *
 * 每步圆点 / 图标按状态着 tone 色(finish/process→主色、error→danger、wait→neutral),连线 finish 染色;
 * 状态机集中在 logic.ts(零 React,可平移)。接全库 tone 槽位(只读 --ms-c*,不写死配色);
 * 留口:items 的 icon/title/description ReactNode 槽、classNames 部件定制、...rest 透传到根、
 * 内部处理器用 composeEventHandlers 合并用户的。样式见 Steps.css,需引入 @magic-scope/react/styles.css。
 */
const StepsRoot = forwardRef<HTMLDivElement, StepsProps>((props, ref) => {
  const {
    items: itemsProp,
    current: currentProp,
    defaultCurrent = 0,
    status = 'process',
    onChange,
    direction = 'horizontal',
    size = 'default',
    progressDot = false,
    labelPlacement = 'horizontal',
    percent,
    tone = 'primary',
    classNames,
    children,
    className,
    ...rest
  } = props;

  const reactId = useId();
  const baseId = `ms-steps-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;

  // 数据入口:items 优先,否则从复合子组件收集。
  const items = useMemo<StepItem[]>(
    () => itemsProp ?? childrenToItems(children),
    [itemsProp, children],
  );

  // current:受控(currentProp)/ 非受控双通道。
  const isControlled = currentProp !== undefined;
  const [currentInternal, setCurrentInternal] = useState(defaultCurrent);
  const current = isControlled ? currentProp : currentInternal;

  const hasOnChange = typeof onChange === 'function';
  const clampedPercent = clampPercent(percent);

  const goTo = useCallback(
    (index: number, item: StepItem) => {
      if (!isStepClickable(item, hasOnChange) || index === current) {
        return;
      }
      if (!isControlled) {
        setCurrentInternal(index);
      }
      onChange?.(index);
    },
    [hasOnChange, current, isControlled, onChange],
  );

  // 键盘:在可点击步之间移动焦点 + Enter/Space 跳转。焦点管理用 roving tabindex(仅可达步进 Tab 序)。
  const onRootKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>, index: number, item: StepItem) => {
      if (!hasOnChange) {
        return;
      }
      const forward = direction === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      const backward = direction === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
      let target = -1;
      switch (e.key) {
        case forward:
          target = findClickableIndex(items, index + 1, 1);
          break;
        case backward:
          target = findClickableIndex(items, index - 1, -1);
          break;
        case 'Home':
          target = findClickableIndex(items, 0, 1);
          break;
        case 'End':
          target = findClickableIndex(items, items.length - 1, -1);
          break;
        case 'Enter':
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          goTo(index, item);
          return;
        default:
          return;
      }
      if (target >= 0) {
        e.preventDefault();
        const el = document.getElementById(`${baseId}-step-${target}`);
        el?.focus();
      }
    },
    [hasOnChange, direction, items, goTo, baseId],
  );

  const rootClasses = [
    'ms-steps',
    `ms-steps--${direction}`,
    `ms-steps--${size}`,
    progressDot && 'ms-steps--dot',
    direction === 'horizontal' && labelPlacement === 'vertical' && 'ms-steps--label-vertical',
    `ms-tone-${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={rootClasses} data-current={current} {...rest}>
      <ol className="ms-steps__list">
        {items.map((item, index) => {
          const stepStatus = resolveStepStatus(item, index, current, status);
          const stepTone = statusToTone(stepStatus);
          const clickable = isStepClickable(item, hasOnChange);
          const isLast = index === items.length - 1;
          // 连线状态:取本步状态决定到下一步那段线是否染色。
          const tailStatus = resolveTailStatus(stepStatus);
          // 当前步且 process + 有 percent → 画进度环。
          const showRing =
            index === current && stepStatus === 'process' && clampedPercent !== undefined;
          // roving tabindex:可点击步里只有 current(或首个可点击)进 Tab 序。
          const isTabStop = clickable && (index === current || (current < 0 && index === 0));

          const iconNode =
            item.icon != null
              ? item.icon
              : defaultIcon(
                  stepStatus,
                  progressDot ? null : <span className="ms-steps__number">{index + 1}</span>,
                );

          const stepId = `${baseId}-step-${index}`;
          const stepClasses = [
            'ms-steps__item',
            `ms-steps__item--${stepStatus}`,
            clickable && 'ms-steps__item--clickable',
            classNames?.item,
          ]
            .filter(Boolean)
            .join(' ');

          const handleClick = (e: MouseEvent<HTMLElement>) => {
            // 在用户 onClick 后未 preventDefault 才跳转(尊重 compose 语义)。
            if (!e.defaultPrevented) {
              goTo(index, item);
            }
          };

          return (
            <li
              key={item.key ?? index}
              className={stepClasses}
              // tone 下沉到每步:不同状态读不同主色档(finish/process 主色、error danger、wait neutral)
              data-status={stepStatus}
              data-disabled={item.disabled ? '' : undefined}
            >
              <div className={`ms-steps__rail ms-tone-${stepTone}`}>
                {/* 圆点 / 图标 */}
                {clickable ? (
                  <button
                    type="button"
                    id={stepId}
                    className={['ms-steps__icon', classNames?.icon].filter(Boolean).join(' ')}
                    aria-current={index === current ? 'step' : undefined}
                    tabIndex={isTabStop ? 0 : -1}
                    onClick={handleClick}
                    onKeyDown={(e) => onRootKeyDown(e, index, item)}
                  >
                    {showRing && (
                      <ProgressRing percent={clampedPercent as number} className="ms-steps__ring" />
                    )}
                    <span className="ms-steps__icon-inner">{iconNode}</span>
                  </button>
                ) : (
                  <span
                    id={stepId}
                    className={['ms-steps__icon', classNames?.icon].filter(Boolean).join(' ')}
                    aria-current={index === current ? 'step' : undefined}
                  >
                    {showRing && (
                      <ProgressRing percent={clampedPercent as number} className="ms-steps__ring" />
                    )}
                    <span className="ms-steps__icon-inner">{iconNode}</span>
                  </span>
                )}

                {/* 连线(末步不画) */}
                {!isLast && (
                  <span
                    className={['ms-steps__tail', `ms-steps__tail--${tailStatus}`, classNames?.tail]
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="ms-steps__content">
                {item.title != null && (
                  <div className={['ms-steps__title', classNames?.title].filter(Boolean).join(' ')}>
                    {item.title}
                  </div>
                )}
                {item.description != null && (
                  <div
                    className={['ms-steps__description', classNames?.description]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {item.description}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
});
StepsRoot.displayName = 'Steps';

/**
 * Steps 复合组件:根 + 静态 Step 子组件命名空间。
 * 用 Object.assign 让导出类型携带 Step 静态属性(`<Steps.Step />` 类型可用)。
 */
export const Steps = Object.assign(StepsRoot, { Step });

interface ProgressRingProps {
  percent: number;
  className?: string;
}

/** 当前步进度环:纯 SVG 圆环,stroke-dashoffset 表达 percent;颜色读 tone 主色。 */
function ProgressRing({ percent, className }: ProgressRingProps) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="ms-steps__ring-track" cx="16" cy="16" r={r} fill="none" strokeWidth="2" />
      <circle
        className="ms-steps__ring-bar"
        cx="16"
        cy="16"
        r={r}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 16 16)"
      />
    </svg>
  );
}
