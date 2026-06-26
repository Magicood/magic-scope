import type { ComponentPropsWithoutRef, ElementType, ReactElement, Ref } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';

export type ProseSize = 'sm' | 'md' | 'lg';
export type ProseTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface ProseOwnProps {
  /** 多态渲染标签。默认 div;语义场景按需 article / section / main 等。 */
  as?: ElementType;
  /**
   * 渲染为唯一子元素并把 prose 类与 props 合并上去(Slot 模式),
   * 用于已经存在的容器(如把排版套到外部布局节点)上而不额外包一层 DOM。
   */
  asChild?: boolean;
  /** 整体字号档(sm 紧凑 / md 默认 / lg 阅读放大),通过基准字号驱动全部子元素相对缩放。 */
  size?: ProseSize;
  /** 链接 / 强调 / 引用条等点缀色调,复用全库 tone resolver 的槽位变量。默认 primary。 */
  tone?: ProseTone;
  /**
   * 细粒度 classNames 槽位:`root` 拼到根节点。
   * (Prose 子元素由 HTML 内容动态生成,无法逐元素挂类,故只暴露根槽位;
   * 需要逐元素定制时直接用后代选择器覆写 `.ms-prose <tag>`。)
   */
  classNames?: {
    root?: string;
  };
}

export type ProseProps = ProseOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof ProseOwnProps>;

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/**
 * Prose —— 富文本 / HTML 内容容器排版(category: typography)。
 *
 * 给一段已渲染好的 HTML / JSX 内容(markdown 输出、CMS 富文本、MDX 等)套上全库排版样式:
 * 组件本体很轻(多态 `as` / `asChild` + `className` / `classNames` + `children`),
 * **重头在 Prose.css**:用后代选择器为 `.ms-prose` 内的 h1-h6 / p / ul / ol / li / blockquote /
 * code / pre / a / hr / table / th / td / img / figure / strong / em / kbd 等设定排版(字号阶梯走
 * `--ms-type-step-*`、标题用 `--ms-font-sans`、正文行距 `--ms-leading-*`、链接走 tone 槽位、
 * code/pre 用 `--ms-font-mono` + surface-sunken 底、blockquote 左条、表格边框),
 * 全部消费 `--ms-*` token 并随 `data-ms-density` 缩放。
 *
 * **不内置 `dangerouslySetInnerHTML`**:由调用方传 JSX `children`,
 * 或自行在传入的元素上用原生 `dangerouslySetInnerHTML`(`<Prose><div dangerouslySetInnerHTML={...} /></Prose>`),
 * 把「是否信任这段 HTML」的安全决策留给调用方。
 *
 * **留口**:`...rest` 透传原生属性 / 事件;`className` 与组件类合并(用户值在后);
 * `forwardRef` 到渲染元素;`asChild` 把 prose 类合并到自带子元素。
 *
 * a11y:渲染的是语义元素(标题层级 / 列表 / 表格 / 链接),天然可达;组件不破坏内容语义。
 * 内容边界:超长 code / URL 不撑破(pre 横向滚动、行内长串 anywhere 断行、表格可横向滚动)。
 *
 * 样式见 Prose.css + 共享 token,需引入 @magic-scope/react/styles.css。
 */
export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose(
  { as, asChild = false, size = 'md', tone = 'primary', classNames, className, children, ...rest },
  ref,
) {
  const classes = cx(
    'ms-prose',
    `ms-prose--${size}`,
    `ms-tone-${tone}`,
    classNames?.root,
    className,
  );

  // asChild:把 prose 类与 props 合并到唯一子元素(Slot 模式),不额外包一层 DOM
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childRef = (child as { ref?: Ref<unknown> }).ref;
    const merged = mergeAsChildProps({ ...rest, className: classes }, child.props);
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref as Ref<unknown>, childRef),
    } as Record<string, unknown>);
  }

  const Comp = (as ?? 'div') as ElementType;
  return (
    <Comp ref={ref} className={classes} {...rest}>
      {children}
    </Comp>
  );
});
Prose.displayName = 'Prose';
