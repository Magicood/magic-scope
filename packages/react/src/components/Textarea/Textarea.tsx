import type { ComponentPropsWithoutRef, KeyboardEvent, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { composeEventHandlers } from '../../utils/compose';
import {
  type AutosizeRange,
  computeAutosizeHeight,
  detectSubmitIntent,
  readBoxMetrics,
  resolveAutosize,
} from './logic';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 关键子部件 className 集合(留口:细到 wrapper / textarea / count / footer)。 */
export interface TextareaClassNames {
  /** 包裹容器(根)。 */
  root?: string | undefined;
  /** 原生 textarea 自身。 */
  textarea?: string | undefined;
  /** 字数计数。 */
  count?: string | undefined;
  /** 底部栏(footer 槽 + count 所在行)。 */
  footer?: string | undefined;
}

export interface TextareaProps
  extends Omit<ComponentPropsWithoutRef<'textarea'>, 'size' | 'className'> {
  /** 尺寸。默认 md。(影响 font-size 与 min-block-size,min-block-size 随密度缩放) */
  size?: TextareaSize;
  /** 校验失败态:染 danger 色并设 aria-invalid。 */
  invalid?: boolean;
  /** 聚焦发光环色调;invalid 时强制 danger。默认 primary。 */
  tone?: TextareaTone;
  /** 显示字数(配合 maxLength 显示 当前/上限;超限染 danger)。 */
  showCount?: boolean;
  /**
   * 随内容自动调整高度。`true` 自由增长;对象可限制 `{ minRows, maxRows }`。
   * 默认 false(保留 resize: vertical 手动拖拽)。
   */
  autosize?: boolean | AutosizeRange;
  /** 底部追加内容(渲染在 count 同一行的起始侧,如帮助文字 / 工具按钮)。 */
  footer?: ReactNode;
  /** 按下裸 Enter(无修饰键、非 IME 组合中)时触发。常用于聊天/评论框发送。 */
  onPressEnter?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  /** 按下 Cmd/Ctrl + Enter 时触发。常用于「多行框里也能快捷提交」。 */
  onSubmitShortcut?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  /** 根容器 className。 */
  className?: string;
  /** 各关键子部件 className(细粒度留口)。 */
  classNames?: TextareaClassNames;
}

/**
 * Textarea —— 多行文本输入框(深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 能力:tone 聚焦发光环(读 --ms-c/--ms-c-glow 槽位,invalid→danger)、showCount 字数(超限染 danger)、
 * autosize 随内容调高(true 自由 / {minRows,maxRows} 限幅)、footer 底部槽、onPressEnter/onSubmitShortcut
 * 提交语义、尺寸随密度缩放。完整 hover/focus/disabled/invalid 状态与过渡,尊重 prefers-reduced-motion。
 *
 * 留口:className+classNames(root/textarea/count/footer)细粒度定制;...rest 透传所有原生属性与事件到 textarea;
 * 内部接管的 onChange/onKeyDown 用 composeEventHandlers 合并(先调用户的、未 preventDefault 再做内部的)。
 * forwardRef 指向原生 textarea。样式见 Textarea.css,需引入 @magic-scope/react/styles.css。
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'md',
      invalid = false,
      tone = 'primary',
      showCount = false,
      autosize = false,
      footer,
      onPressEnter,
      onSubmitShortcut,
      className,
      classNames,
      value,
      defaultValue,
      onChange,
      onKeyDown,
      maxLength,
      disabled,
      readOnly,
      rows,
      style,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as { current: HTMLTextAreaElement | null }).current = node;
      },
      [ref],
    );

    const isControlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue ?? '');
    const current = isControlled ? value : internal;
    const text = current == null ? '' : String(current);

    const range = resolveAutosize(autosize);

    // —— autosize:测量 scrollHeight → 设 block-size。布局阶段同步,避免可见跳动。
    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el || range == null) return;
      const win = el.ownerDocument.defaultView;
      if (!win) return;
      // 先归零再测,拿到真实内容高度
      el.style.height = 'auto';
      const metrics = readBoxMetrics(win.getComputedStyle(el));
      const { height, overflow } = computeAutosizeHeight(el.scrollHeight, metrics, range);
      el.style.height = `${height}px`;
      el.style.overflowY = overflow ? 'auto' : 'hidden';
    }, [range]);

    useLayoutEffect(() => {
      if (range != null) resize();
      // 内容(受控 text / 非受控 internal)变化即重测
    }, [range, resize]);

    // 受控外部 value 变化也要重测
    // biome-ignore lint/correctness/useExhaustiveDependencies: 仅在 text 变化时按需重测高度
    useEffect(() => {
      if (range != null) resize();
    }, [text, range, resize]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInternal(event.target.value);
      if (range != null) resize();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      const intent = detectSubmitIntent(event.nativeEvent);
      if (intent.submitShortcut) onSubmitShortcut?.(event);
      if (intent.pressEnter) onPressEnter?.(event);
    };

    const tn = invalid ? 'danger' : tone;
    const overLimit = maxLength != null && text.length > maxLength;
    const hasFooterRow = showCount || footer != null;

    return (
      <span
        className={[
          'ms-textarea-wrap',
          `ms-tone-${tn}`,
          disabled && 'ms-textarea-wrap--disabled',
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <textarea
          ref={setRef}
          aria-invalid={invalid || undefined}
          className={[
            'ms-textarea',
            `ms-textarea--${size}`,
            invalid && 'ms-textarea--invalid',
            range != null && 'ms-textarea--autosize',
            classNames?.textarea,
          ]
            .filter(Boolean)
            .join(' ')}
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={composeEventHandlers(onChange, handleChange)}
          onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          style={style}
          {...props}
        />
        {hasFooterRow && (
          <span className={['ms-textarea__footer', classNames?.footer].filter(Boolean).join(' ')}>
            <span className="ms-textarea__footer-start">{footer}</span>
            {showCount && (
              <span
                className={[
                  'ms-textarea__count',
                  overLimit && 'ms-textarea__count--over',
                  classNames?.count,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {text.length}
                {maxLength != null ? `/${maxLength}` : ''}
              </span>
            )}
          </span>
        )}
      </span>
    );
  },
);
Textarea.displayName = 'Textarea';
