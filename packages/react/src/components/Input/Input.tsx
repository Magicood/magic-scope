import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { useMessages } from '../../i18n';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface InputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size' | 'prefix'> {
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: InputSize;
  /** 校验失败态:染 danger 发光环并设 aria-invalid。 */
  invalid?: boolean;
  /** 聚焦发光环色调;invalid 时强制 danger。默认 primary。 */
  tone?: InputTone;
  /** 框内前置内容(图标 / 文字)。 */
  prefix?: ReactNode;
  /** 框内后置内容。 */
  suffix?: ReactNode;
  /** 框外起始拼接段(连续控件)。 */
  addonBefore?: ReactNode;
  /** 框外末尾拼接段。 */
  addonAfter?: ReactNode;
  /** 有值时显示清除按钮。 */
  clearable?: boolean;
  /** 点击清除回调。 */
  onClear?: () => void;
  /** 显示字数(配合 maxLength 显示 当前/上限)。 */
  showCount?: boolean;
  /** 外层容器 className(组件根)。 */
  className?: string;
  /** 原生 input 自身 className。 */
  inputClassName?: string;
}

const setNativeValue = (el: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
};

/**
 * Input —— 文本输入框(深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 框内 prefix/suffix、框外 addonBefore/addonAfter 拼接、clearable 清除、type=password 明文切换、
 * showCount 字数;tone 聚焦发光环(invalid→danger);尺寸随密度缩放。完整 hover/focus/disabled/invalid 状态。
 * 样式见 Input.css,需引入 @magic-scope/react/styles.css。
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      invalid = false,
      tone = 'primary',
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      clearable = false,
      onClear,
      showCount = false,
      className,
      inputClassName,
      type,
      value,
      defaultValue,
      onChange,
      disabled,
      readOnly,
      maxLength,
      ...props
    },
    ref,
  ) => {
    const t = useMessages();
    const innerRef = useRef<HTMLInputElement | null>(null);
    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
      },
      [ref],
    );

    const isControlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue ?? '');
    const current = isControlled ? value : internal;
    const text = current == null ? '' : String(current);
    const hasValue = text.length > 0;

    const [revealed, setRevealed] = useState(false);
    const isPassword = type === 'password';
    const effectiveType = isPassword ? (revealed ? 'text' : 'password') : type;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternal(event.target.value);
      onChange?.(event);
    };
    const clear = () => {
      const el = innerRef.current;
      if (el) {
        setNativeValue(el, '');
        el.focus();
      }
      if (!isControlled) setInternal('');
      onClear?.();
    };

    const showClear = clearable && hasValue && !disabled && !readOnly;
    const tn = invalid ? 'danger' : tone;

    const field = (
      <span
        className={[
          'ms-input',
          `ms-input--${size}`,
          `ms-tone-${tn}`,
          invalid && 'ms-input--invalid',
          disabled && 'ms-input--disabled',
          !addonBefore && !addonAfter && className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {prefix != null && <span className="ms-input__prefix">{prefix}</span>}
        <input
          ref={setRef}
          type={effectiveType}
          aria-invalid={invalid || undefined}
          className={['ms-input__field', inputClassName].filter(Boolean).join(' ')}
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          {...props}
        />
        {showCount && (
          <span className="ms-input__count">
            {text.length}
            {maxLength != null ? `/${maxLength}` : ''}
          </span>
        )}
        {showClear && (
          <button
            type="button"
            className="ms-input__action"
            aria-label={t('input.clear')}
            onClick={clear}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
        {isPassword && (
          <button
            type="button"
            className="ms-input__action"
            aria-label={t(revealed ? 'input.password.hide' : 'input.password.show')}
            onClick={() => setRevealed((v) => !v)}
          >
            <span aria-hidden="true">{revealed ? '🙈' : '👁'}</span>
          </button>
        )}
        {suffix != null && <span className="ms-input__suffix">{suffix}</span>}
      </span>
    );

    // 无 addon:直接返回带框的 affix;有 addon:包一层拼接组
    if (addonBefore == null && addonAfter == null) return field;
    return (
      <span
        className={['ms-input-group', disabled && 'ms-input-group--disabled', className]
          .filter(Boolean)
          .join(' ')}
      >
        {addonBefore != null && <span className="ms-input__addon">{addonBefore}</span>}
        {field}
        {addonAfter != null && <span className="ms-input__addon">{addonAfter}</span>}
      </span>
    );
  },
);
Input.displayName = 'Input';
