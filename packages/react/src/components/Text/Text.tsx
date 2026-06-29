import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactElement } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';

export type TextFamily = 'sans' | 'serif' | 'mono' | 'display';
export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type TextAlign = 'start' | 'end' | 'center' | 'justify';
export type TextLeading = 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
export type TextTracking = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'full-width';
export type TextWrap = 'wrap' | 'nowrap' | 'pretty' | 'balance';
export type TextWhitespace = 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line' | 'break-spaces';
export type TextNumeric = 'tabular' | 'oldstyle' | 'lining' | 'proportional' | 'slashed-zero';
export type TextAnimate = 'reveal' | 'blur-in' | 'shimmer' | 'pulse' | 'flow';
export type TextWritingMode = 'horizontal' | 'vertical';

export interface TextOwnProps {
  /** 多态渲染标签(默认 span)。语义场景按需 p/strong/em/label 等。 */
  as?: ElementType;
  /** 渲染为唯一子元素并把样式/props 合并上去(Slot 模式;如包裹路由 Link)。 */
  asChild?: boolean;
  /** 字族(语义 token,不暴露字体栈)。display=Cinzel 装饰衬线(魔法标题)。 */
  family?: TextFamily;
  /** 字号档(走 --ms-type-step-* 流式字阶)。 */
  size?: TextSize;
  /** 字重:语义档或任意数值(可变字体)。 */
  weight?: TextWeight | number;
  /** 斜体。 */
  italic?: boolean;
  /** 任意 CSS 颜色(直透 color;优先级低于 tone)。 */
  color?: string;
  /** 语义色调(复用全库 tone resolver 的 --ms-c)。 */
  tone?: TextTone;
  /** 弱化为次要前景色(fg-muted)。 */
  dimmed?: boolean;
  /** 文本对齐(逻辑值 start/end,RTL 友好)。 */
  align?: TextAlign;
  /** 行高语义档。 */
  leading?: TextLeading;
  /** 字距语义档(em 随字号缩放)。 */
  tracking?: TextTracking;
  /** 大小写/全角转换。 */
  transform?: TextTransform;
  /** 下划线。 */
  underline?: boolean;
  /** 删除线。 */
  strikethrough?: boolean;
  /**
   * 截断:true/'end' 单行尾部省略;'start' 头部省略(用 direction 技巧)。
   * 兼容:'start' 截断依赖 direction:rtl 翻转,内含西文+数字时方向感可能反直觉。
   */
  truncate?: boolean | 'end' | 'start';
  /**
   * 多行省略行数。
   * 兼容:基于 -webkit-line-clamp(需 display:-webkit-box),Chrome/Safari/FF 现代版均支持;
   * 与 padding-bottom 同用时末行可能透出;无法与 'start' 截断叠加。
   */
  lineClamp?: number;
  /**
   * 折行策略。
   * 兼容:'balance'(均衡标题行)/'pretty'(避免孤字)= text-wrap,Safari 17.4+/Chrome 114+/FF 121+;
   * 旧浏览器自动回退普通换行(渐进增强,无副作用)。
   */
  wrap?: TextWrap;
  /** 空白处理(pre/pre-wrap 保留换行与缩进,代码/预格式文本用)。 */
  whitespace?: TextWhitespace;
  /** 长串/URL 强制断行(overflow-wrap:anywhere)。 */
  breakWord?: boolean;
  /**
   * 西文连字符断词(hyphens:auto)。
   * 兼容:需配合元素/祖先的 lang 属性才生效;CJK 无意义。Safari 走 -webkit-hyphens(已加)。
   */
  hyphens?: boolean;
  /** 文本方向(写入原生 dir;auto 由内容首个强方向字符决定,适合用户生成内容防 bidi 串位)。 */
  dir?: 'ltr' | 'rtl' | 'auto';
  /**
   * 数字变体(tabular=等宽数字,表格/价格对齐必备)。
   * 兼容:依赖字体含对应 OpenType 特性,缺失时静默回退默认数字。
   */
  numeric?: TextNumeric;
  /** 小型大写(font-variant-caps,优于 text-transform 因保留字形设计)。 */
  smallCaps?: boolean;
  /** 是否可选中(false → user-select:none)。 */
  selectable?: boolean;
  /**
   * 渐变文字:true/'tone' 用 tone 槽位渐变;'aurora' 加渐变流动动画(受 motion 档调制)。
   * 兼容:基于 background-clip:text(+ -webkit- 前缀),广泛支持;
   *   不支持环境(@supports 检测)自动回退为 tone 实色,绝不透明裸奔。
   */
  gradient?: boolean | 'tone' | 'aurora';
  /** 发光文字(text-shadow,受全局 --ms-fx-glow 调制,data-ms-fx=off 时消失)。 */
  glow?: boolean | 'soft' | 'strong';
  /**
   * 描边/镂空文字(-webkit-text-stroke)。
   * 兼容:-webkit-text-stroke 非标准但全主流浏览器(含 FF)支持;镂空态注意对比度。
   */
  stroke?: boolean;
  /**
   * 魔法动效:reveal 上浮淡入 / blur-in 模糊聚焦入场;shimmer 渐变扫过 / pulse 发光呼吸 /
   * flow 渐变流动(持续)。全部受全局 data-ms-motion 与 prefers-reduced-motion 调制,
   * 关闭时自动降级为静态(入场态直接呈现、不卡在隐藏)。shimmer/pulse/flow 复用 tone 槽位。
   */
  animate?: TextAnimate;
  /**
   * 书写方向:vertical=竖排(CJK 古籍 / 侧栏标签)。
   * 兼容:writing-mode 全主流浏览器支持;竖排下西文与标点会旋转,按需配 text-orientation(逃生舱)。
   */
  writingMode?: TextWritingMode;
}

export type TextProps = TextOwnProps & Omit<ComponentPropsWithoutRef<'span'>, keyof TextOwnProps>;

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/**
 * Text —— 文字排版旗舰核心(category: typography)。
 *
 * 多态(`as` / `asChild`)的内联/块级文字原语,把「所有可控文字属性」收成 props:
 * 字族/字号/字重/斜体、tone 着色、对齐/行高/字距、装饰/transform、截断(单行+多行)、
 * 折行/空白/断词/方向、数字变体/小型大写,以及魔法文字(渐变/发光/描边)。
 *
 * **留口**:`...rest` 透传所有原生属性与事件;`className`/`style` 与组件计算值合并(用户值优先);
 * `forwardRef` 到渲染元素;`asChild` 把样式合并到自带子元素。
 * **逃生舱**:未升为 prop 的冷门属性(font-feature-settings、text-emphasis、paint-order、
 * hanging-punctuation、mix-blend-mode 等)直接走 `style`/`className`。
 *
 * 兼容性备注集中在各 prop 的 TSDoc(truncate/lineClamp/wrap/hyphens/gradient/stroke 等),不藏着。
 * 样式见 Text.css + 共享 token typography.css,需引入 @magic-scope/react/styles.css。
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as,
    asChild = false,
    family,
    size,
    weight,
    italic,
    color,
    tone,
    dimmed,
    align,
    leading,
    tracking,
    transform,
    underline,
    strikethrough,
    truncate,
    lineClamp,
    wrap,
    whitespace,
    breakWord,
    hyphens,
    dir,
    numeric,
    smallCaps,
    selectable,
    gradient,
    glow,
    stroke,
    animate,
    writingMode,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  // 魔法效果需要 tone 槽位(--ms-c / --ms-c-glow);未显式给 tone 时兜底 primary
  const animateNeedsSlot = animate === 'shimmer' || animate === 'pulse' || animate === 'flow';
  const needsSlot = gradient != null || glow != null || stroke != null || animateNeedsSlot;
  const effectiveTone = tone ?? (needsSlot ? 'primary' : undefined);

  const styleVars: Record<string, string | number> = {};
  if (typeof weight === 'number') styleVars['--ms-text-weight'] = weight;
  if (lineClamp != null) styleVars['--ms-line-clamp'] = lineClamp;

  const classes = cx(
    'ms-text',
    size && `ms-text--size-${size}`,
    family && `ms-text--family-${family}`,
    typeof weight === 'string' && `ms-text--weight-${weight}`,
    italic && 'ms-text--italic',
    effectiveTone && `ms-tone-${effectiveTone}`,
    tone && 'ms-text--toned',
    dimmed && 'ms-text--dimmed',
    align && `ms-text--align-${align}`,
    leading && `ms-text--leading-${leading}`,
    tracking && `ms-text--tracking-${tracking}`,
    transform && `ms-text--transform-${transform}`,
    underline && 'ms-text--underline',
    strikethrough && 'ms-text--strikethrough',
    truncate && 'ms-text--truncate',
    truncate === 'start' && 'ms-text--truncate-start',
    lineClamp != null && 'ms-text--clamp',
    wrap && `ms-text--wrap-${wrap}`,
    whitespace && `ms-text--ws-${whitespace}`,
    breakWord && 'ms-text--break',
    hyphens && 'ms-text--hyphens',
    numeric && `ms-text--numeric-${numeric}`,
    smallCaps && 'ms-text--small-caps',
    selectable === false && 'ms-text--no-select',
    gradient && 'ms-text--gradient',
    gradient === 'aurora' && 'ms-text--gradient-aurora',
    glow && 'ms-text--glow',
    glow === 'strong' && 'ms-text--glow-strong',
    stroke && 'ms-text--stroke',
    animate && `ms-text--anim-${animate}`,
    writingMode === 'vertical' && 'ms-text--vertical',
    className,
  );

  // 组件计算样式在前,用户 style 在后(用户值优先);color prop 介于其间
  const mergedStyle: CSSProperties = {
    ...(styleVars as CSSProperties),
    ...(color ? { color } : {}),
    ...style,
  };

  // asChild:把样式与 props 合并到唯一子元素(Slot 模式)
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; style?: CSSProperties }>;
    return cloneElement(child, {
      ...rest,
      ...(dir ? { dir } : {}),
      ...(child.props as object),
      className: cx(classes, child.props.className),
      style: { ...mergedStyle, ...child.props.style },
    });
  }

  const Comp = (as ?? 'span') as ElementType;
  return (
    <Comp ref={ref} className={classes} style={mergedStyle} dir={dir} {...rest}>
      {children}
    </Comp>
  );
});
Text.displayName = 'Text';
