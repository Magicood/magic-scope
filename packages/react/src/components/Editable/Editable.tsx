import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
  Ref,
} from 'react';
import { forwardRef, useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers, composeRefs } from '../../utils/compose';
import {
  commitValue,
  resolveKeyIntent,
  resolvePreviewText,
  shouldEnterEditFromPreview,
} from './logic';

export type EditableSize = 'sm' | 'md' | 'lg';
export type EditableTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/** 渲染展示态 / 编辑态留口收到的上下文。 */
export interface EditablePreviewRenderProps {
  /** 当前提交值(规整后字符串)。 */
  value: string;
  /** 展示态要显示的文本(空值时已替换为 placeholder)。 */
  text: string;
  /** 当前值是否为空(用于占位样式)。 */
  isEmpty: boolean;
  /** 进入编辑态(等价于点击展示态)。 */
  edit: () => void;
  /**
   * 焦点回收挂载点 —— 把它接到自定义展示态里「可聚焦」的元素上(如 ref={ref})。
   * 退出编辑(提交 / 取消 / Esc)后组件会调用 `.focus()` 把焦点收回此元素;
   * 不接则焦点回收静默失效,键盘用户退出编辑后会丢焦点到 <body>。
   */
  ref: Ref<HTMLElement>;
  /** 当前是否处于校验失败态(自定义展示态可据此打 aria-invalid)。 */
  invalid: boolean;
}

/** 渲染编辑态留口收到的上下文。 */
export interface EditableEditRenderProps {
  /** 编辑中的草稿值。 */
  value: string;
  /** 写草稿值。 */
  setValue: (next: string) => void;
  /** 提交(等价于 Enter / 失焦提交)。 */
  submit: () => void;
  /** 取消并还原。 */
  cancel: () => void;
}

/** 子部件类名插槽:细粒度定制内部元素。 */
export interface EditableClassNames {
  /** 展示态触发元素。 */
  preview?: string;
  /** 编辑态 input / textarea。 */
  input?: string;
}

export interface EditableProps
  extends Omit<
    ComponentPropsWithoutRef<'div'>,
    'onChange' | 'defaultValue' | 'children' | 'onSubmit'
  > {
  /** 受控值(传入即受控,配合 onChange)。 */
  value?: string | undefined;
  /** 初始值(非受控)。默认空串。 */
  defaultValue?: string | undefined;
  /** 占位文本(值为空时展示态显示)。默认取 i18n select.placeholder。 */
  placeholder?: string | undefined;
  /** 尺寸(随密度 data-ms-density 缩放)。默认 md。 */
  size?: EditableSize | undefined;
  /** 语义色调(编辑态聚焦发光环)。默认 primary。 */
  tone?: EditableTone | undefined;
  /** 禁用:不可进入编辑态,染禁用态。 */
  disabled?: boolean | undefined;
  /** 校验失败态(供 Form):染 danger 环并设 aria-invalid。 */
  invalid?: boolean | undefined;
  /** 编辑态用 textarea(多行)。诚实备注:multiline 渲染 textarea,裸 Enter 默认换行。 */
  multiline?: boolean | undefined;
  /** 字数上限(透传输入元素 + 提交时截断)。 */
  maxLength?: number | undefined;
  /** 初次渲染即进入编辑态。默认 false。 */
  startWithEditView?: boolean | undefined;
  /** 进入编辑态时全选文本,便于整体替换。默认 false。 */
  selectAllOnFocus?: boolean | undefined;
  /** 失焦即提交。默认 true。 */
  submitOnBlur?: boolean | undefined;
  /** Enter 提交。单行默认 true;多行默认 false(裸 Enter 换行)。 */
  submitOnEnter?: boolean | undefined;
  /** 受控编辑态(传入即受控,配合 onEditingChange)。 */
  editing?: boolean | undefined;
  /** 编辑态默认值(非受控初值)。默认 startWithEditView。 */
  defaultEditing?: boolean | undefined;
  /** 子部件类名插槽。 */
  classNames?: EditableClassNames | undefined;
  /** 展示态 input 的可访问名(aria-label)。默认取 i18n select.placeholder。 */
  inputAriaLabel?: string | undefined;
  /** 自定义展示态渲染(替换默认展示态)。 */
  renderPreview?: ((props: EditablePreviewRenderProps) => ReactNode) | undefined;
  /** 自定义编辑态渲染(替换默认 input / textarea)。 */
  renderEdit?: ((props: EditableEditRenderProps) => ReactNode) | undefined;
  /**
   * 提交时触发(值变化才回调)。
   * @param value 提交后的最终值(经 maxLength 截断)。
   */
  onChange?: ((value: string) => void) | undefined;
  /**
   * 取消(Esc / 失焦不提交)时触发,值已还原。
   * @param value 还原后的值(即进入编辑前的初始值)。
   */
  onCancel?: ((value: string) => void) | undefined;
  /**
   * 编辑态变化(进入/退出编辑,受控/非受控双通道核心回调)。
   * @param editing 变化后是否处于编辑态。
   */
  onEditingChange?: ((editing: boolean) => void) | undefined;
}

/**
 * Editable —— 行内编辑(深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 深度:
 * - 展示态(role=button,Enter/Space 进编辑)↔ 编辑态(input / multiline 时 textarea)双态切换;
 *   Enter / 失焦提交、Esc 取消还原;提交值变化才回调 onChange。
 * - 值双通道:受控 value + onChange / 非受控 defaultValue;编辑态双通道:受控 editing + onEditingChange / 非受控。
 * - tone 聚焦发光环(invalid→danger)、尺寸随密度缩放;startWithEditView / selectAllOnFocus / submitOnBlur / submitOnEnter 行为开关。
 * - 留口:renderPreview / renderEdit 完全替换两态渲染;classNames 细粒度插槽;...rest 透传根 div 原生属性。
 * - 可抽取纯逻辑在 logic.ts(键盘意图 / 提交截断 / 占位回退,零 React)。
 *
 * 可达性 / 焦点:
 * - 展示态 role=button + tabIndex(禁用除外),Enter/Space 进编辑;展示态与编辑态在 invalid 时
 *   都带 aria-invalid,校验失败态对辅助技术连续可感知(不止编辑态)。
 * - 焦点切换:进编辑聚焦并(可选)全选 input;提交 / 取消把焦点收回展示态。
 * - 进入编辑态的 seed(快照 editStartValue + 草稿 draft)由 editing 的 false→true 上升沿统一驱动,
 *   受控编辑(父级直接翻 editing)与非受控(点击/键盘进编辑)两条路径共用,保证受控通道下
 *   值未改不误触发 onChange、进入编辑展示最新 currentValue。
 * - 透明备注:renderPreview 自定义展示态时,焦点回收依赖你把 render props 的 `ref` 接到一个可聚焦
 *   元素上;不接则退出编辑后焦点会丢到 <body>。invalid 语义同样需你自行用 render props 的 `invalid`
 *   打 aria-invalid(默认展示态已内建)。
 * - 尊重 prefers-reduced-motion 与 [data-ms-motion=off]。样式见 Editable.css,需引入 @magic-scope/react/styles.css。
 */
export const Editable = forwardRef<HTMLDivElement, EditableProps>(
  (
    {
      value: controlledValue,
      defaultValue = '',
      placeholder,
      size = 'md',
      tone = 'primary',
      disabled = false,
      invalid = false,
      multiline = false,
      maxLength,
      startWithEditView = false,
      selectAllOnFocus = false,
      submitOnBlur = true,
      submitOnEnter,
      editing: controlledEditing,
      defaultEditing,
      classNames,
      inputAriaLabel,
      renderPreview,
      renderEdit,
      onChange,
      onCancel,
      onEditingChange,
      className,
      onKeyDown: userOnKeyDown,
      onBlur: userOnBlur,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const reactId = useId();
    const baseId = `ms-editable-${reactId.replace(/:/g, '-')}`;

    // 展示态焦点回收目标:默认 <button>,renderPreview 时由用户接到自定义可聚焦元素。
    const previewRef = useRef<HTMLElement | null>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
    // 进入编辑前的值快照(取消时还原 / 提交时比较是否变化)。
    const editStartValue = useRef<string>('');
    // 上一帧的编辑态,用于在 useLayoutEffect 里识别 editing 的 false→true 上升沿。
    const prevEditing = useRef<boolean>(false);

    // 值双通道
    const valueControlled = controlledValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue);
    const value = valueControlled ? controlledValue : uncontrolledValue;
    const currentValue = value ?? '';

    // 编辑态双通道
    const editingControlled = controlledEditing !== undefined;
    const [uncontrolledEditing, setUncontrolledEditing] = useState<boolean>(
      defaultEditing ?? startWithEditView,
    );
    const editing = editingControlled ? controlledEditing : uncontrolledEditing;

    // 草稿值(编辑态独立缓冲,提交才回写 value)
    const [draft, setDraft] = useState<string>(currentValue);

    // 进入编辑态的统一 seed:无论受控 editing 翻 true 还是非受控 enterEdit,
    // 只要 editing 出现 false→true 上升沿,就用最新 currentValue 重新填充快照与草稿。
    // 修复:受控编辑通道下父级直接翻 editing=true 时 enterEdit 永不调用,导致
    //   (1) editStartValue 停留在初值 ''、原样提交被误判 changed 而虚假触发 onChange;
    //   (2) draft 不刷新、input 显示过期草稿值。
    // 用 useLayoutEffect 在提交前同步完成 seed,避免编辑态首帧渲染出陈旧 draft。
    useLayoutEffect(() => {
      if (editing && !prevEditing.current) {
        editStartValue.current = currentValue;
        setDraft(currentValue);
      }
      prevEditing.current = editing;
    }, [editing, currentValue]);

    const resolvedPlaceholder = placeholder ?? t('select.placeholder');
    const resolvedAriaLabel = inputAriaLabel ?? resolvedPlaceholder;
    const effectiveSubmitOnEnter = submitOnEnter ?? !multiline;

    const setEditing = useCallback(
      (next: boolean) => {
        if (!editingControlled) {
          setUncontrolledEditing(next);
        }
        onEditingChange?.(next);
      },
      [editingControlled, onEditingChange],
    );

    const enterEdit = useCallback(() => {
      if (disabled || editing) {
        return;
      }
      // seed(editStartValue / draft)统一交给 editing 上升沿的 useLayoutEffect,
      // 使受控(父级翻 editing)与非受控(此处)两条进入路径共用同一套填充逻辑。
      setEditing(true);
    }, [disabled, editing, setEditing]);

    const focusPreview = useCallback(() => {
      // 退出编辑后把焦点收回展示态(下一帧 DOM 已切回 preview)。
      requestAnimationFrame(() => previewRef.current?.focus());
    }, []);

    const submit = useCallback(() => {
      if (!editing) {
        return;
      }
      const result = commitValue(draft, editStartValue.current, maxLength);
      if (!valueControlled) {
        setUncontrolledValue(result.value);
      }
      if (result.changed) {
        onChange?.(result.value);
      }
      setEditing(false);
      focusPreview();
    }, [editing, draft, maxLength, valueControlled, onChange, setEditing, focusPreview]);

    const cancel = useCallback(() => {
      if (!editing) {
        return;
      }
      const restored = editStartValue.current;
      setDraft(restored);
      setEditing(false);
      onCancel?.(restored);
      focusPreview();
    }, [editing, setEditing, onCancel, focusPreview]);

    // 编辑态键盘:Enter 提交 / Esc 取消(多行 Shift+Enter 换行交还默认)。
    const handleInputKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const intent = resolveKeyIntent({
          key: event.key,
          shiftKey: event.shiftKey,
          multiline,
          submitOnEnter: effectiveSubmitOnEnter,
        });
        if (intent === 'submit') {
          event.preventDefault();
          submit();
        } else if (intent === 'cancel') {
          event.preventDefault();
          cancel();
        }
      },
      [multiline, effectiveSubmitOnEnter, submit, cancel],
    );

    const handleInputBlur = useCallback(() => {
      if (!editing) {
        return;
      }
      if (submitOnBlur) {
        submit();
      } else {
        cancel();
      }
    }, [editing, submitOnBlur, submit, cancel]);

    const handleInputChange = useCallback(
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDraft(event.target.value);
      },
      [],
    );

    // 进入编辑态后聚焦 input,并按需全选。
    const setInputRef = useCallback(
      (node: HTMLInputElement | HTMLTextAreaElement | null) => {
        inputRef.current = node;
        if (node) {
          node.focus();
          if (selectAllOnFocus) {
            node.select();
          } else {
            // 不全选时把光标置于文末,便于续写。
            const end = node.value.length;
            try {
              node.setSelectionRange(end, end);
            } catch {
              // number/email 等不支持 setSelectionRange,忽略。
            }
          }
        }
      },
      [selectAllOnFocus],
    );

    // 展示态键盘:Enter / Space 进编辑(用户处理器先行,可 preventDefault 阻断)。
    const handlePreviewKeyDown = composeEventHandlers(
      userOnKeyDown as ((e: KeyboardEvent<HTMLButtonElement>) => void) | undefined,
      (event: KeyboardEvent<HTMLButtonElement>) => {
        if (shouldEnterEditFromPreview(event.key)) {
          event.preventDefault();
          enterEdit();
        }
      },
    );

    const { text, isEmpty } = resolvePreviewText(currentValue, resolvedPlaceholder);

    const rootClassName = [
      'ms-editable',
      `ms-editable--${size}`,
      `ms-tone-${invalid ? 'danger' : tone}`,
      editing && 'ms-editable--editing',
      disabled && 'ms-editable--disabled',
      invalid && 'ms-editable--invalid',
      isEmpty && !editing && 'ms-editable--empty',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const previewClassName = ['ms-editable__preview', classNames?.preview]
      .filter(Boolean)
      .join(' ');
    const inputClassName = ['ms-editable__input', classNames?.input].filter(Boolean).join(' ');

    return (
      <div ref={composeRefs(ref)} className={rootClassName} data-editing={editing} {...rest}>
        {editing ? (
          renderEdit ? (
            renderEdit({ value: draft, setValue: setDraft, submit, cancel })
          ) : multiline ? (
            <textarea
              ref={setInputRef as (node: HTMLTextAreaElement | null) => void}
              id={`${baseId}-input`}
              className={inputClassName}
              aria-label={resolvedAriaLabel}
              aria-invalid={invalid || undefined}
              value={draft}
              placeholder={resolvedPlaceholder}
              disabled={disabled}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={composeEventHandlers(
                userOnBlur as ((e: FocusEvent<HTMLTextAreaElement>) => void) | undefined,
                handleInputBlur,
              )}
              {...(maxLength != null ? { maxLength } : {})}
            />
          ) : (
            <input
              ref={setInputRef as (node: HTMLInputElement | null) => void}
              id={`${baseId}-input`}
              type="text"
              className={inputClassName}
              aria-label={resolvedAriaLabel}
              aria-invalid={invalid || undefined}
              value={draft}
              placeholder={resolvedPlaceholder}
              disabled={disabled}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={composeEventHandlers(
                userOnBlur as ((e: FocusEvent<HTMLInputElement>) => void) | undefined,
                handleInputBlur,
              )}
              {...(maxLength != null ? { maxLength } : {})}
            />
          )
        ) : renderPreview ? (
          renderPreview({
            value: currentValue,
            text,
            isEmpty,
            edit: enterEdit,
            ref: previewRef,
            invalid,
          })
        ) : (
          <button
            ref={previewRef as Ref<HTMLButtonElement>}
            type="button"
            id={`${baseId}-preview`}
            className={previewClassName}
            disabled={disabled}
            data-empty={isEmpty || undefined}
            aria-invalid={invalid || undefined}
            onClick={enterEdit}
            onKeyDown={handlePreviewKeyDown}
          >
            {text}
          </button>
        )}
      </div>
    );
  },
);
Editable.displayName = 'Editable';
