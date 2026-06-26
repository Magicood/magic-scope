// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Container } from './Container';
import { resolveResponsive, resolveSize, resolveSpace } from './logic';

describe('Container', () => {
  it('默认:渲染 <div>,带 ms-container 类,max-inline-size 注入为 lg(64rem),无 padding 时走流式兜底类', () => {
    render(<Container data-testid="c">内容</Container>);
    const el = screen.getByTestId('c');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('ms-container', 'ms-container--fluid-pad');
    expect(el.style.getPropertyValue('--ms-container-max')).toBe('64rem');
    expect(el).toHaveTextContent('内容');
    // 未传 padding 时不注入 --ms-container-px(留给 CSS clamp 兜底)
    expect(el.style.getPropertyValue('--ms-container-px')).toBe('');
  });

  it('size 关键字解析为对应断点宽度;自定义长度原样透传', () => {
    const { rerender } = render(<Container size="sm" data-testid="c" />);
    expect(screen.getByTestId('c').style.getPropertyValue('--ms-container-max')).toBe('30rem');
    rerender(<Container size="72ch" data-testid="c" />);
    expect(screen.getByTestId('c').style.getPropertyValue('--ms-container-max')).toBe('72ch');
  });

  it('fluid / size="full":max 解析为 none 并带 full 类(fluid 优先于 size)', () => {
    const { rerender } = render(<Container fluid size="sm" data-testid="c" />);
    let el = screen.getByTestId('c');
    expect(el).toHaveClass('ms-container--full');
    expect(el.style.getPropertyValue('--ms-container-max')).toBe('none');
    rerender(<Container size="full" data-testid="c" />);
    el = screen.getByTestId('c');
    expect(el).toHaveClass('ms-container--full');
    expect(el.style.getPropertyValue('--ms-container-max')).toBe('none');
  });

  it('padding 单值 token:注入基础 --ms-container-px(随密度缩放),去掉流式兜底类', () => {
    render(<Container padding={6} data-testid="c" />);
    const el = screen.getByTestId('c');
    expect(el).not.toHaveClass('ms-container--fluid-pad');
    expect(el.style.getPropertyValue('--ms-container-px')).toBe(
      'calc(var(--ms-space-6) * var(--ms-density-scale, 1))',
    );
  });

  it('padding 断点对象:base 写基础变量,其余断点写断点专属变量;paddingBlock 同理', () => {
    render(
      <Container padding={{ base: 2, md: 4, lg: 8 }} paddingBlock={{ md: 6 }} data-testid="c" />,
    );
    const el = screen.getByTestId('c');
    expect(el.style.getPropertyValue('--ms-container-px')).toContain('var(--ms-space-2)');
    expect(el.style.getPropertyValue('--ms-container-px-md')).toContain('var(--ms-space-4)');
    expect(el.style.getPropertyValue('--ms-container-px-lg')).toContain('var(--ms-space-8)');
    // paddingBlock 缺 base:基础变量回退默认 0,md 档注入专属变量
    expect(el.style.getPropertyValue('--ms-container-py')).toBe('0');
    expect(el.style.getPropertyValue('--ms-container-py-md')).toContain('var(--ms-space-6)');
  });

  it('padding 数字 0 与自定义 CSS 长度:0 直出 0,字符串原样透传', () => {
    render(<Container padding={0} paddingBlock="2rem" data-testid="c" />);
    const el = screen.getByTestId('c');
    expect(el.style.getPropertyValue('--ms-container-px')).toBe('0');
    expect(el.style.getPropertyValue('--ms-container-py')).toBe('2rem');
  });

  it('centered 带垂直居中类;as 多态渲染为指定语义标签', () => {
    render(
      <Container as="section" centered data-testid="c">
        x
      </Container>,
    );
    const el = screen.getByTestId('c');
    expect(el.tagName).toBe('SECTION');
    expect(el).toHaveClass('ms-container--centered');
  });

  it('asChild:把样式/props 合并到唯一子元素(Slot),不额外包裹', () => {
    render(
      <Container asChild size="md" className="extra" data-testid="c">
        <main id="page">主区</main>
      </Container>,
    );
    const el = screen.getByTestId('c');
    expect(el.tagName).toBe('MAIN');
    expect(el).toHaveAttribute('id', 'page');
    expect(el).toHaveClass('ms-container', 'extra');
    expect(el.style.getPropertyValue('--ms-container-max')).toBe('48rem');
  });

  it('...rest 透传原生属性/事件到根;ref 指向根元素;用户 style 与 className 不被覆盖', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Container
        ref={ref}
        id="wrap"
        data-foo="bar"
        className="custom"
        style={{ opacity: 0.5 }}
        data-testid="c"
      />,
    );
    const el = screen.getByTestId('c');
    expect(el).toHaveAttribute('id', 'wrap');
    expect(el).toHaveAttribute('data-foo', 'bar');
    expect(el).toHaveClass('ms-container', 'custom');
    expect(el.style.opacity).toBe('0.5');
    // 用户 style 后置合并,核心 CSS 变量仍注入
    expect(el.style.getPropertyValue('--ms-container-max')).toBe('64rem');
    expect(ref.current).toBe(el);
  });
});

describe('Container/logic', () => {
  it('resolveSize:关键字查表,full→none,自定义长度原样', () => {
    expect(resolveSize('lg')).toBe('64rem');
    expect(resolveSize('full')).toBe('none');
    expect(resolveSize('900px')).toBe('900px');
  });

  it('resolveSpace:数字映射 space 变量(0 直出),字符串原样', () => {
    expect(resolveSpace(0)).toBe('0');
    expect(resolveSpace(4)).toBe('calc(var(--ms-space-4) * var(--ms-density-scale, 1))');
    expect(resolveSpace('clamp(1rem, 2vw, 2rem)')).toBe('clamp(1rem, 2vw, 2rem)');
  });

  it('resolveResponsive:单值只写基础变量;undefined 用 fallback;断点对象拆分专属变量且 base 缺省回退 fallback', () => {
    expect(resolveResponsive(4, '--px', resolveSpace, 0)).toEqual({
      '--px': 'calc(var(--ms-space-4) * var(--ms-density-scale, 1))',
    });
    expect(resolveResponsive(undefined, '--px', resolveSpace, 0)).toEqual({ '--px': '0' });
    const out = resolveResponsive({ md: 6 }, '--px', resolveSpace, 0);
    expect(out['--px']).toBe('0'); // base 缺省 → fallback 0
    expect(out['--px-md']).toBe('calc(var(--ms-space-6) * var(--ms-density-scale, 1))');
  });
});
