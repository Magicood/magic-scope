import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { useMessages } from '../../i18n';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';
import { cx, type EmptyPreset, type EmptySize, isEmptyPreset, PRESET_VIEWBOX } from './logic';

export type { EmptyPreset, EmptySize } from './logic';

/** 语义色调(发光与默认插画着色读统一 6 槽位,与 Button/Alert 同源)。 */
export type EmptyTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 各部件细粒度 className,深度定制内部布局而不丢结构。 */
export interface EmptyClassNames {
  /** 根容器。 */
  root?: string;
  /** 插画槽。 */
  image?: string;
  /** 描述文案区。 */
  description?: string;
  /** 底部操作区。 */
  footer?: string;
}

/** Empty 自有 props(与多态根标签的原生属性合并)。 */
export interface EmptyOwnProps {
  /**
   * 多态根标签。默认 `div`。需要语义时换 `section` 等。与 `asChild` 互斥(asChild 优先)。
   */
  as?: ElementType;
  /**
   * 渲染为唯一子元素并把空状态样式合并上去(Radix Slot 风格,由子元素自带内容)。
   * 用于不额外包一层 DOM 的场景。
   */
  asChild?: boolean;
  /**
   * 插画:
   * - 不传 → 内置极简插画(预设 `default`);
   * - 预设名 `'default'` / `'simple'` → 对应内置 SVG;
   * - 任意 `ReactNode` → 自定义插画(图片 / 图标 / 自绘 SVG);
   * - `false` → 完全不渲染插画列。
   * 内置 SVG 用 `currentColor` 绘制,经 `tone` 着色。
   */
  image?: ReactNode | EmptyPreset | false;
  /**
   * 描述文案。不传走 i18n `empty.description`(默认「暂无数据」);传 `false` 关闭描述;
   * 传 `ReactNode` 覆盖。
   */
  description?: ReactNode | false;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: EmptySize;
  /** 语义色调:驱动内置插画着色与发光(读统一 6 槽位)。默认 neutral。 */
  tone?: EmptyTone;
  /** 各部件细粒度 className。 */
  classNames?: EmptyClassNames;
}

/** 接上 own props 之外的原生根标签属性(默认 div)。 */
export type EmptyProps = EmptyOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof EmptyOwnProps>;

/** size → 内置插画描边粗细基准(viewBox 单位,size 大则线更纤细,视觉更轻)。 */
const PRESET_STROKE: Record<EmptySize, number> = {
  sm: 2.4,
  md: 2,
  lg: 1.6,
};

/**
 * 内置极简插画。两套预设均用 `currentColor`,由根的 `color` / tone 着色;
 * 纯装饰,`aria-hidden`(语义由 description 承担)。
 */
function PresetIllustration({ preset, size }: { preset: EmptyPreset; size: EmptySize }) {
  const stroke = PRESET_STROKE[size];
  const v = PRESET_VIEWBOX;
  return (
    <svg
      className="ms-empty__svg"
      viewBox={`0 0 ${v} ${v}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {preset === 'simple' ? (
        // simple:一只极简托盘 + 内陷阴影线,暗示「空容器」
        <>
          <path d="M12 40 L24 40 L28 46 L36 46 L40 40 L52 40" />
          <path d="M12 40 L18 22 L46 22 L52 40" />
          <path d="M52 40 L52 48 L12 48 L12 40 Z" opacity="0.55" />
        </>
      ) : (
        // default:卡片轮廓 + 折角文档 + 留白横线,信息更丰富
        <>
          <rect x="14" y="16" width="36" height="34" rx="3" />
          <path d="M22 26 L42 26" opacity="0.7" />
          <path d="M22 33 L38 33" opacity="0.55" />
          <path d="M22 40 L34 40" opacity="0.4" />
          <path d="M40 12 L52 12 L52 24" opacity="0.85" />
        </>
      )}
    </svg>
  );
}

/**
 * Empty —— 空状态(生产级深度组件)。对标 AntD Empty:无数据 / 无结果时的占位与引导。
 * 自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 特性:`image`(内置预设 default/simple 极简插画 · currentColor + tone 着色,或自定义 ReactNode,或 false 关闭)、
 * `description`(默认走 i18n empty.description,可覆盖或 false 关闭)、`children`(底部操作区,如重试按钮)、
 * `size`(sm/md/lg,随 data-ms-density 缩放)、`tone`(7 档语义色驱动插画着色与发光,读统一 6 槽位)、
 * 多态 `as` + `asChild`(Slot,mergeAsChildProps + composeRefs)、`classNames` 部件级定制、forwardRef 到根、`...rest` 透传根。
 * 纯展示;发光与微动尊重 prefers-reduced-motion 与 data-ms-motion/data-ms-fx 总闸。
 * 样式见同目录 Empty.css,需引入 @magic-scope/react/styles.css。
 */
export const Empty = forwardRef<HTMLElement, EmptyProps>(
  (
    {
      as,
      asChild = false,
      image,
      description,
      size = 'md',
      tone = 'neutral',
      classNames,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const t = useMessages();

    const classes = cx(
      'ms-empty',
      `ms-empty--${size}`,
      `ms-tone-${tone}`,
      className,
      classNames?.root,
    );

    // asChild:把样式 / 原生 props 合并到子元素(子元素自带内容),不额外包一层 DOM。
    // 子部件槽位在此模式下不生效(由子元素全权负责内容)。
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps(
        { ...props, className: classes, style: style as Record<string, unknown> | undefined },
        child.props,
      );
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }

    // 插画:false 关闭整列;未传 / 预设名 → 内置 SVG;其它 ReactNode → 原样自定义。
    const showImage = image !== false;
    const imageNode: ReactNode =
      image === undefined || isEmptyPreset(image) ? (
        <PresetIllustration preset={isEmptyPreset(image) ? image : 'default'} size={size} />
      ) : (
        (image as ReactNode)
      );

    // 描述:false 关闭;未传走 i18n;其它 ReactNode 覆盖。
    const descriptionNode: ReactNode =
      description === false ? null : (description ?? t('empty.description', undefined, '暂无数据'));

    const Tag = (as ?? 'div') as ElementType;
    return (
      <Tag ref={ref} className={classes} style={style as CSSProperties} {...props}>
        {showImage && (
          <div className={cx('ms-empty__image', classNames?.image)} aria-hidden="true">
            {imageNode}
          </div>
        )}
        {descriptionNode != null && (
          <div className={cx('ms-empty__description', classNames?.description)}>
            {descriptionNode}
          </div>
        )}
        {children != null && (
          <div className={cx('ms-empty__footer', classNames?.footer)}>{children}</div>
        )}
      </Tag>
    );
  },
);
Empty.displayName = 'Empty';
