import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { Button, type ButtonSize, type ButtonTone, type ButtonVariant } from '../Button/Button';
import { Tooltip, type TooltipPlacement } from '../Tooltip/Tooltip';
import { copyMessageKey, writeClipboard } from './logic';

/** 默认「复制」图标(两叠的方片)。可被 icon prop 覆盖。 */
const DefaultCopyIcon = (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
    <title>copy</title>
    <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M5 15V5a2 2 0 0 1 2-2h10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/** 默认「已复制」图标(对勾)。可被 copiedIcon prop 覆盖。 */
const DefaultCopiedIcon = (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
    <title>copied</title>
    <path
      d="M4 12.5 9 17.5 20 6.5"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** CopyButton 的 children 可为普通节点,或按 copied 状态自定义渲染的 render-prop。 */
export type CopyButtonChildren = ReactNode | ((copied: boolean) => ReactNode);

/**
 * 根容器透传的原生属性:CopyButton 渲染为 <button>,排除会被内部接管 / 语义冲突的键。
 * 'children' 重声明为 CopyButtonChildren(支持 render-prop);'onCopy'(原生剪贴板事件处理器)与
 * 'onError'(原生错误事件处理器)被本组件重定义为复制成功 / 失败回调,故一并 Omit 掉避免签名冲突。
 */
type CopyButtonRootProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'children' | 'value' | 'type' | 'onCopy' | 'onError'
>;

export interface CopyButtonProps extends CopyButtonRootProps {
  /** 要写入剪贴板的文本。 */
  value: string;
  /** 进入「已复制」反馈态后自动还原的毫秒数。默认 1500。 */
  timeout?: number | undefined;
  /**
   * 复制成功回调。
   * @param value 实际写入剪贴板的文本(即本组件的 value)。
   */
  onCopy?: ((value: string) => void) | undefined;
  /**
   * 复制失败回调(剪贴板不可用 / 被拒绝 / execCommand 兜底也失败)。
   * @param error 失败原因;特性不可用时为内置 Error,异常路径透传原始错误。
   */
  onError?: ((error: Error) => void) | undefined;
  /** 覆盖默认「复制」图标。 */
  icon?: ReactNode | undefined;
  /** 覆盖默认「已复制」(对勾)图标。 */
  copiedIcon?: ReactNode | undefined;
  /** 自定义内容:普通节点,或 `(copied) => ReactNode` 按状态渲染(默认仅图标)。 */
  children?: CopyButtonChildren | undefined;
  /** 语义色调(复用 Button 的 tone resolver)。默认 primary。 */
  tone?: ButtonTone | undefined;
  /** 尺寸(随 data-ms-density 缩放,复用 Button)。默认 md。 */
  size?: ButtonSize | undefined;
  /** 视觉变体(复用 Button)。默认 soft。 */
  variant?: ButtonVariant | undefined;
  /** 是否用 Tooltip 显示「复制 / 已复制」提示。默认 true。 */
  withTooltip?: boolean | undefined;
  /** Tooltip 方位(withTooltip 时生效)。默认 top。 */
  tooltipPlacement?: TooltipPlacement | undefined;
  /** 自定义 aria-label;未传则随状态用 i18n「复制 / 已复制」。 */
  'aria-label'?: string | undefined;
}

/**
 * CopyButton —— 复制按钮(actions)。点击把 value 写入剪贴板并进入「已复制」反馈态:
 * - 图标从「复制」切到「对勾」,timeout(默认 1500ms)后自动还原。
 * - 复制走逻辑层 writeClipboard:优先 navigator.clipboard.writeText(需安全上下文 https/localhost),
 *   特性检测后回退 document.execCommand('copy');两者皆不可用时触发 onError。
 * - a11y:button aria-label 随状态切换(复制 / 已复制);成功时经一个 aria-live=polite 的视隐区
 *   播报「已复制」,读屏用户也能感知。
 * - 复用 Button(tone / size / variant + 全 tone resolver 配色 + 密度缩放)与 Tooltip(可关)。
 * - 留口:render-prop children `(copied) => ReactNode` 自定义内容;icon / copiedIcon 覆盖图标;
 *   onClick 等原生事件经 composeEventHandlers 合并(先用户、未 preventDefault 再复制),...rest 透传。
 *
 * 诚实备注:navigator.clipboard 仅在安全上下文(https / localhost / file)暴露;普通 http 页面会自动
 * 走 execCommand 兜底,而 execCommand 已被标准弃用(浏览器仍广泛兼容),且要求由用户手势触发。
 * 样式见同目录 CopyButton.css,需引入 @magic-scope/react/styles.css。
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      value,
      timeout = 1500,
      onCopy,
      onError,
      icon,
      copiedIcon,
      children,
      tone = 'primary',
      size = 'md',
      variant = 'soft',
      withTooltip = true,
      tooltipPlacement = 'top',
      className,
      onClick,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const [copied, setCopied] = useState(false);
    // 每次成功复制递增,确保 aria-live 区文本节点每次都变化以触发 polite 重播。
    const [announceCount, setAnnounceCount] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // 挂载守卫:卸载后异步路径不得再 setState / 建定时器。
    const mountedRef = useRef(true);

    const clearTimer = useCallback(() => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    // 卸载时清掉计时器并置挂载标志,避免对已卸载组件 setState。
    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
        clearTimer();
      };
    }, [clearTimer]);

    const copy = useCallback(async () => {
      const ok = await writeClipboard(value);
      // await 后组件可能已卸载:不再 setState / 建定时器,也不重播。
      if (!mountedRef.current) {
        return;
      }
      if (ok) {
        setCopied(true);
        // 递增计数让 live 区文本每次成功都不同 —— 连续复制也能重播「已复制」。
        setAnnounceCount((n) => n + 1);
        onCopy?.(value);
        clearTimer();
        if (timeout > 0) {
          timerRef.current = setTimeout(() => {
            if (mountedRef.current) {
              setCopied(false);
            }
          }, timeout);
        }
      } else {
        onError?.(new Error('CopyButton: clipboard write failed or unavailable'));
      }
    }, [value, onCopy, onError, clearTimer, timeout]);

    const label = ariaLabel ?? t(copyMessageKey(copied));

    // 内容:render-prop 优先,其次自定义 children,最后默认按状态切图标。
    let content: ReactNode;
    if (typeof children === 'function') {
      content = children(copied);
    } else if (children != null) {
      content = children;
    } else {
      content = copied ? (copiedIcon ?? DefaultCopiedIcon) : (icon ?? DefaultCopyIcon);
    }

    const button = (
      <Button
        ref={ref}
        type="button"
        variant={variant}
        tone={tone}
        size={size}
        iconOnly={typeof children !== 'function' && children == null}
        aria-label={label}
        data-copied={copied || undefined}
        className={['ms-copy-button', className].filter(Boolean).join(' ')}
        // 先用户的 onClick(可 preventDefault 阻断复制),未拦截再执行复制。
        onClick={composeEventHandlers(onClick, () => {
          void copy();
        })}
        {...rest}
      >
        <span className="ms-copy-button__content" data-copied={copied || undefined}>
          {content}
        </span>
      </Button>
    );

    return (
      <>
        {withTooltip ? (
          <Tooltip content={label} placement={tooltipPlacement}>
            {button}
          </Tooltip>
        ) : (
          button
        )}
        {/* 复制成功的读屏播报:视隐 live region。文本后附 announceCount 个零宽连接符(不可见、不读音),
            使每次成功复制文本节点都不同,连续复制(copied 仍为 true)也能触发 polite 重播。 */}
        <span className="ms-sr-only" aria-live="polite" data-announce={announceCount}>
          {copied ? t('typography.copied') + '⁠'.repeat(announceCount) : ''}
        </span>
      </>
    );
  },
);
CopyButton.displayName = 'CopyButton';
