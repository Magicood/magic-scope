// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Flex } from './Flex';
import {
  buildFlexVars,
  type GapValue,
  isResponsiveObject,
  resolveGap,
  responsiveVars,
} from './logic';

describe('Flex logic', () => {
  it('resolveGap:数字档映射 --ms-space-*,越界数字按 px,字符串原样', () => {
    expect(resolveGap(4)).toBe('var(--ms-space-4)');
    expect(resolveGap(0)).toBe('var(--ms-space-0)');
    expect(resolveGap(7 as GapValue)).toBe('7px'); // 7 不在 token 刻度内,走 px 兜底分支
    expect(resolveGap('2rem')).toBe('2rem');
  });

  it('isResponsiveObject:对象为真,字符串/数字为假', () => {
    expect(isResponsiveObject({ base: 'row', md: 'column' })).toBe(true);
    expect(isResponsiveObject('row')).toBe(false);
    expect(isResponsiveObject(4)).toBe(false);
    expect(isResponsiveObject(undefined)).toBe(false);
  });

  it('responsiveVars:单值写无后缀,断点对象写 base + 带后缀变量', () => {
    expect(responsiveVars('ms-flex-direction', 'column')).toEqual({
      '--ms-flex-direction': 'column',
    });
    expect(responsiveVars('ms-flex-gap', { base: 2, md: 4, lg: 6 }, resolveGap)).toEqual({
      '--ms-flex-gap': 'var(--ms-space-2)',
      '--ms-flex-gap-md': 'var(--ms-space-4)',
      '--ms-flex-gap-lg': 'var(--ms-space-6)',
    });
    // 无 base 键时只产出带后缀变量
    expect(responsiveVars('ms-flex-direction', { md: 'column' })).toEqual({
      '--ms-flex-direction-md': 'column',
    });
  });

  it('buildFlexVars:align/justify/wrap 转 CSS 关键字', () => {
    const vars = buildFlexVars({
      align: 'center',
      justify: 'between',
      wrap: true,
    });
    expect(vars['--ms-flex-align']).toBe('center');
    expect(vars['--ms-flex-justify']).toBe('space-between');
    expect(vars['--ms-flex-wrap']).toBe('wrap');
  });
});

describe('Flex', () => {
  it('默认渲染 div.ms-flex,单值属性注入对应 CSS 变量', () => {
    const { container } = render(
      <Flex direction="column" align="center" justify="end" gap={4}>
        <span>子</span>
      </Flex>,
    );
    const root = container.querySelector('.ms-flex') as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root.style.getPropertyValue('--ms-flex-direction')).toBe('column');
    expect(root.style.getPropertyValue('--ms-flex-align')).toBe('center');
    expect(root.style.getPropertyValue('--ms-flex-justify')).toBe('flex-end');
    expect(root.style.getPropertyValue('--ms-flex-gap')).toBe('var(--ms-space-4)');
    expect(root.textContent).toBe('子');
  });

  it('inline 切 inline-flex 修饰类', () => {
    const { container } = render(<Flex inline>x</Flex>);
    expect(container.querySelector('.ms-flex')).toHaveClass('ms-flex--inline');
  });

  it('断点对象 → base 写无后缀 + 各断点写带后缀变量', () => {
    const { container } = render(
      <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 2, lg: 6 }}>
        x
      </Flex>,
    );
    const root = container.querySelector('.ms-flex') as HTMLElement;
    expect(root.style.getPropertyValue('--ms-flex-direction')).toBe('column');
    expect(root.style.getPropertyValue('--ms-flex-direction-md')).toBe('row');
    expect(root.style.getPropertyValue('--ms-flex-gap')).toBe('var(--ms-space-2)');
    expect(root.style.getPropertyValue('--ms-flex-gap-lg')).toBe('var(--ms-space-6)');
  });

  it('多态 as 渲染指定标签 + forwardRef 到根', () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <Flex as="section" ref={ref} aria-label="区块">
        x
      </Flex>,
    );
    const root = container.querySelector('.ms-flex') as HTMLElement;
    expect(root.tagName).toBe('SECTION');
    expect(root).toHaveAttribute('aria-label', '区块');
    expect(ref.current).toBe(root);
  });

  it('留口:透传原生事件 + 合并 className,用户 style 与布局变量共存', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Flex onClick={onClick} className="extra" style={{ opacity: 0.5 }} gap={2} data-testid="fx">
        x
      </Flex>,
    );
    const root = screen.getByTestId('fx');
    expect(root).toHaveClass('ms-flex', 'extra');
    expect(root).toHaveStyle({ opacity: '0.5' });
    expect(
      (container.querySelector('.ms-flex') as HTMLElement).style.getPropertyValue('--ms-flex-gap'),
    ).toBe('var(--ms-space-2)');
    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('asChild 把 flex 容器样式与变量合并到子元素(根)', () => {
    const { container } = render(
      <Flex asChild direction="column" gap={4}>
        <nav aria-label="导航">内容</nav>
      </Flex>,
    );
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav).toHaveClass('ms-flex');
    expect(nav).toHaveAttribute('aria-label', '导航');
    expect(nav.style.getPropertyValue('--ms-flex-direction')).toBe('column');
    expect(nav.style.getPropertyValue('--ms-flex-gap')).toBe('var(--ms-space-4)');
  });

  it('Flex.Item:grow/shrink/basis/align/order 注入 item 变量', () => {
    const { container } = render(
      <Flex>
        <Flex.Item grow basis="20%" align="end" order={2}>
          项
        </Flex.Item>
      </Flex>,
    );
    const item = container.querySelector('.ms-flex-item') as HTMLElement;
    expect(item.style.getPropertyValue('--ms-flex-item-grow')).toBe('1');
    expect(item.style.getPropertyValue('--ms-flex-item-basis')).toBe('20%');
    expect(item.style.getPropertyValue('--ms-flex-item-align')).toBe('flex-end');
    expect(item.style.getPropertyValue('--ms-flex-item-order')).toBe('2');
  });
});
