import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends ComponentPropsWithoutRef<'div'> {
  /** 语义变体:信息 / 成功 / 警告 / 危险。默认 info。 */
  variant?: AlertVariant;
}

/**
 * Alert —— 提示框。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * role="alert" 向辅助技术播报;按变体渲染柔和底色(color-mix)与起始边强调条。
 * 样式见同目录 Alert.css,需引入 @magic-scope/react/styles.css。
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={['ms-alert', `ms-alert--${variant}`, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  ),
);
Alert.displayName = 'Alert';
