// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { clampProgress, Progress } from './Progress';

describe('Progress', () => {
  it('确定态:role=progressbar + aria-valuenow + 填充宽度,默认 primary/md/linear', () => {
    const { container } = render(<Progress value={42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass(
      'ms-progress',
      'ms-progress--linear',
      'ms-progress--md',
      'ms-tone-primary',
    );
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    const fill = container.querySelector('.ms-progress__fill') as HTMLElement;
    expect(fill).toHaveStyle({ inlineSize: '42%' });
  });

  it('value 越界被夹到 0-100;非有限值回退 0', () => {
    expect(clampProgress(140)).toBe(100);
    expect(clampProgress(-5)).toBe(0);
    expect(clampProgress(Number.NaN)).toBe(0);
    const { container } = render(<Progress value={140} />);
    expect(container.querySelector('.ms-progress__fill') as HTMLElement).toHaveStyle({
      inlineSize: '100%',
    });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('不确定态:无 value 或 indeterminate 时加类且无 aria-valuenow', () => {
    const { rerender } = render(<Progress />);
    let bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass('ms-progress--indeterminate');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    rerender(<Progress indeterminate value={50} />);
    bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass('ms-progress--indeterminate');
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('tone / size / striped+animated 映射到类', () => {
    const { container } = render(<Progress value={30} tone="success" size="lg" striped animated />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass(
      'ms-tone-success',
      'ms-progress--lg',
      'ms-progress--striped',
      'ms-progress--animated',
    );
    // animated 仅在 striped 时生效
    expect(container.querySelector('.ms-progress--animated')).toBeInTheDocument();
  });

  it('buffer:绘制缓冲段并设其宽度(确定态)', () => {
    const { container } = render(<Progress value={30} buffer={70} />);
    const buf = container.querySelector('.ms-progress__buffer') as HTMLElement;
    expect(buf).toBeInTheDocument();
    expect(buf).toHaveStyle({ inlineSize: '70%' });
  });

  it('showValue 显示百分比;label 自定义 ReactNode 覆盖之', () => {
    const { rerender } = render(<Progress value={66.6} showValue />);
    expect(screen.getByText('67%')).toBeInTheDocument();
    rerender(<Progress value={66.6} showValue label={<span>下载中</span>} />);
    expect(screen.getByText('下载中')).toBeInTheDocument();
    expect(screen.queryByText('67%')).toBeNull();
  });

  it('circular:渲染 SVG 双 circle,确定态写 stroke-dashoffset', () => {
    const { container } = render(<Progress variant="circular" value={50} showValue />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass('ms-progress--circular');
    expect(container.querySelector('svg.ms-progress__svg')).toBeInTheDocument();
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
    const fill = container.querySelector('circle.ms-progress__fill') as SVGCircleElement;
    expect(fill).toHaveAttribute('stroke-dashoffset');
    // 环心居中 label
    expect(screen.getByText('50%')).toHaveClass('ms-progress__label--center');
  });

  it('classNames 精修子部件 + glow=off + 透传原生属性/className', () => {
    const { container } = render(
      <Progress
        value={20}
        glow="off"
        className="custom-root"
        data-testid="bar"
        classNames={{ track: 'my-track', fill: 'my-fill', label: 'my-label' }}
        showValue
      />,
    );
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass('custom-root', 'ms-progress--glow-off');
    expect(bar).toHaveAttribute('data-testid', 'bar');
    expect(container.querySelector('.ms-progress__track.my-track')).toBeInTheDocument();
    expect(container.querySelector('.ms-progress__fill.my-fill')).toBeInTheDocument();
    expect(container.querySelector('.ms-progress__label.my-label')).toBeInTheDocument();
  });

  it('无可见 label 且未传 aria-label 时给可读兜底', () => {
    render(<Progress value={10} />);
    expect(screen.getByRole('progressbar', { name: '进度' })).toBeInTheDocument();
  });
});
