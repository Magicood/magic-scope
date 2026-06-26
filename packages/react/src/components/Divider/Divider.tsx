import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { forwardRef } from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerTextAlign = 'start' | 'center' | 'end';
export type DividerTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** thickness / spacing 接受 token 关键字或任意 CSS 长度(自定义则原样透传)。 */
export type DividerThickness = 'thin' | 'regular' | 'bold' | (string & {});
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg' | (string & {});

/** thickness 关键字 → 像素值;非关键字视为自定义长度,原样作为 CSS 变量值。 */
const THICKNESS_MAP: Record<string, string> = {
  thin: '1px',
  regular: '2px',
  bold: '3px',
};

/** spacing 关键字 → 间距(随密度缩放);非关键字视为自定义长度。 */
const SPACING_MAP: Record<string, string> = {
  none: '0px',
  sm: 'calc(var(--ms-space-2) * var(--ms-density-scale, 1))',
  md: 'calc(var(--ms-space-4) * var(--ms-density-scale, 1))',
  lg: 'calc(var(--ms-space-4) * 1.5 * var(--ms-density-scale, 1))',
};

const resolveThickness = (t: DividerThickness): string => THICKNESS_MAP[t] ?? t;
const resolveSpacing = (s: DividerSpacing): string => SPACING_MAP[s] ?? s;

/** 共享外观属性(line / labeled 两条渲染路径都吃)。 */
interface DividerBaseProps {
  /** 朝向:水平(横跨容器宽度)/ 垂直(贴满容器高度,行内)。默认 horizontal。 */
  orientation?: DividerOrientation;
  /** 线型:实线 / 虚线 / 点线。默认 solid。 */
  variant?: DividerVariant;
  /** 语义色调:线色与微光读对应 tone 的 --ms-c / --ms-c-glow。默认 neutral(= border 色)。 */
  tone?: DividerTone;
  /** 线粗:thin(1px)/ regular(2px)/ bold(3px)或任意 CSS 长度。默认 thin。 */
  thickness?: DividerThickness;
  /** 主轴外间距(随密度缩放):none / sm / md / lg 或任意 CSS 长度。默认 none。 */
  spacing?: DividerSpacing;
}

export interface DividerProps
  extends DividerBaseProps,
    Omit<ComponentPropsWithoutRef<'hr'>, 'children'> {
  /** 内容槽位:有内容时升级为带文字的分隔(role=separator + 两侧画线)。 */
  children?: ReactNode;
  /** 内容槽位别名(等价 children;两者都传时 children 优先)。 */
  label?: ReactNode;
  /** 文字对齐(仅 horizontal 有内容时生效):start / center / end。默认 center。 */
  textAlign?: DividerTextAlign;
}

/** 把 thickness / spacing 解析进自定义属性,合并用户 style。 */
function buildStyle(
  thickness: DividerThickness,
  spacing: DividerSpacing,
  userStyle: CSSProperties | undefined,
): CSSProperties {
  return {
    '--ms-divider-thickness': resolveThickness(thickness),
    '--ms-divider-spacing': resolveSpacing(spacing),
    ...userStyle,
  } as CSSProperties;
}

/**
 * Divider —— 分隔线(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 两条渲染路径,自动切换:
 * - 无内容:语义 <hr>(隐含 separator role),按朝向设 aria-orientation —— 向后兼容旧用法;
 * - 有内容(children / label):渲染 <div>,两侧伪线 aria-hidden、中间承载可读文字,
 *   分隔语义由可见文字承载(不套 splitter 语义的 separator role),textAlign 控制文字偏置。
 *
 * 接全库统一 tone(线色 / 奥术微光读 --ms-c / --ms-c-glow,默认 neutral);
 * variant 实/虚/点线;thickness / spacing 随密度 data-ms-density 缩放;
 * 发光受 --ms-fx-glow 调制、data-ms-fx="off" 总闸关断;尊重 prefers-reduced-motion 与 data-ms-motion。
 * ...rest 透传所有原生属性与事件到根。样式见同目录 Divider.css,需引入 @magic-scope/react/styles.css。
 */
export const Divider = forwardRef<HTMLHRElement & HTMLDivElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      variant = 'solid',
      tone = 'neutral',
      thickness = 'thin',
      spacing = 'none',
      textAlign = 'center',
      className,
      style,
      children,
      label,
      ...props
    },
    ref,
  ) => {
    const content = children ?? label;
    const hasContent = content != null && content !== false;
    const mergedStyle = buildStyle(thickness, spacing, style);

    // —— 有内容:升级为带文字的分隔(两侧画线 + 中间文字),始终水平 ——
    // a11y:不套 role="separator"。ARIA 的 separator role 默认是「可调节的 splitter」
    // (要求 focusable + aria-valuenow),与「静态文字分隔」语义不符;此处分隔含义由
    // 可见文字直接承载,两侧装饰线 aria-hidden。这与 MUI / Ant Design 的带文字 Divider 一致。
    if (hasContent) {
      const classes = [
        'ms-divider',
        'ms-divider--labeled',
        `ms-divider--${variant}`,
        `ms-divider--align-${textAlign}`,
        `ms-tone-${tone}`,
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={classes}
          style={mergedStyle}
          {...(props as ComponentPropsWithoutRef<'div'>)}
        >
          <span className="ms-divider__line" aria-hidden="true" />
          <span className="ms-divider__content">{content}</span>
          <span className="ms-divider__line" aria-hidden="true" />
        </div>
      );
    }

    // —— 无内容:语义 <hr>,向后兼容 ——
    const classes = [
      'ms-divider',
      `ms-divider--${orientation}`,
      `ms-divider--${variant}`,
      `ms-tone-${tone}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <hr
        ref={ref as React.Ref<HTMLHRElement>}
        aria-orientation={orientation}
        className={classes}
        style={mergedStyle}
        {...props}
      />
    );
  },
);
Divider.displayName = 'Divider';
