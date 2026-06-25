// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('打开时渲染对话框结构、children 与基础类名', () => {
    render(
      <Dialog open onClose={() => {}}>
        <p>对话框内容</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass('ms-dialog');
    expect(dialog.querySelector('.ms-dialog__panel')).toBeInTheDocument();
    expect(screen.getByText('对话框内容')).toBeInTheDocument();
  });

  it('合并外部 className 并透传原生属性', () => {
    render(
      <Dialog open onClose={() => {}} className="custom" aria-label="确认弹窗">
        内容
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveClass('ms-dialog');
    expect(dialog).toHaveClass('custom');
    expect(dialog).toHaveAttribute('aria-label', '确认弹窗');
  });

  it('dismissable 时点击遮罩(dialog 本身)触发 onClose', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        内容
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    // 点击 dialog 元素本身 = 点击遮罩区域
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dismissable=false 时点击遮罩不触发 onClose', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} dismissable={false}>
        内容
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('原生 close 事件触发 onClose 回调', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        内容
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent(dialog, new Event('close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
