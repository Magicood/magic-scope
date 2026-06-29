// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Code } from './Code';
import { codeTextFromChildren } from './logic';

describe('Code', () => {
  it('默认渲染行内 <code> + ms-code--inline', () => {
    render(<Code>npm i</Code>);
    const el = screen.getByText('npm i');
    expect(el.tagName).toBe('CODE');
    expect(el).toHaveClass('ms-code', 'ms-code--inline');
    expect(el).not.toHaveClass('ms-code--block');
  });

  it('block → <pre><code> + 块级类', () => {
    render(<Code block>const x = 1;</Code>);
    const code = screen.getByText('const x = 1;');
    expect(code.tagName).toBe('CODE');
    expect(code).toHaveClass('ms-code__code');
    const pre = code.closest('pre');
    expect(pre).not.toBeNull();
    expect(pre).toHaveClass('ms-code', 'ms-code--block');
  });

  it('variant / tone / size / mono → 修饰类', () => {
    render(
      <Code variant="outline" tone="accent" size="lg">
        x
      </Code>,
    );
    const el = screen.getByText('x');
    expect(el).toHaveClass(
      'ms-code--outline',
      'ms-tone-accent',
      'ms-code--lg',
      'ms-code--mono', // mono 默认 true
    );
  });

  it('mono=false 去等宽类;tabSize → inline 变量', () => {
    render(
      <Code block mono={false} tabSize={4}>
        x
      </Code>,
    );
    const pre = screen.getByText('x').closest('pre');
    expect(pre).not.toHaveClass('ms-code--mono');
    expect(pre?.style.getPropertyValue('--ms-code-tab-size')).toBe('4');
  });

  it('glow → 发光类;无显式 tone 默认 neutral 槽位', () => {
    render(<Code glow="strong">x</Code>);
    const el = screen.getByText('x');
    expect(el).toHaveClass('ms-code--glow', 'ms-code--glow-strong', 'ms-tone-neutral');
  });

  describe('copyable(仅块级)', () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('块级 copyable 渲染复制按钮;点击写剪贴板并触发 onCopy + 切换已复制', async () => {
      const onCopy = vi.fn();
      render(
        <Code block copyable onCopy={onCopy}>
          echo hi
        </Code>,
      );
      const btn = screen.getByRole('button', { name: '复制' });
      fireEvent.click(btn);
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('echo hi');
      });
      expect(onCopy).toHaveBeenCalledWith('echo hi', true);
      // 已复制后按钮 label 切换并打上 data-copied
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '已复制' })).toHaveAttribute('data-copied');
      });
    });

    it('copyText 覆盖从 children 抽取的内容', async () => {
      render(
        <Code block copyable copyText="OVERRIDE">
          原始代码
        </Code>,
      );
      fireEvent.click(screen.getByRole('button', { name: '复制' }));
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('OVERRIDE');
      });
    });

    it('行内不渲染复制按钮(copyable 仅块级生效)', () => {
      render(<Code copyable>x</Code>);
      expect(screen.queryByRole('button')).toBeNull();
    });
  });

  it('asChild 把行内样式合并到子元素', () => {
    render(
      <Code asChild tone="info" size="sm">
        <a href="/x">查看</a>
      </Code>,
    );
    const link = screen.getByRole('link', { name: '查看' });
    expect(link).toHaveClass('ms-code', 'ms-tone-info', 'ms-code--sm');
    expect(link).toHaveAttribute('href', '/x');
  });

  it('留口:透传原生属性/事件 + 合并 className/style', () => {
    const onClick = vi.fn();
    render(
      <Code onClick={onClick} className="extra" style={{ opacity: 0.5 }} data-testid="c">
        x
      </Code>,
    );
    const el = screen.getByTestId('c');
    expect(el).toHaveClass('ms-code', 'extra');
    expect(el).toHaveStyle({ opacity: '0.5' });
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('logic: codeTextFromChildren 递归抽取纯文本', () => {
    expect(codeTextFromChildren('abc')).toBe('abc');
    expect(codeTextFromChildren(['a', 1, false, 'b'])).toBe('a1b');
    expect(codeTextFromChildren({ props: { children: ['x', { props: { children: 'y' } }] } })).toBe(
      'xy',
    );
  });
});
