import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode,
} from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { useMessages } from '../../i18n';
import type {
  TextAlign,
  TextFamily,
  TextTone,
  TextTracking,
  TextTransform,
  TextWeight,
  TextWrap,
} from '../Text/Text';
import {
  type HeadingLevel,
  type HeadingVariant,
  levelTag,
  nodeToText,
  resolveAnchorId,
} from './logic';

export type { HeadingLevel, HeadingVariant } from './logic';

/** 关键子部件的 className 注入口(留口:用户可定制每个内部节点)。 */
export interface HeadingClassNames {
  /** 标题文本内容包裹(永远存在)。 */
  text?: string;
  /** anchor permalink 链接(仅 anchor 开启时)。 */
  anchor?: string;
}

export interface HeadingOwnProps {
  /** 语义层级 → 渲染 h1–h6。仅定语义/标签,不直接绑视觉(视觉走 variant)。默认 2。 */
  level?: HeadingLevel;
  /**
   * 视觉档(与 level 解耦,MUI 式视觉/语义分离):
   * display 巨标题 / title 标准标题 / subtitle 副标题(弱化)/ overline 全大写上标签 / caption 说明小字。
   * 不传时由 level 推导默认视觉档(h1→display、h2→title…),保证「只给 level」也好看。
   */
  variant?: HeadingVariant;
  /** 多态:覆盖渲染标签(默认由 level 推导 hN)。语义特殊场景用。 */
  as?: ElementType;
  /** 渲染为唯一子元素并合并样式/props(Slot 模式;如包裹路由 Link)。 */
  asChild?: boolean;
  /** 字族(复用 Text 语义 token)。display=Cinzel 装饰衬线(魔法标题)。不传时 display variant 默认用 display 字族。 */
  family?: TextFamily;
  /** 字重:语义档或任意数值(可变字体)。不传由 variant 决定默认。 */
  weight?: TextWeight | number;
  /** 语义色调(复用全库 tone resolver 的 --ms-c)。 */
  tone?: TextTone;
  /** 任意 CSS 颜色(直透 color;优先级低于 tone)。 */
  color?: string;
  /** 弱化为次要前景色(fg-muted)。subtitle/caption 常用。 */
  dimmed?: boolean;
  /** 文本对齐(逻辑值 start/end,RTL 友好)。 */
  align?: TextAlign;
  /** 字距语义档。overline 默认 wider。 */
  tracking?: TextTracking;
  /** 大小写/全角转换。overline 默认 uppercase。 */
  transform?: TextTransform;
  /**
   * 折行策略。标题默认 'balance'(text-wrap:balance,多行标题视觉均衡)。
   * 兼容:Safari 17.4+/Chrome 114+/FF 121+;旧浏览器自动回退普通换行(渐进增强)。
   */
  wrap?: TextWrap;
  /** 单行截断(尾部省略)。与 lineClamp 互斥。 */
  truncate?: boolean;
  /**
   * 多行省略行数。
   * 兼容:基于 -webkit-line-clamp;与 truncate 互斥。
   */
  lineClamp?: number;
  /** 长串/URL 强制断行(overflow-wrap:anywhere),防超长无空格内容撑破。 */
  breakWord?: boolean;
  /**
   * 渐变文字:true/'tone' 用 tone 槽位渐变;'aurora' 加流光动画(受 motion 档调制)。
   * 兼容:基于 background-clip:text,不支持环境自动回退实色。
   */
  gradient?: boolean | 'tone' | 'aurora';
  /** 辉光文字(text-shadow,受全局 --ms-fx-glow 调制,data-ms-fx=off 时消失)。 */
  glow?: boolean | 'soft' | 'strong';
  /**
   * permalink 锚点(给文档/Prose 用):
   * - `true` → 由标题文本派生可读 slug 作为 id;
   * - 字符串 → 作为显式 id(作者指定 slug)。
   * 显式 `id`(原生属性)始终优先。开启后 hover/聚焦标题出现可点 `#` 链接(指向 `#<id>`),
   * 键盘可达、读屏可读(aria-label「<文本> 永久链接」)。
   */
  anchor?: boolean | string;
  /** 关键子部件 className 注入口。 */
  classNames?: HeadingClassNames | undefined;
  children?: ReactNode;
}

export type HeadingProps = HeadingOwnProps &
  Omit<ComponentPropsWithoutRef<'h2'>, keyof HeadingOwnProps>;

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/** variant → 默认视觉默认值(用户显式 prop 始终覆盖这些)。 */
const VARIANT_DEFAULT_FAMILY: Partial<Record<HeadingVariant, TextFamily>> = {
  display: 'display',
};

/** level → 默认 variant(只给 level 时也有合理视觉)。 */
const LEVEL_DEFAULT_VARIANT: Record<HeadingLevel, HeadingVariant> = {
  1: 'display',
  2: 'title',
  3: 'title',
  4: 'subtitle',
  5: 'subtitle',
  6: 'caption',
};

/**
 * Heading —— 标题旗舰(category: typography)。
 *
 * h1–h6 语义标题,**视觉与语义解耦**:`level` 定语义标签(可访问性/大纲),`variant` 定视觉档
 * (display/title/subtitle/overline/caption),二者独立(MUI 式)。复用 Text 的字族/tone/字重/对齐/
 * 截断/折行(默认 balance 均衡标题)/魔法渐变·辉光,样式共享 typography.css 的 --ms-type-step-* token,
 * 类名复用 `ms-text--*` 同款修饰,保证与 Text 行为一致。
 *
 * **anchor**:`anchor`(boolean | string)给标题挂 permalink(文档/Prose 必备)——自动从标题文本
 * 派生可读 slug 作为 id(CJK 友好),hover/聚焦时浮出可点 `#` 链接,键盘可达、读屏可读。
 *
 * **留口**:`...rest` 透传所有原生属性与事件;`className`/`style` 与计算值合并(用户优先);
 * `classNames` 定制内部子部件;`forwardRef` 到根;`as`/`asChild` 多态。
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  {
    level = 2,
    variant,
    as,
    asChild = false,
    family,
    weight,
    tone,
    color,
    dimmed,
    align,
    tracking,
    transform,
    wrap = 'balance',
    truncate,
    lineClamp,
    breakWord,
    gradient,
    glow,
    anchor,
    classNames,
    className,
    style,
    children,
    id,
    ...rest
  },
  ref,
) {
  const effectiveVariant = variant ?? LEVEL_DEFAULT_VARIANT[level];
  const effectiveFamily = family ?? VARIANT_DEFAULT_FAMILY[effectiveVariant];

  // 魔法效果需要 tone 槽位(--ms-c / --ms-c-glow);未显式给 tone 时兜底 primary
  const needsSlot = gradient != null || glow != null;
  const effectiveTone = tone ?? (needsSlot ? 'primary' : undefined);

  const anchorId = resolveAnchorId(id, anchor, children);
  const anchorEnabled = anchor != null && anchor !== false && anchorId != null;

  const styleVars: Record<string, string | number> = {};
  if (typeof weight === 'number') styleVars['--ms-text-weight'] = weight;
  if (lineClamp != null) styleVars['--ms-line-clamp'] = lineClamp;

  const classes = cx(
    'ms-heading',
    'ms-text',
    `ms-heading--${effectiveVariant}`,
    anchorEnabled && 'ms-heading--anchored',
    effectiveFamily && `ms-text--family-${effectiveFamily}`,
    typeof weight === 'string' && `ms-text--weight-${weight}`,
    effectiveTone && `ms-tone-${effectiveTone}`,
    tone && 'ms-text--toned',
    dimmed && 'ms-text--dimmed',
    align && `ms-text--align-${align}`,
    tracking && `ms-text--tracking-${tracking}`,
    transform && `ms-text--transform-${transform}`,
    wrap && `ms-text--wrap-${wrap}`,
    truncate && 'ms-text--truncate',
    lineClamp != null && 'ms-text--clamp',
    breakWord && 'ms-text--break',
    gradient && 'ms-text--gradient',
    gradient === 'aurora' && 'ms-text--gradient-aurora',
    glow && 'ms-text--glow',
    glow === 'strong' && 'ms-text--glow-strong',
    className,
  );

  // 组件计算样式在前,用户 style 在后(用户值优先);color 介于其间
  const mergedStyle: CSSProperties = {
    ...(styleVars as CSSProperties),
    ...(color ? { color } : {}),
    ...style,
  };

  // anchor 永久链接:hover/聚焦浮出,点击跳锚点。文本内容包一层 ms-heading__text 便于定位 #。
  const t = useMessages();
  const headingText = anchorEnabled ? nodeToText(children).trim() : '';
  const permalinkLabel = headingText
    ? `${headingText} ${t('typography.permalink')}`
    : t('typography.permalink');
  const content = anchorEnabled ? (
    <>
      <span className={cx('ms-heading__text', classNames?.text)}>{children}</span>
      <a className={cx('ms-heading__anchor', classNames?.anchor)} href={`#${anchorId}`}>
        {/* 视觉:# 图标(读屏跳过);可读名走全局 sr-only 文本,满足链接可访问内容 */}
        <span aria-hidden="true" className="ms-heading__anchor-icon">
          #
        </span>
        <span className="ms-sr-only">{permalinkLabel}</span>
      </a>
    </>
  ) : classNames?.text ? (
    <span className={cx('ms-heading__text', classNames.text)}>{children}</span>
  ) : (
    children
  );

  // asChild:把 class/style/props 合并到唯一子元素(Slot 模式)。anchor 内容直接放入子元素。
  if (asChild && isValidElement(children) && !anchorEnabled) {
    const child = children as ReactElement<{ className?: string; style?: CSSProperties }>;
    return cloneElement(child, {
      ...rest,
      ...(anchorId ? { id: anchorId } : {}),
      ...(child.props as object),
      className: cx(classes, child.props.className),
      style: { ...mergedStyle, ...child.props.style },
    });
  }

  const Comp = (as ?? levelTag(level)) as ElementType;
  return (
    <Comp
      ref={ref}
      className={classes}
      style={mergedStyle}
      {...(anchorId ? { id: anchorId } : {})}
      {...rest}
    >
      {content}
    </Comp>
  );
});
Heading.displayName = 'Heading';
