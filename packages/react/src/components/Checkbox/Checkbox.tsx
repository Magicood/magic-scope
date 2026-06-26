import type { ChangeEvent, ComponentPropsWithoutRef, ReactNode } from 'react';
import { createContext, forwardRef, useCallback, useContext, useId, useState } from 'react';
import { composeEventHandlers } from '../../utils/compose';

export type CheckboxTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type CheckboxSize = 'sm' | 'md' | 'lg';

interface CheckboxGroupContextValue {
  name: string | undefined;
  value: string[];
  toggle: (value: string, checked: boolean) => void;
  disabled: boolean | undefined;
  size: CheckboxSize;
  tone: CheckboxTone;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export interface CheckboxGroupProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /** 受控选中值集合(包含其 value 的组内 Checkbox 即选中)。 */
  value?: string[] | undefined;
  /** 非受控初始选中值集合。 */
  defaultValue?: string[] | undefined;
  /**
   * 选中集合变化回调。
   * @param value 新的选中 value 数组(组内被勾选的各 Checkbox 的 value 集合)。
   */
  onChange?: ((value: string[]) => void) | undefined;
  /** 同组 checkbox 的 name(可选);省略不影响表单提交,仅作分组标识。 */
  name?: string | undefined;
  /** 整组禁用,下发给组内 Checkbox。 */
  disabled?: boolean | undefined;
  /** 排布方向(布局)。默认 vertical。 */
  orientation?: 'horizontal' | 'vertical' | undefined;
  /** 尺寸,透传给组内 Checkbox。默认 md。 */
  size?: CheckboxSize | undefined;
  /** 色调,透传给组内 Checkbox。默认 primary。 */
  tone?: CheckboxTone | undefined;
}

/**
 * CheckboxGroup —— 多选组容器。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 渲染 role="group",用 context 把 name / 选中集合(string[]) / 尺寸 / 色调 / 禁用下发给组内 Checkbox;
 * 支持受控(value)与非受控(defaultValue)。组内 Checkbox 自带 value 时自动 checked={value.includes(ownValue)},
 * 切换走组级 onChange(返回新数组),与单个 Checkbox 的 onChange/onCheckedChange 并存。
 * 样式见同目录 Checkbox.css,需引入 @magic-scope/react/styles.css。
 */
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onChange,
      name,
      disabled,
      orientation = 'vertical',
      size = 'md',
      tone = 'primary',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
    const value = controlledValue !== undefined ? controlledValue : internal;

    const toggle = useCallback(
      (own: string, checked: boolean) => {
        const next = checked
          ? value.includes(own)
            ? value
            : [...value, own]
          : value.filter((v) => v !== own);
        if (controlledValue === undefined) {
          setInternal(next);
        }
        onChange?.(next);
      },
      [value, controlledValue, onChange],
    );

    return (
      // biome-ignore lint/a11y/useSemanticElements: 复选组是控件分组(非表单 fieldset),role="group" 是正确的 ARIA
      <div
        ref={ref}
        role="group"
        className={[
          'ms-checkbox-group',
          `ms-checkbox-group--${orientation}`,
          `ms-tone-${tone}`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <CheckboxGroupContext.Provider value={{ name, value, toggle, disabled, size, tone }}>
          {children}
        </CheckboxGroupContext.Provider>
      </div>
    );
  },
);
CheckboxGroup.displayName = 'CheckboxGroup';

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<'label'>, 'onChange'> {
  /** 复选框右侧的文字标签内容。 */
  children?: ReactNode;
  /** 标签下方的次级说明(fg-muted),用于补充语境。 */
  description?: ReactNode;
  /** 半选(部分选中)态:仅视觉,不改变 checked 取值。常用于「全选」框。 */
  indeterminate?: boolean | undefined;
  /** 语义色调,经全库 tone resolver 派生配色;默认继承所在 CheckboxGroup,缺省 primary。 */
  tone?: CheckboxTone | undefined;
  /** 尺寸;默认继承所在 CheckboxGroup,缺省 md。 */
  size?: CheckboxSize | undefined;
  /** 该项的值;置于 CheckboxGroup 内时用于自动判定 checked 与回传选中集合。 */
  value?: string | undefined;
  /** 受控选中态(独立使用时)。 */
  checked?: boolean | undefined;
  /** 非受控初始选中态(独立使用时)。 */
  defaultChecked?: boolean | undefined;
  /** 禁用;默认继承所在 CheckboxGroup。 */
  disabled?: boolean | undefined;
  /**
   * 原生 change 回调,透传到内部 input(与组级 onChange 并存)。
   * @param event 内部 input 的原生 change 事件。
   */
  onChange?: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  /**
   * 只关心布尔的语义回调:勾选/取消勾选时触发。
   * @param checked 切换后的选中态。
   */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /** 仅作用于根 label 的额外类名(与 className 叠加,className 也在根)。 */
  labelClassName?: string | undefined;
  /** 透传给内部 input 的属性(如 name/required/form/aria-*),与组件内部的 input 行为合并。 */
  inputProps?: ComponentPropsWithoutRef<'input'> | undefined;
}

/**
 * Checkbox —— 复选框(深度组件),基于原生 input[type=checkbox]。自研、零依赖,消费 @magic-scope/tokens 的 --ms- 变量。
 * 结构:label 包视觉隐藏的原生 input + 视觉方块(checked 染 tone 色画对勾、indeterminate 画横杠)+ 文字标签 + 可选次级说明。
 * 接全库统一 tone resolver(7 色调只读 6 槽位,不写死配色);尺寸 sm/md/lg 随密度 data-ms-density 缩放;
 * 配套 CheckboxGroup(受控/非受控多选,自动判定 checked)。完整覆盖 hover / focus-visible(发光环) / checked /
 * indeterminate / disabled 状态与过渡;尊重 prefers-reduced-motion。
 * 留口:...rest 透传到根 label(原生事件、data- 与 aria- 属性全可挂)、inputProps 透传到 input、
 * onCheckedChange 语义回调、onChange compose(先用户后内部,不覆盖)。样式见同目录 Checkbox.css,
 * 需引入 @magic-scope/react 的 styles.css。
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      children,
      description,
      className,
      labelClassName,
      indeterminate = false,
      tone,
      size,
      value,
      checked,
      defaultChecked,
      disabled,
      onChange,
      onCheckedChange,
      inputProps,
      ...rest
    },
    ref,
  ) => {
    const group = useContext(CheckboxGroupContext);
    const reactId = useId();
    const labelId = `${reactId}-label`;
    const descId = `${reactId}-desc`;

    const resolvedTone = tone ?? group?.tone ?? 'primary';
    const resolvedSize = size ?? group?.size ?? 'md';
    const resolvedDisabled = disabled ?? group?.disabled;
    // 组内:checked 由组选中集合判定(优先于显式 checked,保证组级受控一致)
    const inGroup = group != null && value !== undefined;
    const resolvedChecked = inGroup ? group.value.includes(value) : checked;

    // indeterminate 只能经 DOM 属性设置(无对应 HTML 属性),用合并 ref 落到 input 上
    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        if (node) node.indeterminate = indeterminate;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
      },
      [ref, indeterminate],
    );

    // 内部 change:先把布尔/组级语义算好,再 compose 用户 onChange(用户可 preventDefault 拦内部)
    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const nextChecked = event.target.checked;
        if (inGroup && value !== undefined) {
          group.toggle(value, nextChecked);
        }
        onCheckedChange?.(nextChecked);
      },
      [inGroup, group, value, onCheckedChange],
    );

    const classes = [
      'ms-checkbox',
      `ms-checkbox--${resolvedSize}`,
      `ms-tone-${resolvedTone}`,
      className,
      labelClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const ip = inputProps ?? {};
    // 向后兼容:input 在 label 内,挂在根 label 上的 aria-label / aria-labelledby 不会成为 input 的可访问名。
    // 把命名类 aria 从 rest 取出转发给 input,并从摊给 label 的 rest 中**剔除**——否则可访问名会同时
    // 落在 label 与 input 上(getByRole(name) 命中两个,破坏 <Checkbox aria-label="…" /> 用法)。
    const {
      'aria-label': restAriaLabel,
      'aria-labelledby': restAriaLabelledBy,
      ...restForLabel
    } = rest;
    const ariaLabel = ip['aria-label'] ?? restAriaLabel;

    const describedBy =
      [description != null ? descId : null, ip['aria-describedby']].filter(Boolean).join(' ') ||
      undefined;
    // 有 description 时,input 在 label 内,隐式 name 会把 description 文本也拼进去。
    // 用显式 aria-labelledby 指向 label span,把可访问名收窄到标签文本,description 只作 describedby。
    const labelledBy =
      description != null && children != null
        ? (ip['aria-labelledby'] ?? restAriaLabelledBy ?? labelId)
        : (ip['aria-labelledby'] ?? restAriaLabelledBy);

    return (
      <label className={classes} {...restForLabel}>
        <input
          {...ip}
          ref={setRef}
          type="checkbox"
          className={['ms-checkbox__input', ip.className].filter(Boolean).join(' ')}
          name={ip.name ?? group?.name}
          value={value ?? ip.value}
          checked={resolvedChecked}
          defaultChecked={resolvedChecked === undefined ? defaultChecked : undefined}
          disabled={resolvedDisabled}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-labelledby={labelledBy}
          onChange={composeEventHandlers(onChange ?? ip.onChange, handleChange)}
        />
        <span className="ms-checkbox__box" aria-hidden="true" />
        {(children != null || description != null) && (
          <span className="ms-checkbox__content">
            {children != null && (
              <span className="ms-checkbox__label" id={labelId}>
                {children}
              </span>
            )}
            {description != null && (
              <span className="ms-checkbox__description" id={descId}>
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
