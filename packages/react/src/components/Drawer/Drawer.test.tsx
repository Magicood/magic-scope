// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './Drawer';

const drawer = () => screen.getByRole('dialog', { hidden: true });

describe('Drawer', () => {
  it('打开时渲染抽屉结构、children、默认 end 方向类名', () => {
    render(
      <Drawer open onClose={() => {}}>
        <p>抽屉内容</p>
      </Drawer>,
    );
    expect(drawer()).toHaveClass('ms-drawer', 'ms-drawer--end');
    expect(drawer().querySelector('.ms-drawer__panel')).toBeInTheDocument();
    expect(screen.getByText('抽屉内容')).toBeInTheDocument();
  });

  it('side 方向映射到类名', () => {
    const { rerender } = render(
      <Drawer open side="start" onClose={() => {}}>
        x
      </Drawer>,
    );
    expect(drawer()).toHaveClass('ms-drawer--start');
    rerender(
      <Drawer open side="bottom" onClose={() => {}}>
        x
      </Drawer>,
    );
    expect(drawer()).toHaveClass('ms-drawer--bottom');
  });

  it('title 渲染头部并与抽屉 aria-labelledby 关联;点关闭按钮触发 onClose', () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="筛选" onClose={onClose}>
        内容
      </Drawer>,
    );
    const title = screen.getByText('筛选');
    expect(title.tagName).toBe('H2');
    expect(drawer()).toHaveAttribute('aria-labelledby', title.id);

    fireEvent.click(screen.getByLabelText('关闭'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('无 title 时渲染浮动关闭按钮', () => {
    render(
      <Drawer open onClose={() => {}}>
        内容
      </Drawer>,
    );
    expect(screen.getByLabelText('关闭')).toHaveClass('ms-drawer__close--floating');
  });

  it('dismissable 时点击遮罩(dialog 本身)触发 onClose;false 时不触发', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Drawer open onClose={onClose}>
        内容
      </Drawer>,
    );
    fireEvent.click(drawer());
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <Drawer open onClose={onClose} dismissable={false}>
        内容
      </Drawer>,
    );
    fireEvent.click(drawer());
    expect(onClose).toHaveBeenCalledTimes(1); // 未再增加
  });

  it('原生 close 事件触发 onClose;合并 className 与原生属性', () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} className="custom" aria-describedby="d">
        内容
      </Drawer>,
    );
    expect(drawer()).toHaveClass('custom');
    expect(drawer()).toHaveAttribute('aria-describedby', 'd');

    fireEvent(drawer(), new Event('close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
