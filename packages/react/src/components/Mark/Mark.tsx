import type { CSSProperties, ElementType, ReactNode } from 'react';
import { Fragment, forwardRef } from 'react';
import { splitByMatches } from './logic';

export type MarkTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** 细粒度类名槽位:分别精修「容器」与「命中片段」。 */
export interface MarkClassNames {
  /** 外层容器(渲染 children 的多态根元素)。 */
  root?: string | undefined;
  /** 每个命中片段的 <mark>。 */
  hit?: string | undefined;
}

export interface MarkProps {
  /** 被高亮的纯文本(本组件按字符串切分,非字符串 children 不做处理直接渲染)。 */
  children?: ReactNode;
  /** 搜索词:单个词或多个词。空串 / 空数组 → 原样返回(不高亮)。 */
  search?: string | string[] | undefined;
  /** 区分大小写(默认 false:不区分)。 */
  caseSensitive?: boolean | undefined;
  /** 整词匹配:命中片段两侧须为单词边界(默认 false)。 */
  wholeWord?: boolean | undefined;
  /** 高亮色调(复用全库 tone 槽位 --ms-c / --ms-c-glow)。默认 warning。 */
  tone?: MarkTone | undefined;
  /** 多态容器标签(默认 span)。 */
  as?: ElementType | undefined;
  /** 容器额外类名(等价 classNames.root 的便捷写法,二者都会拼上)。 */
  className?: string | undefined;
  /** 容器内联样式。 */
  style?: CSSProperties | undefined;
  /** 细粒度类名槽位。 */
  classNames?: MarkClassNames | undefined;
  /** id 透传到容器。 */
  id?: string | undefined;
  /** data-* 透传到容器。 */
  [key: `data-${string}`]: unknown;
}

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/**
 * Mark —— 文本高亮(category: typography)。
 *
 * 把 `children`(纯文本串)里命中 `search` 的片段包进语义化 `<mark>`,未命中原样输出。
 * 命中规则(大小写 / 整词 / 多词 / 重叠合并 / 正则字符按字面量)全在零依赖的 `logic.ts`,
 * 组件只负责把切片接进 DOM —— 用于搜索结果关键词高亮、文档内检索定位等。
 *
 * **a11y**:命中片段用原生 `<mark>` 元素(辅助技术可识别为「高亮 / 相关」文本)。
 * **内容边界**:容器 `overflow-wrap:anywhere`,超长无空格串不撑破布局。
 * **留口**:`as` 多态容器;`className` / `style` / `classNames`(root / hit)细粒度槽位;
 *   非字符串 children(如已是元素)不切分、原样渲染。
 * **降级**:空 `search` 或无命中时,容器内即原文,无多余包裹语义负担。
 *
 * 样式见 Mark.css + 共享 tone.css(.ms-tone-{tone}),需引入 @magic-scope/react/styles.css。
 */
export const Mark = forwardRef<HTMLElement, MarkProps>(function Mark(
  {
    children,
    search,
    caseSensitive,
    wholeWord,
    tone = 'warning',
    as,
    className,
    style,
    classNames,
    ...rest
  },
  ref,
) {
  const Comp = (as ?? 'span') as ElementType;
  const rootClass = cx('ms-mark', classNames?.root, className);

  // 仅对纯文本 children 做高亮切分;非字符串(元素 / 数字 / 数组)原样渲染,避免破坏结构。
  let content: ReactNode = children;
  if (typeof children === 'string' && children.length > 0) {
    const segments = splitByMatches(children, search ?? '', {
      caseSensitive: caseSensitive ?? false,
      wholeWord: wholeWord ?? false,
    });
    content = segments.map((seg, i) =>
      seg.matched ? (
        // biome-ignore lint/suspicious/noArrayIndexKey: 段序在同一份输入下稳定,且段无独立标识
        <mark key={i} className={cx('ms-mark__hit', `ms-tone-${tone}`, classNames?.hit)}>
          {seg.text}
        </mark>
      ) : (
        // biome-ignore lint/suspicious/noArrayIndexKey: 同上,未命中段亦无独立标识
        <Fragment key={i}>{seg.text}</Fragment>
      ),
    );
  }

  return (
    <Comp ref={ref} className={rootClass} style={style} {...rest}>
      {content}
    </Comp>
  );
});
Mark.displayName = 'Mark';
