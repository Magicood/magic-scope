import type { ComponentPropsWithoutRef, ElementType, ReactElement, Ref } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';

export interface VisuallyHiddenOwnProps {
  /**
   * 多态根标签(默认 span)。需要块级语义或落在特定标签里时改用 div/label/h2 等。
   */
  as?: ElementType;
  /**
   * 渲染为唯一子元素并把样式/props 合并上去(Radix Slot 模式;如包裹路由 Link / 自带交互元素)。
   * 与 as 互斥:asChild 为真时忽略 as,直接复用子元素作为渲染根。
   */
  asChild?: boolean;
  /**
   * skip-link 模式:聚焦时临时还原可见(`:focus` / `:focus-within` 解除裁剪)。
   * 用于「跳到主内容」等键盘可达但视觉隐藏的锚点 —— 平时隐身,Tab 聚焦时浮现。
   * 注意:开启后该元素须自身可聚焦(如 `<a href>` 或带 tabIndex),否则 `:focus` 永不命中。
   */
  focusable?: boolean;
}

export type VisuallyHiddenProps = VisuallyHiddenOwnProps &
  Omit<ComponentPropsWithoutRef<'span'>, keyof VisuallyHiddenOwnProps>;

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/**
 * VisuallyHidden —— 无障碍隐藏(category: utility)。
 *
 * 把内容**视觉隐藏但保留给屏幕阅读器**:用标准 `sr-only` 技法(`position:absolute` + `1px` 尺寸 +
 * `clip` 裁剪 + `overflow:hidden`),刻意不用 `display:none` / `visibility:hidden` —— 后两者会把元素
 * 从无障碍树里摘掉,SR 也读不到,与本组件意图相悖。
 *
 * 典型用途:给纯图标按钮补可读标签、给表单控件补隐藏说明、给区块补朗读标题,以及 `focusable` 的
 * 「跳到主内容」skip-link(平时隐身、键盘 Tab 聚焦时浮现)。
 *
 * **留口**:`...rest` 透传所有原生属性与事件;`className` 与组件类名合并(用户类在后);
 * `forwardRef` 到渲染元素;`as` 换根标签;`asChild` 把类/props/ref 合并到自带子元素(事件 compose)。
 * 样式见同目录 VisuallyHidden.css(`.ms-visually-hidden`),需引入 @magic-scope/react/styles.css。
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden(
  { as, asChild = false, focusable = false, className, children, ...rest },
  ref,
) {
  const classes = cx('ms-visually-hidden', focusable && 'ms-visually-hidden--focusable', className);

  // asChild:把类/props/ref 合并到唯一子元素(Slot 模式;事件 compose、ref 合并)。
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childRef = (child as { ref?: Ref<unknown> }).ref;
    const merged = mergeAsChildProps({ ...rest, className: classes }, child.props);
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref as Ref<unknown>, childRef),
    } as Record<string, unknown>);
  }

  const Comp = (as ?? 'span') as ElementType;
  return (
    <Comp ref={ref} className={classes} {...rest}>
      {children}
    </Comp>
  );
});
VisuallyHidden.displayName = 'VisuallyHidden';
