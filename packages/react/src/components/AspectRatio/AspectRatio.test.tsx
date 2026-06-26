// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AspectRatio } from './AspectRatio';
import {
  activeRatioBreakpoints,
  isResponsiveRatio,
  normalizeRatio,
  resolveRatioVars,
} from './logic';

describe('AspectRatio', () => {
  it('默认渲染 div + 16/9 比例变量 + cover + 内容包裹层', () => {
    const { container } = render(
      <AspectRatio>
        <img src="x.jpg" alt="" />
      </AspectRatio>,
    );
    const el = container.querySelector('.ms-aspect-ratio') as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('ms-aspect-ratio--fit-cover');
    // 比例写入 inline CSS 变量
    expect(el.style.getPropertyValue('--ms-ar-ratio')).toBe('16 / 9');
    // 内容被绝对铺满的包裹层包住
    const content = el.querySelector('.ms-aspect-ratio__content');
    expect(content).toBeInTheDocument();
    expect(content?.querySelector('img')).toBeInTheDocument();
  });

  it('数字 ratio 归一为 CSS aspect-ratio 数值', () => {
    const { container } = render(<AspectRatio ratio={4 / 3} />);
    const el = container.querySelector('.ms-aspect-ratio') as HTMLElement;
    expect(el.style.getPropertyValue('--ms-ar-ratio')).toBe(String(4 / 3));
  });

  it('字符串 ratio "21/9" 透传为 "21 / 9"', () => {
    const { container } = render(<AspectRatio ratio="21/9" />);
    const el = container.querySelector('.ms-aspect-ratio') as HTMLElement;
    expect(el.style.getPropertyValue('--ms-ar-ratio')).toBe('21 / 9');
  });

  it('响应式 ratio 对象:写 base + 各断点变量,并挂对应断点类名', () => {
    const { container } = render(<AspectRatio ratio={{ base: 1, md: 16 / 9, lg: '21/9' }} />);
    const el = container.querySelector('.ms-aspect-ratio') as HTMLElement;
    expect(el.style.getPropertyValue('--ms-ar-ratio')).toBe('1');
    expect(el.style.getPropertyValue('--ms-ar-ratio-md')).toBe(String(16 / 9));
    expect(el.style.getPropertyValue('--ms-ar-ratio-lg')).toBe('21 / 9');
    // 仅指定的断点档挂类名(sm/xl/2xl 不挂)
    expect(el).toHaveClass('ms-aspect-ratio--bp-md', 'ms-aspect-ratio--bp-lg');
    expect(el).not.toHaveClass('ms-aspect-ratio--bp-sm');
  });

  it('objectFit / objectPosition 映射到类名与 CSS 变量', () => {
    const { container } = render(<AspectRatio objectFit="contain" objectPosition="top left" />);
    const el = container.querySelector('.ms-aspect-ratio') as HTMLElement;
    expect(el).toHaveClass('ms-aspect-ratio--fit-contain');
    expect(el.style.getPropertyValue('--ms-ar-object-pos')).toBe('top left');
  });

  it('rounded 自动触发 clip;clip=false 可覆盖', () => {
    const { container, rerender } = render(<AspectRatio rounded="lg" />);
    const el = () => container.querySelector('.ms-aspect-ratio') as HTMLElement;
    expect(el()).toHaveClass('ms-aspect-ratio--rounded-lg', 'ms-aspect-ratio--clip');
    rerender(<AspectRatio rounded="lg" clip={false} />);
    expect(el()).toHaveClass('ms-aspect-ratio--rounded-lg');
    expect(el()).not.toHaveClass('ms-aspect-ratio--clip');
  });

  it('多态 as 渲染为 figure', () => {
    const { container } = render(<AspectRatio as="figure" ratio={1} />);
    const el = container.querySelector('.ms-aspect-ratio') as HTMLElement;
    expect(el.tagName).toBe('FIGURE');
  });

  it('用户 style 与组件变量合并,且非法 ratio 回退默认', () => {
    const { container } = render(<AspectRatio ratio={Number.NaN} style={{ maxWidth: '400px' }} />);
    const el = container.querySelector('.ms-aspect-ratio') as HTMLElement;
    expect(el.style.maxWidth).toBe('400px');
    // NaN 非法 → 回退默认 16/9
    expect(el.style.getPropertyValue('--ms-ar-ratio')).toBe('16 / 9');
  });

  it('透传原生属性/事件并 compose,转发 ref 到根', () => {
    const handleClick = vi.fn();
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <AspectRatio ref={ref} id="hero" data-x="1" onClick={handleClick} className="extra" />,
    );
    const el = container.querySelector('.ms-aspect-ratio') as HTMLElement;
    expect(el).toHaveClass('extra');
    expect(el).toHaveAttribute('id', 'hero');
    expect(el).toHaveAttribute('data-x', '1');
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    fireEvent.click(el);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('asChild 把比例盒样式合并到子元素并保留子元素', () => {
    const { container } = render(
      <AspectRatio asChild ratio={1} className="extra">
        <a href="/x" data-testid="slot">
          内容
        </a>
      </AspectRatio>,
    );
    const el = container.querySelector('a[data-testid="slot"]') as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('ms-aspect-ratio', 'ms-aspect-ratio--fit-cover', 'extra');
    expect(el).toHaveAttribute('href', '/x');
    expect(el.style.getPropertyValue('--ms-ar-ratio')).toBe('1');
  });
});

describe('AspectRatio logic', () => {
  it('normalizeRatio:数字 / 比值字符串 / 纯数字串,非法返回 undefined', () => {
    expect(normalizeRatio(16 / 9)).toBe(String(16 / 9));
    expect(normalizeRatio('16/9')).toBe('16 / 9');
    expect(normalizeRatio('16 / 9')).toBe('16 / 9');
    expect(normalizeRatio('1.5')).toBe('1.5');
    expect(normalizeRatio(0)).toBeUndefined();
    expect(normalizeRatio(-2)).toBeUndefined();
    expect(normalizeRatio(Number.NaN)).toBeUndefined();
    expect(normalizeRatio('16/0')).toBeUndefined();
    expect(normalizeRatio('abc')).toBeUndefined();
    expect(normalizeRatio('')).toBeUndefined();
  });

  it('isResponsiveRatio 区分单值与断点对象', () => {
    expect(isResponsiveRatio(1)).toBe(false);
    expect(isResponsiveRatio('16/9')).toBe(false);
    expect(isResponsiveRatio(undefined)).toBe(false);
    expect(isResponsiveRatio({ base: 1 })).toBe(true);
  });

  it('resolveRatioVars:单值写 --ms-ar-ratio;对象写 base + 各档', () => {
    expect(resolveRatioVars(1)).toEqual({ '--ms-ar-ratio': '1' });
    expect(resolveRatioVars({ base: 1, md: '4/3' })).toEqual({
      '--ms-ar-ratio': '1',
      '--ms-ar-ratio-md': '4 / 3',
    });
    // 非法档被跳过
    expect(resolveRatioVars({ base: 1, md: Number.NaN })).toEqual({ '--ms-ar-ratio': '1' });
  });

  it('activeRatioBreakpoints:仅返回有合法值的非 base 断点', () => {
    expect(activeRatioBreakpoints(1)).toEqual([]);
    expect(activeRatioBreakpoints({ base: 1, md: 2, lg: 0, xl: 1.5 })).toEqual(['md', 'xl']);
  });
});
