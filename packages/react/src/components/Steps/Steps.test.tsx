// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Steps } from './Steps';

const items = [
  { title: '填写信息', description: '基础资料' },
  { title: '确认订单', description: '核对内容' },
  { title: '完成', description: '提交成功' },
];

describe('Steps', () => {
  it('按 current 派生每步状态:之前 finish、当前 process、之后 wait', () => {
    const { container } = render(<Steps items={items} current={1} />);
    const lis = container.querySelectorAll('.ms-steps__item');
    expect(lis).toHaveLength(3);
    expect(lis[0]).toHaveAttribute('data-status', 'finish');
    expect(lis[1]).toHaveAttribute('data-status', 'process');
    expect(lis[2]).toHaveAttribute('data-status', 'wait');
    // 根带方向/尺寸/tone 类名
    expect(container.querySelector('.ms-steps')).toHaveClass(
      'ms-steps--horizontal',
      'ms-steps--default',
      'ms-tone-primary',
    );
  });

  it('当前步 status 覆盖整体状态,单步 item.status 再优先覆盖', () => {
    const { container } = render(
      <Steps
        current={1}
        status="error"
        items={[{ title: 'A' }, { title: 'B' }, { title: 'C', status: 'finish' }]}
      />,
    );
    const lis = container.querySelectorAll('.ms-steps__item');
    // 当前步用 status=error
    expect(lis[1]).toHaveAttribute('data-status', 'error');
    // 第三步显式 status=finish,覆盖默认的 wait
    expect(lis[2]).toHaveAttribute('data-status', 'finish');
  });

  it('提供 onChange 时可用步渲染为按钮,点击触发 onChange(跳过当前步与禁用步)', () => {
    const onChange = vi.fn();
    render(
      <Steps
        current={0}
        onChange={onChange}
        items={[{ title: '第一步' }, { title: '第二步' }, { title: '第三步', disabled: true }]}
      />,
    );
    // 可点击步是 button
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // 第三步禁用,不渲染按钮
    // 点第二步 → onChange(1)
    fireEvent.click(buttons[1] as HTMLElement);
    expect(onChange).toHaveBeenCalledWith(1);
    // 点当前步(index 0)不触发
    fireEvent.click(buttons[0] as HTMLElement);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('非受控:点击跳步内部更新 current(无 current prop 时)', () => {
    const onChange = vi.fn();
    const { container } = render(<Steps defaultCurrent={0} onChange={onChange} items={items} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2] as HTMLElement);
    expect(onChange).toHaveBeenCalledWith(2);
    // 内部状态推进:第三步变 process
    const lis = container.querySelectorAll('.ms-steps__item');
    expect(lis[2]).toHaveAttribute('data-status', 'process');
  });

  it('键盘可达:方向键在可用步间移动焦点,Enter 跳转', () => {
    const onChange = vi.fn();
    render(<Steps current={0} onChange={onChange} items={items} />);
    const buttons = screen.getAllByRole('button');
    const first = buttons[0] as HTMLElement;
    first.focus();
    // ArrowRight 把焦点移到第二步
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[1]);
    // 在第二步上 Enter 跳转
    fireEvent.keyDown(buttons[1] as HTMLElement, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('复合子组件 Steps.Step 等价于 items 入口', () => {
    const { container } = render(
      <Steps current={1}>
        <Steps.Step title="一" />
        <Steps.Step title="二" />
        <Steps.Step title="三" />
      </Steps>,
    );
    const lis = container.querySelectorAll('.ms-steps__item');
    expect(lis).toHaveLength(3);
    expect(lis[0]).toHaveAttribute('data-status', 'finish');
    expect(lis[1]).toHaveAttribute('data-status', 'process');
    expect(screen.getByText('二')).toBeInTheDocument();
  });

  it('progressDot 渲染点状、percent 在当前步画进度环、连线 finish 染色', () => {
    const { container } = render(
      <Steps current={1} percent={60} progressDot items={items} direction="vertical" />,
    );
    expect(container.querySelector('.ms-steps--dot')).toBeInTheDocument();
    expect(container.querySelector('.ms-steps--vertical')).toBeInTheDocument();
    // 当前步(process)+ percent → 进度环存在
    expect(container.querySelector('.ms-steps__ring-bar')).toBeInTheDocument();
    // 第一步已 finish,其连线染色
    const tails = container.querySelectorAll('.ms-steps__tail');
    expect(tails[0]).toHaveClass('ms-steps__tail--finish');
  });

  it('禁用步标 data-disabled、默认渲染序号、自定义 icon 覆盖序号', () => {
    const { container } = render(
      <Steps
        current={0}
        items={[
          { title: '默认序号步' },
          { title: '自定义图标步', icon: <span data-testid="custom-icon">★</span> },
          { title: '禁用步', disabled: true },
        ]}
      />,
    );
    const lis = container.querySelectorAll('.ms-steps__item');
    // 第三步禁用 → data-disabled 标记
    expect(lis[2]).toHaveAttribute('data-disabled', '');
    expect(lis[0]).not.toHaveAttribute('data-disabled');
    // 第一步默认渲染序号 1(非 finish/error 时回退序号)
    expect(container.querySelector('.ms-steps__number')).toHaveTextContent('1');
    // 第二步自定义 icon 覆盖序号
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    // 无 onChange 时无可点击按钮(纯展示)
    expect(screen.queryByRole('button')).toBeNull();
  });
});
