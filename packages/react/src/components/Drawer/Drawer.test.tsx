// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './Drawer';

const drawer = () => screen.getByRole('dialog', { hidden: true });

/** 模拟「点击遮罩」:pointerdown 落在 dialog 本身 + click 落在 dialog 本身。 */
const clickBackdrop = () => {
  const d = drawer();
  fireEvent.pointerDown(d, { target: d });
  fireEvent.click(d, { target: d });
};

describe('Drawer', () => {
  it('打开时渲染抽屉结构、children、默认 end/md 方向尺寸类名、tone 类', () => {
    render(
      <Drawer open onClose={() => {}}>
        <p>抽屉内容</p>
      </Drawer>,
    );
    expect(drawer()).toHaveClass('ms-drawer', 'ms-drawer--end', 'ms-drawer--md', 'ms-tone-primary');
    expect(drawer().querySelector('.ms-drawer__panel')).toBeInTheDocument();
    expect(screen.getByText('抽屉内容')).toBeInTheDocument();
  });

  it('side / size / tone 映射到类名', () => {
    const { rerender } = render(
      <Drawer open side="start" size="lg" tone="success" onClose={() => {}}>
        x
      </Drawer>,
    );
    expect(drawer()).toHaveClass('ms-drawer--start', 'ms-drawer--lg', 'ms-tone-success');
    rerender(
      <Drawer open side="bottom" size="sm" tone="danger" onClose={() => {}}>
        x
      </Drawer>,
    );
    expect(drawer()).toHaveClass('ms-drawer--bottom', 'ms-drawer--sm', 'ms-tone-danger');
  });

  it('title 渲染头部并与抽屉 aria-labelledby 关联;点关闭按钮触发 onClose + onOpenChange(false)', () => {
    const onClose = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Drawer open title="筛选" onClose={onClose} onOpenChange={onOpenChange}>
        内容
      </Drawer>,
    );
    const title = screen.getByText('筛选');
    expect(title.tagName).toBe('H2');
    expect(drawer()).toHaveAttribute('aria-labelledby', title.id);

    fireEvent.click(screen.getByLabelText('关闭'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('header 整块优先于 title;header 存在时不设 aria-labelledby', () => {
    render(
      <Drawer
        open
        header={<div data-testid="custom-head">自定义头</div>}
        title="被忽略"
        onClose={() => {}}
      >
        内容
      </Drawer>,
    );
    expect(screen.getByTestId('custom-head')).toBeInTheDocument();
    expect(screen.queryByText('被忽略')).not.toBeInTheDocument();
    expect(drawer()).not.toHaveAttribute('aria-labelledby');
  });

  it('footer 渲染固定底栏', () => {
    render(
      <Drawer open onClose={() => {}} footer={<button type="button">保存</button>}>
        内容
      </Drawer>,
    );
    const footer = drawer().querySelector('.ms-drawer__footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toContainElement(screen.getByText('保存'));
  });

  it('无 title 时渲染浮动关闭按钮;hideCloseButton 时不渲染关闭钮', () => {
    const { rerender } = render(
      <Drawer open onClose={() => {}}>
        内容
      </Drawer>,
    );
    expect(screen.getByLabelText('关闭')).toHaveClass('ms-drawer__close--floating');

    rerender(
      <Drawer open onClose={() => {}} hideCloseButton title="t">
        内容
      </Drawer>,
    );
    expect(screen.queryByLabelText('关闭')).not.toBeInTheDocument();
  });

  it('closeIcon 覆盖默认图标;classNames 注入到各部件', () => {
    render(
      <Drawer
        open
        title="设置"
        onClose={() => {}}
        closeIcon={<span data-testid="my-icon">×</span>}
        footer={<span>f</span>}
        classNames={{
          panel: 'my-panel',
          header: 'my-header',
          title: 'my-title',
          body: 'my-body',
          footer: 'my-footer',
          close: 'my-close',
        }}
      >
        内容
      </Drawer>,
    );
    expect(screen.getByTestId('my-icon')).toBeInTheDocument();
    const d = drawer();
    expect(d.querySelector('.ms-drawer__panel')).toHaveClass('my-panel');
    expect(d.querySelector('.ms-drawer__header')).toHaveClass('my-header');
    expect(d.querySelector('.ms-drawer__title')).toHaveClass('my-title');
    expect(d.querySelector('.ms-drawer__body')).toHaveClass('my-body');
    expect(d.querySelector('.ms-drawer__footer')).toHaveClass('my-footer');
    expect(screen.getByLabelText('关闭')).toHaveClass('my-close');
  });

  it('dismissable 时点击遮罩触发关闭;false 时不触发', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Drawer open onClose={onClose}>
        内容
      </Drawer>,
    );
    clickBackdrop();
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <Drawer open onClose={onClose} dismissable={false}>
        内容
      </Drawer>,
    );
    clickBackdrop();
    expect(onClose).toHaveBeenCalledTimes(1); // 未再增加
  });

  it('onPointerDownOutside / onInteractOutside preventDefault 可拦截点遮罩关闭', () => {
    const onClose = vi.fn();
    const onPointerDownOutside = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const onInteractOutside = vi.fn();
    render(
      <Drawer
        open
        onClose={onClose}
        onPointerDownOutside={onPointerDownOutside}
        onInteractOutside={onInteractOutside}
      >
        内容
      </Drawer>,
    );
    clickBackdrop();
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled(); // 被拦截
  });

  it('onEscapeKeyDown 触发并可 preventDefault 拦截 Esc 关闭', () => {
    const onClose = vi.fn();
    const onEscapeKeyDown = vi.fn((e: KeyboardEvent) => e.preventDefault());
    const { rerender } = render(
      <Drawer open onClose={onClose} onEscapeKeyDown={onEscapeKeyDown}>
        内容
      </Drawer>,
    );
    // 原生 <dialog> 的 Esc 派发 cancel 事件
    fireEvent(drawer(), new Event('cancel', { cancelable: true }));
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled(); // 被拦截

    // 不拦截时:cancel 应触发关闭
    const onClose2 = vi.fn();
    rerender(
      <Drawer open onClose={onClose2}>
        内容
      </Drawer>,
    );
    fireEvent(drawer(), new Event('cancel', { cancelable: true }));
    expect(onClose2).toHaveBeenCalledTimes(1);
  });

  it('用户原生事件处理器与内部 handler 都触发(compose 不丢用户处理器)', () => {
    const onClose = vi.fn();
    const userClick = vi.fn();
    const userPointerDown = vi.fn();
    render(
      <Drawer open onClose={onClose} onClick={userClick} onPointerDown={userPointerDown}>
        内容
      </Drawer>,
    );
    clickBackdrop();
    expect(userPointerDown).toHaveBeenCalledTimes(1);
    expect(userClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1); // 内部关闭仍执行
  });

  it('原生 close 事件触发关闭;合并 className 与原生属性', () => {
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
