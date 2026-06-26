// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { lastLineWidth, resolveDimension } from './logic';
import { Skeleton, SkeletonGroup, SkeletonText } from './Skeleton';

describe('Skeleton', () => {
  it('默认渲染 rect 形态 + shimmer 动画 + aria-hidden/aria-busy', () => {
    const { container } = render(<Skeleton data-testid="sk" />);
    const el = container.querySelector('.ms-skeleton');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('ms-skeleton--rect', 'ms-skeleton--anim-shimmer');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveAttribute('aria-busy', 'true');
  });

  it('按 variant 与 animation 渲染对应类名', () => {
    const { container, rerender } = render(<Skeleton variant="circle" animation="wave" />);
    expect(container.querySelector('.ms-skeleton')).toHaveClass(
      'ms-skeleton--circle',
      'ms-skeleton--anim-wave',
    );
    rerender(<Skeleton variant="text" animation="pulse" />);
    expect(container.querySelector('.ms-skeleton')).toHaveClass(
      'ms-skeleton--text',
      'ms-skeleton--anim-pulse',
    );
    rerender(<Skeleton animation="none" />);
    expect(container.querySelector('.ms-skeleton')).toHaveClass('ms-skeleton--anim-none');
  });

  it('width/height 便捷 props 映射到 inline-size/block-size(number→px)', () => {
    const { container } = render(<Skeleton width={200} height="3rem" />);
    const el = container.querySelector('.ms-skeleton') as HTMLElement;
    expect(el.style.inlineSize).toBe('200px');
    expect(el.style.blockSize).toBe('3rem');
  });

  it('用户 style 优先,不被 width/height 覆盖', () => {
    const { container } = render(<Skeleton width={200} style={{ inlineSize: '50%' }} />);
    const el = container.querySelector('.ms-skeleton') as HTMLElement;
    expect(el.style.inlineSize).toBe('50%');
  });

  it('lines>1 渲染多行文本骨架,自动切到 text 形态,末行收窄', () => {
    const { container } = render(<Skeleton lines={4} />);
    const root = container.querySelector('.ms-skeleton') as HTMLElement;
    expect(root).toHaveClass('ms-skeleton--text', 'ms-skeleton--multiline');
    const lineEls = container.querySelectorAll('.ms-skeleton__line');
    expect(lineEls).toHaveLength(4);
    // 末行有收窄宽度,非末行没有内联宽度
    const last = lineEls[lineEls.length - 1] as HTMLElement;
    expect(last.style.inlineSize).toBe(lastLineWidth(4));
    expect((lineEls[0] as HTMLElement).style.inlineSize).toBe('');
  });

  it('内容感知:loading 时显骨架,loading=false 时透出真实内容', () => {
    const { rerender } = render(
      <Skeleton loading variant="text">
        <span data-testid="real">真实内容</span>
      </Skeleton>,
    );
    expect(screen.queryByTestId('real')).not.toBeInTheDocument();
    expect(document.querySelector('.ms-skeleton')).toBeInTheDocument();

    rerender(
      <Skeleton loading={false} variant="text">
        <span data-testid="real">真实内容</span>
      </Skeleton>,
    );
    expect(screen.getByTestId('real')).toBeInTheDocument();
    expect(document.querySelector('.ms-skeleton')).not.toBeInTheDocument();
  });

  it('透传原生属性/事件并 compose,转发 ref 到根 div', () => {
    const handleClick = vi.fn();
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Skeleton ref={ref} id="my-sk" data-x="1" onClick={handleClick} className="extra" />,
    );
    const el = container.querySelector('.ms-skeleton') as HTMLElement;
    expect(el).toHaveClass('extra');
    expect(el).toHaveAttribute('id', 'my-sk');
    expect(el).toHaveAttribute('data-x', '1');
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    fireEvent.click(el);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('asChild 把骨架样式合并到子元素并保留子元素', () => {
    const { container } = render(
      <Skeleton asChild variant="circle" className="extra">
        <span data-testid="slot" />
      </Skeleton>,
    );
    const el = container.querySelector('span[data-testid="slot"]') as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('ms-skeleton', 'ms-skeleton--circle', 'extra');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('SkeletonText', () => {
  it('渲染 n 行文本骨架(最少 2 行),末行收窄', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const root = container.querySelector('.ms-skeleton');
    expect(root).toHaveClass('ms-skeleton--text', 'ms-skeleton--multiline');
    expect(container.querySelectorAll('.ms-skeleton__line')).toHaveLength(5);
  });
});

describe('SkeletonGroup', () => {
  it('无 children 时渲染预制模板(头像 + 标题 + 正文)', () => {
    const { container } = render(<SkeletonGroup />);
    expect(container.querySelector('.ms-skeleton-group')).toBeInTheDocument();
    expect(container.querySelector('.ms-skeleton-template__avatar')).toBeInTheDocument();
    expect(container.querySelector('.ms-skeleton-template__title')).toBeInTheDocument();
  });

  it('loading=false 时透出真实内容', () => {
    render(
      <SkeletonGroup loading={false}>
        <div data-testid="content">已加载</div>
      </SkeletonGroup>,
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(document.querySelector('.ms-skeleton-group')).not.toBeInTheDocument();
  });
});

describe('Skeleton logic', () => {
  it('resolveDimension:number→px,字符串原样', () => {
    expect(resolveDimension(120)).toBe('120px');
    expect(resolveDimension('50%')).toBe('50%');
  });

  it('lastLineWidth:行数收窄,落在 55%~80% 之间,单行为 100%', () => {
    expect(lastLineWidth(1)).toBe('100%');
    expect(lastLineWidth(2)).toBe('56%');
    expect(lastLineWidth(100)).toBe('80%');
  });
});
