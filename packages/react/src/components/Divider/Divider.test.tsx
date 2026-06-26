// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Divider } from './Divider';

describe('Divider', () => {
  it('无内容:渲染 <hr> 并带朝向 / 默认 tone 类与 aria-orientation', () => {
    render(<Divider data-testid="d" />);
    const el = screen.getByTestId('d');
    expect(el.tagName).toBe('HR');
    expect(el).toHaveClass('ms-divider', 'ms-divider--horizontal', 'ms-tone-neutral');
    expect(el).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('vertical 朝向反映到类名与 aria-orientation', () => {
    render(<Divider orientation="vertical" data-testid="d" />);
    const el = screen.getByTestId('d');
    expect(el).toHaveClass('ms-divider--vertical');
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('有内容:升级为承载可读文字的 <div>,带 labeled 类(分隔语义由可见文字承载)', () => {
    render(
      <Divider tone="accent" data-testid="d">
        章节
      </Divider>,
    );
    const el = screen.getByTestId('d');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('ms-divider--labeled', 'ms-tone-accent');
    expect(el).toHaveTextContent('章节');
    // 不套 splitter 语义的 separator role(避免被解读为可调节控件)
    expect(el).not.toHaveAttribute('role');
    // 两侧装饰线对辅助技术隐藏
    expect(el.querySelectorAll('.ms-divider__line[aria-hidden="true"]')).toHaveLength(2);
  });

  it('label 别名等价 children;textAlign / variant 反映到类名', () => {
    render(<Divider label="OR" textAlign="start" variant="dashed" data-testid="d" />);
    const el = screen.getByTestId('d');
    expect(el).toHaveTextContent('OR');
    expect(el).toHaveClass('ms-divider--align-start', 'ms-divider--dashed', 'ms-divider--labeled');
  });

  it('thickness / spacing 关键字解析为 CSS 自定义属性', () => {
    render(<Divider thickness="bold" spacing="md" data-testid="d" />);
    const el = screen.getByTestId('d');
    expect(el.style.getPropertyValue('--ms-divider-thickness')).toBe('3px');
    expect(el.style.getPropertyValue('--ms-divider-spacing')).toContain('var(--ms-space-4)');
  });

  it('thickness / spacing 自定义长度原样透传', () => {
    render(<Divider thickness="0.5rem" spacing="2ch" data-testid="d" />);
    const el = screen.getByTestId('d');
    expect(el.style.getPropertyValue('--ms-divider-thickness')).toBe('0.5rem');
    expect(el.style.getPropertyValue('--ms-divider-spacing')).toBe('2ch');
  });

  it('...rest 透传原生属性与事件到根;ref 指向根元素', () => {
    const ref = createRef<HTMLHRElement & HTMLDivElement>();
    render(<Divider ref={ref} id="sep-1" data-foo="bar" data-testid="d" />);
    const el = screen.getByTestId('d');
    expect(el).toHaveAttribute('id', 'sep-1');
    expect(el).toHaveAttribute('data-foo', 'bar');
    expect(ref.current).toBe(el);
  });

  it('保留用户 className 与 style,不覆盖', () => {
    render(<Divider className="custom" style={{ opacity: 0.5 }} data-testid="d" />);
    const el = screen.getByTestId('d');
    expect(el).toHaveClass('ms-divider', 'custom');
    expect(el.style.opacity).toBe('0.5');
    // 自定义属性仍注入
    expect(el.style.getPropertyValue('--ms-divider-thickness')).toBe('1px');
  });
});
