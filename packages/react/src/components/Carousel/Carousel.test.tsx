// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Carousel } from './Carousel';

const slides = [
  <div key="a">幻灯片 A</div>,
  <div key="b">幻灯片 B</div>,
  <div key="c">幻灯片 C</div>,
];

describe('Carousel', () => {
  it('渲染为 role=region + aria-roledescription=carousel,带基础类名', () => {
    render(<Carousel aria-label="活动">{slides}</Carousel>);
    const region = screen.getByRole('region', { name: '活动' });
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    expect(region).toHaveClass('ms-carousel');
  });

  it('默认渲染指示点与箭头,数量与 slide 对齐', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByRole('button', { name: '上一张' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下一张' })).toBeInTheDocument();
    // 3 个跳转点
    expect(screen.getByRole('button', { name: '跳到第 1 张' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '跳到第 3 张' })).toBeInTheDocument();
  });

  it('点「下一张」推进活动 slide(非受控)', () => {
    render(<Carousel>{slides}</Carousel>);
    // 初始第 1 点为 active
    expect(screen.getByRole('button', { name: '跳到第 1 张' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: '下一张' }));
    expect(screen.getByRole('button', { name: '跳到第 2 张' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('点指示点跳转到对应 slide', () => {
    render(<Carousel>{slides}</Carousel>);
    fireEvent.click(screen.getByRole('button', { name: '跳到第 3 张' }));
    expect(screen.getByRole('button', { name: '跳到第 3 张' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('loop=true 时末张「下一张」环绕回首张', () => {
    render(<Carousel loop>{slides}</Carousel>);
    fireEvent.click(screen.getByRole('button', { name: '跳到第 3 张' }));
    fireEvent.click(screen.getByRole('button', { name: '下一张' }));
    expect(screen.getByRole('button', { name: '跳到第 1 张' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('loop=false 时首/末张的箭头禁用', () => {
    render(
      <Carousel loop={false} defaultIndex={0}>
        {slides}
      </Carousel>,
    );
    expect(screen.getByRole('button', { name: '上一张' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '下一张' })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '跳到第 3 张' }));
    expect(screen.getByRole('button', { name: '下一张' })).toBeDisabled();
  });

  it('受控 activeIndex:点击只触发 onChange,不自行改视图', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Carousel activeIndex={0} onChange={onChange}>
        {slides}
      </Carousel>,
    );
    fireEvent.click(screen.getByRole('button', { name: '下一张' }));
    expect(onChange).toHaveBeenCalledWith(1);
    // 未受控更新前视图不动
    expect(screen.getByRole('button', { name: '跳到第 1 张' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    rerender(
      <Carousel activeIndex={1} onChange={onChange}>
        {slides}
      </Carousel>,
    );
    expect(screen.getByRole('button', { name: '跳到第 2 张' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('非活动 slide 设 aria-hidden,活动的不设', () => {
    render(<Carousel>{slides}</Carousel>);
    const groups = screen.getAllByRole('group', { hidden: true });
    const slideGroups = groups.filter((g) => g.getAttribute('aria-roledescription') === 'slide');
    expect(slideGroups).toHaveLength(3);
    expect(slideGroups[0]).not.toHaveAttribute('aria-hidden');
    expect(slideGroups[1]).toHaveAttribute('aria-hidden', 'true');
  });

  it('dots={false} / arrows={false} 时不渲染对应控件', () => {
    render(
      <Carousel dots={false} arrows={false}>
        {slides}
      </Carousel>,
    );
    expect(screen.queryByRole('button', { name: '下一张' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '跳到第 1 张' })).not.toBeInTheDocument();
  });

  it('classNames 槽位透传到对应部件', () => {
    const { container } = render(
      <Carousel classNames={{ root: 'my-root', dot: 'my-dot', arrow: 'my-arrow' }}>
        {slides}
      </Carousel>,
    );
    expect(container.querySelector('.ms-carousel')).toHaveClass('my-root');
    expect(container.querySelector('.ms-carousel__dot')).toHaveClass('my-dot');
    expect(container.querySelector('.ms-carousel__arrow')).toHaveClass('my-arrow');
  });

  it('composeEventHandlers:用户 onPointerDown 与内部拖拽并存', () => {
    const onPointerDown = vi.fn();
    const { container } = render(<Carousel onPointerDown={onPointerDown}>{slides}</Carousel>);
    const region = container.querySelector('.ms-carousel') as HTMLElement;
    fireEvent.pointerDown(region, { clientX: 100, clientY: 0 });
    expect(onPointerDown).toHaveBeenCalledTimes(1);
  });

  it('指针拖拽超阈值切换 slide(水平)', () => {
    const { container } = render(<Carousel dragThreshold={50}>{slides}</Carousel>);
    const region = container.querySelector('.ms-carousel') as HTMLElement;
    // 向左拖 80px(delta=-80 → 下一张)
    fireEvent.pointerDown(region, { clientX: 200, clientY: 0 });
    fireEvent.pointerUp(region, { clientX: 120, clientY: 0 });
    expect(screen.getByRole('button', { name: '跳到第 2 张' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  describe('autoplay 定时器', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('autoplay 到点自动前进', () => {
      render(<Carousel autoplay={{ interval: 1000 }}>{slides}</Carousel>);
      expect(screen.getByRole('button', { name: '跳到第 1 张' })).toHaveAttribute(
        'aria-current',
        'true',
      );
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole('button', { name: '跳到第 2 张' })).toHaveAttribute(
        'aria-current',
        'true',
      );
    });
  });

  it('forwardRef 指向根容器,并暴露命令式 goTo', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Carousel ref={ref}>{slides}</Carousel>);
    expect(ref.current).toHaveClass('ms-carousel');
    act(() => {
      (ref.current as HTMLDivElement & { goTo: (i: number) => void }).goTo(2);
    });
    expect(screen.getByRole('button', { name: '跳到第 3 张' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});
