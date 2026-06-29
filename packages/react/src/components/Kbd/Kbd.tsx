import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { cloneElement, forwardRef, isValidElement, useMemo } from 'react';
import { ariaLabelForTokens, type KbdPlatform, parseKbd, resolvePlatform } from './logic';

export type KbdSize = 'sm' | 'md' | 'lg';
export type KbdTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface KbdProps extends ComponentPropsWithoutRef<'kbd'> {
  /**
   * 快捷键。传 'cmd+shift+k' 或 ['cmd','k'] 时,会拆成多个键帽并按平台符号化渲染。
   * 不传则把 children 当单个键帽内容(向后兼容旧用法)。
   */
  keys?: string | readonly string[];
  /** 目标平台:auto 经 navigator 探测 / mac 强制 macOS 符号 / win 强制 Windows 文本。默认 auto。 */
  platform?: KbdPlatform;
  /** 多键帽之间的分隔符,可传任意 ReactNode(默认无字符,纯间距;常见传 '+' 或 ' ')。 */
  separator?: ReactNode;
  /** 尺寸:sm 紧凑 / md 默认 / lg 放大(随 data-ms-density 缩放)。默认 md。 */
  size?: KbdSize;
  /** 语义色调,经全库 tone resolver 派生配色与发光。默认 neutral。 */
  tone?: KbdTone;
  /** 渲染为子元素并保留键帽样式(Radix Slot 风格;由子元素自带内容)。 */
  asChild?: boolean;
  /** 关键子部件 className(键帽 / 分隔符)。 */
  classNames?: {
    /** 单个键帽 .ms-kbd__key */
    key?: string;
    /** 分隔符 .ms-kbd__sep */
    separator?: string;
  };
}

/**
 * Kbd —— 键盘按键样式(深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * surface-raised 底 + 1px 描边 + 加粗底边模拟键帽立体感;idle/hover 的微光接 --ms-fx-glow,
 * active 下压触感接 --ms-motion-scale,均尊重 prefers-reduced-motion / data-ms-motion。
 *
 * 旗舰深度:
 * - keys('cmd+shift+k' 或数组)经纯逻辑解析器拆成多键帽,平台符号化(cmd→⌘ ctrl→⌃ alt→⌥ shift→⇧ …),
 *   platform=auto 探测 navigator;separator 可传任意 ReactNode。
 * - 接全库 tone resolver(7 色调只读 6 槽位,不写死配色),危险/确认键位可着语义色 + tone 发光。
 * - size sm/md/lg 随密度缩放;asChild 多态;classNames 定制子部件;...rest 透传到根。
 *
 * 解析逻辑在同目录 logic.ts(纯函数、零 React 依赖,可平移 core)。
 * 样式见同目录 Kbd.css,需引入 @magic-scope/react/styles.css。
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(
  (
    {
      keys,
      platform = 'auto',
      separator,
      size = 'md',
      tone = 'neutral',
      asChild = false,
      classNames,
      className,
      children,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    // 平台解析 + 解析键序列。platform 变动才重算(auto 时探测一次)。
    const tokens = useMemo(
      () => (keys == null ? null : parseKbd(keys, resolvePlatform(platform))),
      [keys, platform],
    );

    const classes = [
      'ms-kbd',
      `ms-kbd--${size}`,
      `ms-tone-${tone}`,
      tokens != null && 'ms-kbd--combo',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // 多键帽模式:用解析出的可读串兜底 aria-label(读屏念全词,不念无意义符号)
    const resolvedAriaLabel =
      ariaLabel ?? (tokens != null ? ariaLabelForTokens(tokens) : undefined);

    // 渲染内容:有 keys 时拆多键帽,否则原样渲染 children(向后兼容)
    const content =
      tokens != null
        ? tokens.map((tk, i) => (
            <span
              // 键序列稳定,索引作 key 安全
              // biome-ignore lint/suspicious/noArrayIndexKey: 静态键序列,无重排
              key={`${tk.key}-${i}`}
              className={['ms-kbd__key', classNames?.key].filter(Boolean).join(' ')}
              data-modifier={tk.modifier || undefined}
            >
              {separator != null && i > 0 && (
                <span
                  className={['ms-kbd__sep', classNames?.separator].filter(Boolean).join(' ')}
                  aria-hidden="true"
                >
                  {separator}
                </span>
              )}
              {tk.label}
            </span>
          ))
        : children;

    // asChild:把样式与 props 合并到子元素(子元素自带内容),用于自定义包裹元素
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        ...props,
        ...(resolvedAriaLabel != null ? { 'aria-label': resolvedAriaLabel } : {}),
        ...(child.props as object),
        className: [classes, child.props.className].filter(Boolean).join(' '),
      });
    }

    return (
      <kbd
        ref={ref}
        className={classes}
        {...(resolvedAriaLabel != null ? { 'aria-label': resolvedAriaLabel } : {})}
        {...props}
      >
        {content}
      </kbd>
    );
  },
);
Kbd.displayName = 'Kbd';
