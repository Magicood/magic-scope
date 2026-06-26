import type { ComponentPropsWithoutRef, KeyboardEvent, ReactElement, ReactNode, Ref } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { composeEventHandlers, composeRefs, mergeAsChildProps } from '../../utils/compose';

export type CardVariant = 'elevated' | 'outline';
export type CardTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  /** 视觉变体:elevated(surface 底 + 柔和阴影)/ outline(透明底 + 描边)。默认 elevated。 */
  variant?: CardVariant;
  /** 语义色调,经全库统一 tone resolver 派生配色(描边 / 发光 / 柔底)。默认 neutral(无强语义色,沿用中性表面)。 */
  tone?: CardTone;
  /** 内边距档位(随密度 --ms-density-scale 缩放):none 供满血媒体 / sm / md / lg。默认 md。 */
  padding?: CardPadding;
  /** 可交互:true 时 hover 上浮 + 奥术发光、暴露键盘聚焦环(tabIndex/focus-visible),并支持 Enter/Space 触发 onClick。 */
  interactive?: boolean;
  /** 渲染为子元素(如 <a> / <article> / 路由 Link)并保留卡片样式与 interactive 行为(Radix Slot 风格;由子元素自带内容)。 */
  asChild?: boolean;
}

/**
 * Card —— 内容卡片容器(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * elevated 用 surface 底配柔和阴影,outline 用透明底配描边;tone 经全库 tone resolver 派生语义配色(只读 6 槽位);
 * interactive 时 hover 上浮发光 + 键盘聚焦环 + Enter/Space 激活;padding 随密度缩放、none 供满血媒体;asChild 多态渲染。
 * 配套子部件 CardHeader/CardBody/CardFooter/CardTitle/CardMedia 可自由组合。尊重 reduced-motion 与 data-ms-fx/motion 总闸。
 * 样式见同目录 Card.css,需引入 @magic-scope/react/styles.css。
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'elevated',
      tone = 'neutral',
      padding = 'md',
      interactive = false,
      asChild = false,
      className,
      tabIndex,
      onKeyDown,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = [
      'ms-card',
      `ms-card--${variant}`,
      `ms-card--pad-${padding}`,
      `ms-tone-${tone}`,
      interactive && 'ms-card--interactive',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // interactive 键盘激活:Enter / Space 合成一次 click(供非 button 根元素具备「像按钮一样」的可达性)。
    // 用 composeEventHandlers 先调用户的 onKeyDown,用户未 preventDefault 才执行内部激活,绝不替换。
    const handleKeyDown = interactive
      ? composeEventHandlers(onKeyDown, (event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
            // Space 默认会滚动页面;作为激活键时阻止其默认滚动
            if (event.key !== 'Enter') event.preventDefault();
            event.currentTarget.click();
          }
        })
      : onKeyDown;

    const resolvedTabIndex = interactive ? (tabIndex ?? 0) : tabIndex;

    // asChild:把样式与卡片 props 合并到子元素(子元素自带内容),用于 <a> / <article> / 路由 Link。
    // 事件 compose(子元素与 Card 的同名处理器都执行)、ref 合并到子元素(外部 ref 能拿到真实 DOM)。
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const parentProps: Record<string, unknown> = {
        ...props,
        className: classes,
      };
      if (resolvedTabIndex !== undefined) parentProps.tabIndex = resolvedTabIndex;
      if (handleKeyDown) parentProps.onKeyDown = handleKeyDown;
      const merged = mergeAsChildProps(parentProps, child.props);
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: interactive 卡片的 onKeyDown 仅做 Enter/Space → click 的键盘平权(compose 用户 handler);语义角色(role / asChild 渲染 a)由使用方按场景决定,组件不武断注入 role 以免与卡内交互子元素冲突
      <div
        ref={ref}
        tabIndex={resolvedTabIndex}
        onKeyDown={handleKeyDown}
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';

// —— 子部件:可组合的语义容器,与 Card 共享 tone / surface 语境 ——

export interface CardHeaderProps extends ComponentPropsWithoutRef<'div'> {
  /** 标题区右侧的操作槽(按钮 / 菜单等),自动靠右对齐。 */
  action?: ReactNode;
}

/**
 * CardHeader —— 卡片头部区。承载标题 / 副标题,可选 action 槽位贴右(如关闭按钮 / 更多菜单)。
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ action, className, children, ...props }, ref) => (
    <div ref={ref} className={['ms-card__header', className].filter(Boolean).join(' ')} {...props}>
      <div className="ms-card__header-content">{children}</div>
      {action != null && <div className="ms-card__header-action">{action}</div>}
    </div>
  ),
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends Omit<ComponentPropsWithoutRef<'h3'>, 'title'> {
  /** 渲染的标题标签,默认 h3(保证文档大纲语义可控)。 */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  /** 副标题 / 描述,渲染在主标题下方(fg-muted)。 */
  subtitle?: ReactNode;
}

/**
 * CardTitle —— 卡片标题。默认 h3,可经 as 调整大纲层级;subtitle 渲染弱化副标题。
 */
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Tag = 'h3', subtitle, className, children, ...props }, ref) => (
    <div className="ms-card__title-group">
      <Tag
        ref={ref as Ref<HTMLHeadingElement>}
        className={['ms-card__title', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </Tag>
      {subtitle != null && <p className="ms-card__subtitle">{subtitle}</p>}
    </div>
  ),
);
CardTitle.displayName = 'CardTitle';

export type CardBodyProps = ComponentPropsWithoutRef<'div'>;

/**
 * CardBody —— 卡片主体内容区。常规正文密度,继承 Card 的内边距上下文。
 */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={['ms-card__body', className].filter(Boolean).join(' ')} {...props} />
  ),
);
CardBody.displayName = 'CardBody';

export interface CardFooterProps extends ComponentPropsWithoutRef<'div'> {
  /** 子项水平对齐:start / between / end。默认 end(操作按钮通常贴右)。 */
  align?: 'start' | 'between' | 'end';
}

/**
 * CardFooter —— 卡片底部操作区。默认贴右排布操作按钮,可经 align 调整。
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'end', className, ...props }, ref) => (
    <div
      ref={ref}
      className={['ms-card__footer', `ms-card__footer--${align}`, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

export interface CardMediaProps extends ComponentPropsWithoutRef<'div'> {
  /** 图片地址(便捷用法);也可直接传 children 放任意媒体节点。 */
  src?: string;
  /** 图片替代文本(传 src 时建议提供)。 */
  alt?: string;
  /** 宽高比(CSS aspect-ratio,如 "16 / 9");限定媒体高度、防累积布局偏移。 */
  ratio?: string;
}

/**
 * CardMedia —— 卡片媒体区(满血出血图 / 视频)。配合 Card padding="none" 可让媒体铺满卡片边缘。
 * 传 src 走内置 <img>(object-fit: cover),或直接传 children 放自定义媒体。
 */
export const CardMedia = forwardRef<HTMLDivElement, CardMediaProps>(
  ({ src, alt = '', ratio, className, style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={['ms-card__media', className].filter(Boolean).join(' ')}
      style={ratio ? { aspectRatio: ratio, ...style } : style}
      {...props}
    >
      {src != null ? <img className="ms-card__media-img" src={src} alt={alt} /> : children}
    </div>
  ),
);
CardMedia.displayName = 'CardMedia';
