import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react';
import { forwardRef, useCallback, useState } from 'react';
import { composeEventHandlers } from '../../utils/compose';

export type ToggleVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type ToggleTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type ToggleSize = 'sm' | 'md' | 'lg';
export type ToggleShape = 'default' | 'pill' | 'square';

export interface ToggleProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'value' | 'aria-pressed'> {
  /**
   * 受控按下态。传入即受控(配合 onPressedChange);不传走非受控(defaultPressed)。
   */
  pressed?: boolean | undefined;
  /** 初始按下态(非受控)。默认 false。 */
  defaultPressed?: boolean | undefined;
  /**
   * 视觉变体(复用 Button 风格):实底 / 柔色 / 描边 / 幽灵。
   * 未按下态走「静默」基底,按下态才点亮该变体的 tone 配色。默认 ghost。
   */
  variant?: ToggleVariant | undefined;
  /** 语义色调,经全库 tone resolver 派生按下态配色与发光。默认 primary。 */
  tone?: ToggleTone | undefined;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: ToggleSize | undefined;
  /** 形状:默认圆角 / 胶囊 / 直角。默认 default。 */
  shape?: ToggleShape | undefined;
  /** 仅图标(正方形紧凑);务必配 aria-label,否则读屏失名。 */
  iconOnly?: boolean | undefined;
  /** 按下态额外发光高亮(读 tone 槽位 --ms-c-glow)。默认 true。 */
  glow?: boolean | undefined;
  /** 按钮内容(图标 / 文字,如加粗的 B 按钮)。 */
  children?: ReactNode | undefined;
  /**
   * 按下态变化(受控/非受控双通道核心回调)。
   * @param pressed 切换后的按下态:true=按下,false=未按下。
   */
  onPressedChange?: ((pressed: boolean) => void) | undefined;
}

/**
 * Toggle —— 双态切换按钮(Radix 风的单个 pressed 切换按钮)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 与同库相邻组件的边界:区别于 Switch(开 / 关语义的开关)与 Segmented(一组里多选其一),
 * Toggle 是「一个按钮、按下 / 未按下两态」,语义经 aria-pressed 表达(role=button 而非 checkbox / radio),
 * 典型用法是工具栏里的加粗 B / 斜体 I / 静音等可保持「激活」的图标按钮。
 *
 * 深度:
 * - 受控(pressed + onPressedChange)/ 非受控(defaultPressed)双模式;点击切换、Enter/Space 由原生 button 接管。
 * - 复用 Button 的视觉语言:variant(solid/soft/outline/ghost)× tone(7 槽位)× size × shape;
 *   未按下走「静默」基底(读 fg-muted),按下态才点亮 tone 实底 / 柔底 / 描边并叠发光高亮。
 * - 留口:根 extends button 透传 ...rest(原生事件 / data-* / aria-*),onClick 经 composeEventHandlers 不丢用户处理器。
 *
 * 可达性 / 动效:
 * - 原生 <button type="button"> + aria-pressed=pressed;键盘 Enter/Space 由浏览器原生触发 click 即切换;
 * - disabled 态(不可点、不可聚焦、降透明、撤发光);iconOnly 务必配 aria-label。
 * - active 缩放 / 发光过渡随 prefers-reduced-motion 与 [data-ms-motion=off] 降级。
 * - 内容边界:文字单行省略,绝不撑破按钮 / 容器。
 * 样式见同目录 Toggle.css,需引入 @magic-scope/react/styles.css。
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      pressed: controlledPressed,
      defaultPressed = false,
      variant = 'ghost',
      tone = 'primary',
      size = 'md',
      shape = 'default',
      iconOnly = false,
      glow = true,
      disabled,
      className,
      children,
      onPressedChange,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const isControlled = controlledPressed !== undefined;
    const [uncontrolled, setUncontrolled] = useState<boolean>(defaultPressed);
    const pressed = isControlled ? controlledPressed : uncontrolled;

    const toggle = useCallback(() => {
      const next = !pressed;
      if (!isControlled) {
        setUncontrolled(next);
      }
      onPressedChange?.(next);
    }, [pressed, isControlled, onPressedChange]);

    // 用户 onClick 先行,未 preventDefault 才走内部切换(Radix 范式,不丢用户处理器)。
    const handleClick = composeEventHandlers(
      onClick as ((event: MouseEvent<HTMLButtonElement>) => void) | undefined,
      () => toggle(),
    );

    const classes = [
      'ms-toggle',
      `ms-toggle--${variant}`,
      `ms-toggle--${size}`,
      `ms-tone-${tone}`,
      shape !== 'default' && `ms-toggle--${shape}`,
      iconOnly && 'ms-toggle--icon-only',
      glow && 'ms-toggle--glow',
      pressed && 'ms-toggle--pressed',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type="button"
        // 双态切换语义:aria-pressed 表达按下 / 未按下(区别于普通 button)。
        aria-pressed={pressed}
        // 按下态另给 data 钩子,便于消费方按当前态做样式 / 测试断言。
        data-state={pressed ? 'on' : 'off'}
        disabled={disabled}
        className={classes}
        onClick={handleClick}
        {...rest}
      >
        <span className="ms-toggle__content">
          {children != null && <span className="ms-toggle__label">{children}</span>}
        </span>
      </button>
    );
  },
);
Toggle.displayName = 'Toggle';
