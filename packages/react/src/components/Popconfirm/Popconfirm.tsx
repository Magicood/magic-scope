import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import { Popover, type PopoverPlacement } from '../Popover/Popover';

export interface PopconfirmProps {
  /** 触发元素(单个 React 元素),点击弹出确认气泡。 */
  trigger: ReactElement;
  /** 确认标题 / 主问题。 */
  title?: ReactNode;
  /** 次级描述。 */
  description?: ReactNode;
  /** 点击确认时触发(随后自动关闭气泡)。 */
  onConfirm?: () => void;
  /** 点击取消 / 点外 / Esc 关闭时触发。 */
  onCancel?: () => void;
  /** 确认按钮文案。默认「确定」。 */
  confirmText?: ReactNode;
  /** 取消按钮文案。默认「取消」。 */
  cancelText?: ReactNode;
  /** danger 时确认按钮染危险色。 */
  variant?: 'default' | 'danger';
  /** 气泡相对 trigger 的方位。默认 top。 */
  placement?: PopoverPlacement;
}

/**
 * Popconfirm —— 锚定在元素旁的轻量确认气泡(非全屏模态)。自研、零依赖。
 * 复用 Popover(原生 Popover API + CSS Anchor Positioning,点外 / Esc 关闭),内建确认 / 取消按钮流;
 * 常用于列表内联删除确认。需配合 @magic-scope/react/styles.css。
 */
export function Popconfirm({
  trigger,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  variant = 'default',
  placement = 'top',
}: PopconfirmProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // 点外 / Esc 关闭也算取消
        if (!next && open) onCancel?.();
        setOpen(next);
      }}
      trigger={trigger}
      placement={placement}
      className="ms-popconfirm"
    >
      <div
        className={['ms-popconfirm__body', variant === 'danger' && 'ms-popconfirm__body--danger']
          .filter(Boolean)
          .join(' ')}
      >
        {title != null && <div className="ms-popconfirm__title">{title}</div>}
        {description != null && <div className="ms-popconfirm__desc">{description}</div>}
        <div className="ms-popconfirm__actions">
          <button
            type="button"
            className="ms-button ms-button--ghost ms-button--sm"
            onClick={() => {
              onCancel?.();
              setOpen(false);
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="ms-button ms-button--solid ms-button--sm ms-popconfirm__confirm"
            onClick={() => {
              onConfirm?.();
              setOpen(false);
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Popover>
  );
}
Popconfirm.displayName = 'Popconfirm';
