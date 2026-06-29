import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';
import {
  type BlockquoteAccentSide,
  type BlockquoteGlow,
  type BlockquoteSize,
  type BlockquoteTone,
  type BlockquoteVariant,
  blockquoteClasses,
  cx,
  resolveTone,
} from './logic';

export type {
  BlockquoteAccentSide,
  BlockquoteGlow,
  BlockquoteSize,
  BlockquoteTone,
  BlockquoteVariant,
};

/** 子部件 class 覆盖映射(给关键子节点细粒度定制)。 */
export interface BlockquoteClassNames {
  /** 装饰大引号层。 */
  mark?: string;
  /** 图标槽容器。 */
  icon?: string;
  /** 正文容器。 */
  content?: string;
  /** 出处区(<footer>)。 */
  footer?: string;
  /** 出处文本(<cite>)。 */
  cite?: string;
}

// 原生 blockquote 的 cite 是 string(引文来源 URL),本组件把 `cite` 升为「出处槽」(ReactNode),
// 故 Omit 掉原生再重声明;原生 URL 语义改由 citeUrl 透出(写进真实 blockquote[cite])。
export interface BlockquoteOwnProps {
  /** 多态根标签。默认 blockquote(语义最佳)。可换 figure 等。 */
  as?: ElementType;
  /** 渲染为唯一子元素并把样式/props 合并上去(Slot 模式,如包裹自定义容器)。 */
  asChild?: boolean;
  /** 视觉变体:左强调条 / 柔底块 / 卡片 / 纯文字。默认 bordered。 */
  variant?: BlockquoteVariant;
  /** 语义色调(复用全库 tone resolver 的 --ms-c / --ms-c-soft / --ms-c-glow)。 */
  tone?: BlockquoteTone | undefined;
  /** 尺寸(字号走 --ms-type-step-*、行高走 --ms-leading-*)。默认 md。 */
  size?: BlockquoteSize;
  /** 强调条/缩进所在侧(逻辑值,RTL 友好)。默认 start。 */
  accentSide?: BlockquoteAccentSide;
  /** 出处槽:渲染为 <footer><cite>…</cite></footer>(语义出处)。 */
  cite?: ReactNode;
  /** 引文来源 URL,写入真实 blockquote 的原生 cite 属性(机器可读出处)。 */
  citeUrl?: string | undefined;
  /** 图标/引号槽:自定义前置图标(覆盖 quoteMark 装饰)。 */
  icon?: ReactNode;
  /** 装饰大引号:true 显示默认引号字形,可传字符串自定义引号字符。默认 false。 */
  quoteMark?: boolean | string;
  /** 渐变强调条(tone → glow,基于 background;不支持环境回退实色)。 */
  gradient?: boolean;
  /** 强调条/底块发光(受全局 --ms-fx-glow 调制,data-ms-fx=off 时消失)。默认 off。 */
  glow?: BlockquoteGlow;
  /** 子部件 class 覆盖。 */
  classNames?: BlockquoteClassNames;
}

export type BlockquoteProps = BlockquoteOwnProps &
  Omit<ComponentPropsWithoutRef<'blockquote'>, keyof BlockquoteOwnProps | 'cite'>;

/**
 * Blockquote —— 块级引用旗舰核心(category: typography)。
 *
 * 语义 <blockquote> 原语:左强调条读全库 tone 槽位(--ms-c)、柔底读 --ms-c-soft;
 * 变体(bordered/filled/card/plain)× tone × size,出处槽(<footer><cite>)、
 * 图标/装饰大引号槽,以及魔法(渐变强调条 / 发光,受全局 motion·fx 双降级)。
 *
 * **留口**:`...rest` 透传所有原生属性与事件;`className`/`style` 给根、`classNames` 给关键子部件;
 * `forwardRef` 到渲染元素;`as` / `asChild` 多态;`citeUrl` 写入原生 blockquote[cite]。
 * 尺寸用 typography.css 的 --ms-type-step-* / --ms-leading-*;内容边界 max-inline-size:100% + 断词。
 * 样式见 Blockquote.css + 共享 token,需引入 @magic-scope/react/styles.css。
 */
export const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(function Blockquote(
  {
    as,
    asChild = false,
    variant = 'bordered',
    tone,
    size = 'md',
    accentSide = 'start',
    cite,
    citeUrl,
    icon,
    quoteMark = false,
    gradient = false,
    glow = 'off',
    classNames,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const gradientOn = gradient === true;
  const effectiveTone = resolveTone(tone, variant, gradientOn, glow);
  const hasQuoteMark = quoteMark !== false;
  const hasIcon = icon != null;

  const classes = blockquoteClasses(
    {
      variant,
      size,
      tone: effectiveTone,
      accentSide,
      // 图标存在时不再渲染装饰引号(图标优先);仅 quoteMark 且无 icon 时加 quoted 类
      quoteMark: hasQuoteMark && !hasIcon,
      gradient: gradientOn,
      glow,
      hasIcon,
      hasCite: cite != null,
    },
    className,
  );

  // 装饰引号字符:quoteMark 传字符串则用之,true 用默认弯引号
  const markChar = typeof quoteMark === 'string' ? quoteMark : '“';

  const inner = (
    <>
      {hasIcon ? (
        <span className={cx('ms-blockquote__icon', classNames?.icon)} aria-hidden="true">
          {icon}
        </span>
      ) : (
        hasQuoteMark && (
          <span className={cx('ms-blockquote__mark', classNames?.mark)} aria-hidden="true">
            {markChar}
          </span>
        )
      )}
      <div className={cx('ms-blockquote__content', classNames?.content)}>
        {children}
        {cite != null && (
          <footer className={cx('ms-blockquote__footer', classNames?.footer)}>
            <cite className={cx('ms-blockquote__cite', classNames?.cite)}>{cite}</cite>
          </footer>
        )}
      </div>
    </>
  );

  const mergedStyle: CSSProperties = { ...style };

  // asChild:把样式与 props 合并到唯一子元素(Slot 模式),内容由子元素自带。
  // 事件 compose(子元素与本组件同名处理器都执行)、ref 合并到子元素。
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childRef = (child as { ref?: Ref<unknown> }).ref;
    const merged = mergeAsChildProps(
      { ...rest, className: classes, style: mergedStyle, ...(citeUrl ? { cite: citeUrl } : {}) },
      child.props,
    );
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref as Ref<unknown>, childRef),
    } as Record<string, unknown>);
  }

  const Comp = (as ?? 'blockquote') as ElementType;
  return (
    <Comp ref={ref} className={classes} style={mergedStyle} cite={citeUrl} {...rest}>
      {inner}
    </Comp>
  );
});
Blockquote.displayName = 'Blockquote';
