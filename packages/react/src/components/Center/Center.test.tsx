// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Center } from './Center';
import {
  axisToPlaceItems,
  expandResponsive,
  resolveSize,
  resolveSpace,
  responsiveVars,
  spaceToken,
} from './logic';

describe('Center', () => {
  it('默认渲染为 div,带基础类与双轴居中变量', () => {
    render(<Center data-testid="c">内容</Center>);
    const el = screen.getByTestId('c');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('ms-center');
    expect(el).toHaveTextContent('内容');
    // axis 默认 both → place-items center center,经 --ms-center-axis 注入
    expect(el.style.getPropertyValue('--ms-center-axis')).toBe('center center');
  });

  it('axis 单值切换居中轴(注入对应 place-items 变量)', () => {
    const { rerender } = render(<Center data-testid="c" axis="horizontal" />);
    expect(screen.getByTestId('c').style.getPropertyValue('--ms-center-axis')).toBe(
      'stretch center',
    );
    rerender(<Center data-testid="c" axis="vertical" />);
    expect(screen.getByTestId('c').style.getPropertyValue('--ms-center-axis')).toBe(
      'center stretch',
    );
  });

  it('inline 切到 inline-flex(加修饰类)', () => {
    render(<Center data-testid="c" inline />);
    expect(screen.getByTestId('c')).toHaveClass('ms-center--inline');
  });

  it('gap/padding 数字档映射间距 token,并挂接管类', () => {
    render(<Center data-testid="c" gap={2} padding={4} />);
    const el = screen.getByTestId('c');
    expect(el).toHaveClass('ms-center--has-gap', 'ms-center--has-pad');
    expect(el.style.getPropertyValue('--ms-center-gap')).toBe('var(--ms-space-2)');
    expect(el.style.getPropertyValue('--ms-center-pad')).toBe('var(--ms-space-4)');
  });

  it('gap=0 给无间距(0 而非 token);字符串走逃生舱原样', () => {
    const { rerender } = render(<Center data-testid="c" gap={0} />);
    expect(screen.getByTestId('c').style.getPropertyValue('--ms-center-gap')).toBe('0');
    rerender(<Center data-testid="c" gap="1.5em" />);
    expect(screen.getByTestId('c').style.getPropertyValue('--ms-center-gap')).toBe('1.5em');
  });

  it('minBlockSize:数字按 px、字符串原样,并挂接管类与高度变量', () => {
    const { rerender } = render(<Center data-testid="c" minBlockSize={320} />);
    const el = screen.getByTestId('c');
    expect(el).toHaveClass('ms-center--has-minh');
    expect(el.style.getPropertyValue('--ms-center-minh')).toBe('320px');
    rerender(<Center data-testid="c" minBlockSize="100dvh" />);
    expect(screen.getByTestId('c').style.getPropertyValue('--ms-center-minh')).toBe('100dvh');
  });

  it('断点对象:base 与各断点档分别注入带后缀的变量', () => {
    render(
      <Center
        data-testid="c"
        axis={{ base: 'vertical', md: 'both' }}
        gap={{ base: 2, lg: 6 }}
        minBlockSize={{ base: '50vh', md: '100dvh' }}
      />,
    );
    const el = screen.getByTestId('c');
    expect(el.style.getPropertyValue('--ms-center-axis')).toBe('center stretch');
    expect(el.style.getPropertyValue('--ms-center-axis-md')).toBe('center center');
    expect(el.style.getPropertyValue('--ms-center-gap')).toBe('var(--ms-space-2)');
    expect(el.style.getPropertyValue('--ms-center-gap-lg')).toBe('var(--ms-space-6)');
    expect(el.style.getPropertyValue('--ms-center-minh')).toBe('50vh');
    expect(el.style.getPropertyValue('--ms-center-minh-md')).toBe('100dvh');
  });

  it('多态 as 渲染为指定语义标签', () => {
    render(
      <Center as="section" data-testid="c">
        区块
      </Center>,
    );
    expect(screen.getByTestId('c').tagName).toBe('SECTION');
  });

  it('asChild 把居中样式与变量合并到子元素,不额外包一层', () => {
    render(
      <Center asChild axis="vertical" gap={3}>
        <a href="https://example.com" data-testid="link">
          链接居中盒
        </a>
      </Center>,
    );
    const link = screen.getByTestId('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('ms-center', 'ms-center--has-gap');
    expect(link.style.getPropertyValue('--ms-center-axis')).toBe('center stretch');
    expect(link.style.getPropertyValue('--ms-center-gap')).toBe('var(--ms-space-3)');
  });

  it('合并自定义 className/style 并透传原生属性与事件', () => {
    const onClick = vi.fn();
    render(
      <Center
        data-testid="c"
        className="extra"
        style={{ background: 'red' }}
        aria-label="居中区"
        onClick={onClick}
      />,
    );
    const el = screen.getByLabelText('居中区');
    expect(el).toHaveClass('ms-center', 'extra');
    expect(el).toHaveAttribute('data-testid', 'c');
    expect(el.style.background).toBe('red');
    // 用户 style 与核心变量并存
    expect(el.style.getPropertyValue('--ms-center-axis')).toBe('center center');
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('将 ref 转发到根元素', () => {
    const ref = vi.fn();
    render(<Center ref={ref} />);
    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref.mock.calls[0]?.[0]).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Center logic(纯逻辑)', () => {
  it('axisToPlaceItems 三态映射', () => {
    expect(axisToPlaceItems('both')).toBe('center center');
    expect(axisToPlaceItems('horizontal')).toBe('stretch center');
    expect(axisToPlaceItems('vertical')).toBe('center stretch');
  });

  it('spaceToken:0 给 0,其余引用 --ms-space-N', () => {
    expect(spaceToken(0)).toBe('0');
    expect(spaceToken(4)).toBe('var(--ms-space-4)');
  });

  it('resolveSpace:数字走 token、字符串逃生舱;resolveSize:数字按 px、字符串原样', () => {
    expect(resolveSpace(2)).toBe('var(--ms-space-2)');
    expect(resolveSpace('2rem')).toBe('2rem');
    expect(resolveSize(320)).toBe('320px');
    expect(resolveSize('100dvh')).toBe('100dvh');
  });

  it('expandResponsive:单值规整为 base 一档', () => {
    expect(expandResponsive('both')).toEqual([['base', 'both']]);
    expect(expandResponsive(undefined)).toEqual([]);
  });

  it('expandResponsive:断点对象按 base→sm→…→2xl 顺序,跳过未给档', () => {
    expect(expandResponsive({ base: 1, md: 2, '2xl': 8 })).toEqual([
      ['base', 1],
      ['md', 2],
      ['2xl', 8],
    ]);
    // 无 base 也可,只产出给定档
    expect(expandResponsive({ lg: 4 })).toEqual([['lg', 4]]);
  });

  it('responsiveVars:base 无后缀、断点档带后缀,值经 toCss 转换', () => {
    expect(responsiveVars('gap', { base: 2, md: 4 }, resolveSpace)).toEqual({
      '--ms-center-gap': 'var(--ms-space-2)',
      '--ms-center-gap-md': 'var(--ms-space-4)',
    });
    expect(responsiveVars('minh', 320, resolveSize)).toEqual({ '--ms-center-minh': '320px' });
    expect(responsiveVars('axis', undefined, axisToPlaceItems)).toEqual({});
  });
});
