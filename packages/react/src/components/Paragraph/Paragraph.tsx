import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode,
} from 'react';
import { forwardRef, isValidElement, useCallback, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';
import {
  type CopyableProp,
  copyText,
  type EllipsisProp,
  resolveCopyable,
  resolveEllipsis,
} from './logic';

export type ParagraphSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type ParagraphLeading = 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
export type ParagraphTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type ParagraphAlign = 'start' | 'end' | 'center' | 'justify';

/** classNames 映射:除根外可单独定制的关键子部件。 */
export interface ParagraphClassNames {
  /** 文本主体(承载省略/clamp 的元素)。 */
  content?: string;
  /** 展开/收起切换按钮。 */
  toggle?: string;
  /** 复制按钮。 */
  copy?: string;
}

export interface ParagraphOwnProps {
  /** 多态渲染根标签(默认 p)。语义场景可换 div/article 段落容器等。 */
  as?: ElementType;
  /** 渲染为唯一子元素并把样式/props 合并上去(Slot 模式)。注意:asChild 下不渲染复制/展开按钮。 */
  asChild?: boolean;
  /** 字号档(走 --ms-type-step-* 流式字阶)。默认 base。 */
  size?: ParagraphSize;
  /** 行高语义档。正文默认 relaxed(更舒展易读)。 */
  leading?: ParagraphLeading;
  /** 语义色调(复用全库 tone resolver 的 --ms-c)。 */
  tone?: ParagraphTone;
  /** 弱化为次要前景色(fg-muted),用于辅助说明文字。 */
  dimmed?: boolean;
  /** 文本对齐(逻辑值 start/end,RTL 友好)。 */
  align?: ParagraphAlign;
  /**
   * 多行省略:`true` 单行尾部省略;对象 `{ rows, expandable, symbol }` 多行 clamp + 可选展开/收起。
   * 兼容:基于 -webkit-line-clamp(需 display:-webkit-box),Chrome/Safari/FF 现代版均支持。
   * expandable=true 时渲染「展开/收起」按钮(走 typography.expand/collapse 文案)。
   */
  ellipsis?: EllipsisProp | undefined;
  /**
   * 复制:`true` 复制段落自身可见文本;对象 `{ text, onCopy }` 自定义文本与成功回调。
   * 走 navigator.clipboard(降级 execCommand);复制成功瞬间触发一次 glow 闪烁
   * (受 data-ms-fx / prefers-reduced-motion 降级)。文案走 typography.copy/copied。
   */
  copyable?: CopyableProp | undefined;
  /** 展开/收起状态变化回调(expandable 时)。 */
  onExpandChange?: ((expanded: boolean) => void) | undefined;
  /** 关键子部件 className 映射。 */
  classNames?: ParagraphClassNames | undefined;
  children?: ReactNode;
}

export type ParagraphProps = ParagraphOwnProps &
  Omit<ComponentPropsWithoutRef<'p'>, keyof ParagraphOwnProps>;

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/**
 * Paragraph —— 块级正文段落(category: typography)。
 *
 * 围绕 `<p>` 的生产级正文原语:size/leading/tone/dimmed/align 排版档,
 * 多行省略(`ellipsis`,可带 AntD 式「展开/收起」),一键复制(`copyable`,复制成功触发 glow 一闪)。
 * 复制与展开的纯逻辑抽到 ./logic(零 React),组件层只管 state 与渲染。
 *
 * **留口**:`...rest` 透传所有原生属性与事件(根上的用户 onClick 等原样透传、组件不抢占);
 * `className`/`style` 给根、`classNames` 映射给子部件;`forwardRef` 到根;
 * `as` 多态 / `asChild` Slot(经 mergeAsChildProps + composeRefs 合并到子元素,asChild 下不挂复制/展开按钮,纯样式合并);
 * 补 onExpandChange / copyable.onCopy 语义回调。
 * **i18n**:展开/收起/复制文案走 useMessages(typography.expand/collapse/copy/copied)。
 *
 * 样式见 Paragraph.css + 共享 token typography.css / tone.css,需引入 @magic-scope/react/styles.css。
 */
export const Paragraph = forwardRef<HTMLElement, ParagraphProps>(function Paragraph(
  {
    as,
    asChild = false,
    size,
    leading,
    tone,
    dimmed,
    align,
    ellipsis,
    copyable,
    onExpandChange,
    classNames,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const t = useMessages();
  const contentRef = useRef<HTMLElement | null>(null);

  const resolvedEllipsis = resolveEllipsis(ellipsis);
  const resolvedCopyable = resolveCopyable(copyable);

  // 展开/收起状态(仅当多行可展开时有意义)
  const [expanded, setExpanded] = useState(false);
  // 复制反馈:刚复制完短暂置 true(切换文案 + 触发 glow 闪)
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const expandable = resolvedEllipsis?.expandable ?? false;
  // 展开后取消 clamp;未展开按 rows 截断
  const clamped = resolvedEllipsis != null && !(expandable && expanded);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      onExpandChange?.(next);
      return next;
    });
  }, [onExpandChange]);

  const setContentRef = useCallback((node: HTMLElement | null) => {
    contentRef.current = node;
  }, []);

  const handleCopy = useCallback(async () => {
    if (!resolvedCopyable) return;
    const text =
      resolvedCopyable.text ?? contentRef.current?.textContent ?? readChildrenText(children);
    const ok = await copyText(text);
    if (!ok) return;
    resolvedCopyable.onCopy?.(text);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1600);
  }, [resolvedCopyable, children]);

  const styleVars: Record<string, string | number> = {};
  if (resolvedEllipsis != null) styleVars['--ms-line-clamp'] = resolvedEllipsis.rows;

  // 需要 tone 槽位:显式 tone,或复制 glow 需要 --ms-c-glow,兜底 primary
  const effectiveTone = tone ?? (resolvedCopyable ? 'primary' : undefined);

  const rootClasses = cx(
    'ms-paragraph',
    size && `ms-paragraph--size-${size}`,
    leading && `ms-paragraph--leading-${leading}`,
    effectiveTone && `ms-tone-${effectiveTone}`,
    tone && 'ms-paragraph--toned',
    dimmed && 'ms-paragraph--dimmed',
    align && `ms-paragraph--align-${align}`,
    (resolvedCopyable != null || expandable) && 'ms-paragraph--has-actions',
    className,
  );

  const mergedStyle: CSSProperties = {
    ...(styleVars as CSSProperties),
    ...style,
  };

  // asChild:把样式与 props 合并到唯一子元素(Slot 模式);不挂复制/展开按钮(无处安放)
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      className?: string;
      style?: CSSProperties;
      ref?: React.Ref<unknown>;
    }>;
    const childRef = (child as { ref?: React.Ref<unknown> }).ref;
    const merged = mergeAsChildProps(
      { ...rest, className: rootClasses, style: mergedStyle },
      child.props as Record<string, unknown>,
    );
    return (
      <child.type {...merged} ref={composeRefs(ref as React.Ref<unknown>, childRef ?? null)} />
    );
  }

  const Comp = (as ?? 'p') as ElementType;

  // 文本主体:承载 clamp 的元素。有省略符号 + clamp 时把符号渲染为伪兜底(浏览器自带 … 通常已足够,
  // 用户显式给 symbol 时用 data 属性透出供 CSS::after 消费)。
  const contentClassName = cx(
    'ms-paragraph__content',
    clamped && 'ms-paragraph__content--clamp',
    classNames?.content,
  );

  return (
    <Comp ref={ref} className={rootClasses} style={mergedStyle} {...rest}>
      <span
        ref={setContentRef}
        className={contentClassName}
        data-ms-symbol={clamped ? resolvedEllipsis?.symbol : undefined}
      >
        {children}
      </span>
      {expandable && (
        <button
          type="button"
          className={cx('ms-paragraph__toggle', classNames?.toggle)}
          aria-expanded={expanded}
          onClick={toggleExpand}
        >
          {t(expanded ? 'typography.collapse' : 'typography.expand')}
        </button>
      )}
      {resolvedCopyable != null && (
        <button
          type="button"
          className={cx(
            'ms-paragraph__copy',
            copied && 'ms-paragraph__copy--copied',
            classNames?.copy,
          )}
          aria-label={t(copied ? 'typography.copied' : 'typography.copy')}
          data-copied={copied || undefined}
          onClick={handleCopy}
        >
          <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
        </button>
      )}
    </Comp>
  );
});
Paragraph.displayName = 'Paragraph';

/** 从 ReactNode 子树里抽纯文本(复制兜底用,textContent 拿不到时)。 */
function readChildrenText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(readChildrenText).join('');
  if (isValidElement(node)) {
    return readChildrenText((node.props as { children?: ReactNode }).children);
  }
  return '';
}
