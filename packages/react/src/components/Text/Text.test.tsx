// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Text } from './Text';

describe('Text', () => {
  it('默认渲染 span + ms-text', () => {
    render(<Text>hi</Text>);
    const el = screen.getByText('hi');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('ms-text');
  });

  it('as 多态渲染标签', () => {
    render(<Text as="p">para</Text>);
    expect(screen.getByText('para').tagName).toBe('P');
  });

  it('枚举属性 → 修饰类', () => {
    render(
      <Text
        size="lg"
        family="mono"
        weight="semibold"
        align="center"
        leading="snug"
        tracking="wide"
        transform="uppercase"
        numeric="tabular"
        truncate
      >
        x
      </Text>,
    );
    const el = screen.getByText('x');
    expect(el).toHaveClass(
      'ms-text--size-lg',
      'ms-text--family-mono',
      'ms-text--weight-semibold',
      'ms-text--align-center',
      'ms-text--leading-snug',
      'ms-text--tracking-wide',
      'ms-text--transform-uppercase',
      'ms-text--numeric-tabular',
      'ms-text--truncate',
    );
  });

  it('tone → ms-tone-* + toned', () => {
    render(<Text tone="success">x</Text>);
    expect(screen.getByText('x')).toHaveClass('ms-tone-success', 'ms-text--toned');
  });

  it('数值字重 → inline --ms-text-weight(不出类);color → inline', () => {
    render(
      <Text weight={650} color="rebeccapurple">
        x
      </Text>,
    );
    const el = screen.getByText('x');
    expect(el.style.getPropertyValue('--ms-text-weight')).toBe('650');
    expect(el.style.color).toBe('rebeccapurple');
    expect(el.className).not.toContain('ms-text--weight-650');
  });

  it('lineClamp → clamp 类 + inline 变量', () => {
    render(<Text lineClamp={3}>x</Text>);
    const el = screen.getByText('x');
    expect(el).toHaveClass('ms-text--clamp');
    expect(el.style.getPropertyValue('--ms-line-clamp')).toBe('3');
  });

  it('魔法效果无显式 tone 时兜底 primary 槽位(但不染 color)', () => {
    render(
      <Text gradient glow>
        x
      </Text>,
    );
    const el = screen.getByText('x');
    expect(el).toHaveClass('ms-text--gradient', 'ms-text--glow', 'ms-tone-primary');
    expect(el.className).not.toContain('ms-text--toned');
  });

  it('留口:透传原生事件 + 合并 className/style', () => {
    const onClick = vi.fn();
    render(
      <Text onClick={onClick} className="extra" style={{ opacity: 0.5 }} data-testid="t">
        x
      </Text>,
    );
    const el = screen.getByTestId('t');
    expect(el).toHaveClass('ms-text', 'extra');
    expect(el).toHaveStyle({ opacity: '0.5' });
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('asChild 把样式合并到子元素', () => {
    render(
      <Text asChild size="lg" tone="accent">
        <a href="/x">查看文档</a>
      </Text>,
    );
    const link = screen.getByRole('link', { name: '查看文档' });
    expect(link).toHaveClass('ms-text', 'ms-text--size-lg', 'ms-tone-accent');
    expect(link).toHaveAttribute('href', '/x');
  });

  it('animate 动效类 + shimmer/pulse 兜底 tone 槽位', () => {
    const { rerender } = render(<Text animate="reveal">x</Text>);
    expect(screen.getByText('x')).toHaveClass('ms-text--anim-reveal');
    expect(screen.getByText('x')).not.toHaveClass('ms-tone-primary'); // reveal 不需槽位
    rerender(<Text animate="shimmer">x</Text>);
    expect(screen.getByText('x')).toHaveClass('ms-text--anim-shimmer', 'ms-tone-primary'); // 需槽位兜底
  });

  it('writingMode=vertical → 竖排类', () => {
    render(<Text writingMode="vertical">竖</Text>);
    expect(screen.getByText('竖')).toHaveClass('ms-text--vertical');
  });
});
