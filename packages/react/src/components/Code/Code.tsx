import type { ComponentPropsWithoutRef, CSSProperties, MouseEvent, ReactElement, Ref } from 'react';
import { cloneElement, forwardRef, isValidElement, useCallback, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';
import { codeTextFromChildren, writeClipboard } from './logic';

export type CodeVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type CodeTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type CodeSize = 'sm' | 'md' | 'lg';

export interface CodeOwnProps {
  /**
   * 块级渲染:`<pre><code>` + 保留空白(white-space:pre)+ 横向滚动(overflow-x:auto)。
   * 默认 false → 行内 `<code>`(随正文流式)。
   */
  block?: boolean;
  /** 视觉变体:实底 / 柔色 / 描边 / 幽灵。默认 soft(行内/块级都克制不抢眼)。 */
  variant?: CodeVariant;
  /** 语义色调,经全库 tone resolver 派生配色(只读 6 槽位,不写死配色)。默认 neutral。 */
  tone?: CodeTone;
  /** 尺寸档(走 --ms-type-step-* 字阶,随 data-ms-density 缩放)。默认 md。 */
  size?: CodeSize;
  /** 等宽字体(--ms-font-mono)。默认 true;设 false 走继承字体(罕见,如展示比例字体代码)。 */
  mono?: boolean;
  /**
   * Tab 缩进列数(仅块级有意义,映射到 tab-size)。
   * 兼容:tab-size 全主流浏览器支持;行内代码通常无制表符,不渲染该属性。
   */
  tabSize?: number;
  /**
   * 行号(仅块级):为每个换行渲染计数槽。需要内容是纯文本/简单结构(按 \n 切行)。
   * 兼容:基于 CSS counter,不参与选区复制(复制仍得纯代码)。
   */
  lineNumbers?: boolean;
  /**
   * 可复制(仅块级):右上角复制按钮,点击写剪贴板并切换为「已复制」反馈。
   * 文案走 i18n(typography.copy / typography.copied)。
   */
  copyable?: boolean;
  /** 复制内容的显式覆盖。不给时从 children 抽取纯文本。 */
  copyText?: string;
  /** 复制成功反馈持续毫秒数。默认 1600。 */
  copyTimeout?: number;
  /** 复制完成回调(无论成功与否都触发,带 success 标志,便于上报/toast)。 */
  onCopy?: (text: string, success: boolean) => void;
  /** 发光(text-shadow,受全局 --ms-fx-glow 调制;data-ms-fx=off 时消失)。视觉点缀。 */
  glow?: boolean | 'soft' | 'strong';
  /** 渲染为唯一子元素并合并样式/props(Slot 模式;仅非块级、非 copyable 场景)。 */
  asChild?: boolean;
  /** 关键子部件 className 映射。 */
  classNames?: {
    /** 块级时的内层 `<code>`(.ms-code__code) */
    code?: string;
    /** 复制按钮(.ms-code__copy) */
    copy?: string;
  };
}

export type CodeProps = CodeOwnProps & Omit<ComponentPropsWithoutRef<'code'>, keyof CodeOwnProps>;

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/**
 * Code —— 代码原语(category: typography)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 行内默认 `<code>`,`block` 切到 `<pre><code>`(保留空白 + 横向滚动 + tabSize)。
 * 变体 solid/soft/outline/ghost × tone 走全库 tone resolver(只读 6 槽位,零硬编码配色);
 * mono 等宽字体、size 走流式字阶;块级支持 copyable(剪贴板 + 已复制反馈,文案走 i18n)、
 * lineNumbers(CSS counter,不污染复制内容);glow 发光点缀(尊重 data-ms-fx / reduced-motion)。
 *
 * **留口**:`...rest` 透传所有原生属性与事件;`className`/`style` 与计算值合并(用户值优先);
 * `forwardRef` 到根;`asChild` 把样式合并到子元素(行内场景);`classNames` 定制内层 code / 复制按钮;
 * `onCopy` 语义回调。复制/抽文本纯逻辑在同目录 logic.ts(零 React)。
 *
 * 样式见同目录 Code.css,需引入 @magic-scope/react/styles.css。
 */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  {
    block = false,
    variant = 'soft',
    tone = 'neutral',
    size = 'md',
    mono = true,
    tabSize,
    lineNumbers = false,
    copyable = false,
    copyText,
    copyTimeout = 1600,
    onCopy,
    glow,
    asChild = false,
    classNames,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const t = useMessages();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // 复制内容:显式 copyText 优先,否则从 children 抽纯文本
  const contentRef = useRef<HTMLElement | null>(null);

  const handleCopy = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const text =
        copyText ?? contentRef.current?.textContent ?? codeTextFromChildren(children) ?? '';
      const ok = await writeClipboard(text);
      onCopy?.(text, ok);
      if (ok) {
        setCopied(true);
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopied(false), copyTimeout);
      }
    },
    [copyText, children, onCopy, copyTimeout],
  );

  const effectiveGlow = glow ?? false;
  const classes = cx(
    'ms-code',
    block ? 'ms-code--block' : 'ms-code--inline',
    `ms-code--${variant}`,
    `ms-code--${size}`,
    `ms-tone-${tone}`,
    mono && 'ms-code--mono',
    lineNumbers && block && 'ms-code--numbered',
    copyable && block && 'ms-code--copyable',
    effectiveGlow && 'ms-code--glow',
    effectiveGlow === 'strong' && 'ms-code--glow-strong',
    className,
  );

  const styleVars: Record<string, string | number> = {};
  if (tabSize != null) styleVars['--ms-code-tab-size'] = tabSize;
  const mergedStyle: CSSProperties = { ...(styleVars as CSSProperties), ...style };

  // —— 块级:<pre><code>(可带复制按钮 / 行号) ——
  if (block) {
    const copyLabel = copied ? t('typography.copied') : t('typography.copy');
    return (
      <pre
        ref={ref as Ref<HTMLPreElement>}
        className={classes}
        style={mergedStyle}
        data-numbered={lineNumbers || undefined}
        {...(rest as ComponentPropsWithoutRef<'pre'>)}
      >
        <code
          ref={contentRef}
          className={cx('ms-code__code', classNames?.code)}
          data-line-numbers={lineNumbers || undefined}
        >
          {children}
        </code>
        {copyable && (
          <button
            type="button"
            className={cx('ms-code__copy', classNames?.copy)}
            data-copied={copied || undefined}
            aria-label={copyLabel}
            title={copyLabel}
            onClick={handleCopy}
          >
            <span className="ms-code__copy-icon" aria-hidden="true">
              {copied ? '✓' : '⧉'}
            </span>
          </button>
        )}
      </pre>
    );
  }

  // —— 行内:asChild 把样式合并到子元素(如包裹链接/高亮片段) ——
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; style?: CSSProperties }>;
    const childRef = (child as { ref?: Ref<unknown> }).ref;
    const merged = mergeAsChildProps(
      { ...rest, className: classes, style: mergedStyle },
      child.props as Record<string, unknown>,
    );
    return cloneElement(child, {
      ...merged,
      ref: composeRefs(ref as Ref<unknown>, childRef),
    } as Record<string, unknown>);
  }

  return (
    <code ref={ref as Ref<HTMLElement>} className={classes} style={mergedStyle} {...rest}>
      {children}
    </code>
  );
});
Code.displayName = 'Code';
