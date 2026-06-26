// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Kbd } from './Kbd';
import { ariaLabelForTokens, labelForKey, normalizeKey, parseKbd, splitKeys } from './logic';

describe('Kbd logic(纯函数)', () => {
  it('splitKeys:字符串按 + 拆、数组原样、空段过滤', () => {
    expect(splitKeys('cmd+shift+k')).toEqual(['cmd', 'shift', 'k']);
    expect(splitKeys(['cmd', 'k'])).toEqual(['cmd', 'k']);
    expect(splitKeys(' cmd + k ')).toEqual(['cmd', 'k']);
  });

  it('normalizeKey:别名收敛(command/option/meta…)', () => {
    expect(normalizeKey('Command')).toBe('cmd');
    expect(normalizeKey('META')).toBe('cmd');
    expect(normalizeKey('option')).toBe('alt');
    expect(normalizeKey('Escape')).toBe('esc');
    expect(normalizeKey('k')).toBe('k');
  });

  it('labelForKey:mac 用符号、win 用文本、单字符大写', () => {
    expect(labelForKey('cmd', 'mac')).toBe('⌘');
    expect(labelForKey('ctrl', 'mac')).toBe('⌃');
    expect(labelForKey('alt', 'mac')).toBe('⌥');
    expect(labelForKey('shift', 'mac')).toBe('⇧');
    expect(labelForKey('enter', 'mac')).toBe('⏎');
    expect(labelForKey('esc', 'mac')).toBe('⎋');
    expect(labelForKey('del', 'mac')).toBe('⌫');
    expect(labelForKey('cmd', 'win')).toBe('Ctrl');
    expect(labelForKey('esc', 'win')).toBe('Esc');
    expect(labelForKey('k', 'win')).toBe('K');
  });

  it('parseKbd:产出带 label/modifier 的 token', () => {
    const tokens = parseKbd('cmd+k', 'mac');
    expect(tokens).toEqual([
      { key: 'cmd', label: '⌘', modifier: true },
      { key: 'k', label: 'K', modifier: false },
    ]);
  });

  it('ariaLabelForTokens:用全词,屏幕阅读器友好', () => {
    expect(ariaLabelForTokens(parseKbd('cmd+shift+k', 'mac'))).toBe('Command Shift K');
  });
});

describe('Kbd 组件', () => {
  it('向后兼容:无 keys 时把 children 当单键帽渲染', () => {
    render(<Kbd>Esc</Kbd>);
    const el = screen.getByText('Esc');
    expect(el.tagName.toLowerCase()).toBe('kbd');
    expect(el).toHaveClass('ms-kbd', 'ms-kbd--md', 'ms-tone-neutral');
    // 旧默认 size 仍是 md、默认 tone neutral,且不带 combo
    expect(el).not.toHaveClass('ms-kbd--combo');
  });

  it('keys=mac 平台:拆多键帽并符号化', () => {
    const { container } = render(<Kbd keys="cmd+k" platform="mac" />);
    const root = container.querySelector('.ms-kbd');
    expect(root).toHaveClass('ms-kbd--combo');
    const caps = container.querySelectorAll('.ms-kbd__key');
    expect(caps).toHaveLength(2);
    expect(caps[0]).toHaveTextContent('⌘');
    expect(caps[0]).toHaveAttribute('data-modifier', 'true');
    expect(caps[1]).toHaveTextContent('K');
    // aria-label 兜底为全词可读串
    expect(root).toHaveAttribute('aria-label', 'Command K');
  });

  it('keys=win 平台:走文本映射', () => {
    const { container } = render(<Kbd keys={['ctrl', 'c']} platform="win" />);
    const caps = container.querySelectorAll('.ms-kbd__key');
    expect(caps[0]).toHaveTextContent('Ctrl');
    expect(caps[1]).toHaveTextContent('C');
  });

  it('tone 落到根 ms-tone-*(默认 neutral),size lg 出 lg 类', () => {
    const { container, rerender } = render(<Kbd keys="cmd+s" platform="mac" />);
    expect(container.querySelector('.ms-kbd')).toHaveClass('ms-tone-neutral');
    rerender(<Kbd keys="cmd+s" platform="mac" tone="danger" size="lg" />);
    const root = container.querySelector('.ms-kbd');
    expect(root).toHaveClass('ms-tone-danger', 'ms-kbd--lg');
  });

  it('separator:在键帽间渲染(首键帽前不渲染)', () => {
    const { container } = render(<Kbd keys="cmd+k" platform="mac" separator="+" />);
    const seps = container.querySelectorAll('.ms-kbd__sep');
    // 两键帽 → 一个分隔符(第二键帽前)
    expect(seps).toHaveLength(1);
    expect(seps[0]).toHaveTextContent('+');
    expect(seps[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('显式 aria-label 优先于自动兜底;rest 透传到根', () => {
    const { container } = render(
      <Kbd keys="cmd+k" platform="mac" aria-label="打开命令面板" data-testid="kbd-root" />,
    );
    const root = container.querySelector('.ms-kbd');
    expect(root).toHaveAttribute('aria-label', '打开命令面板');
    expect(root).toHaveAttribute('data-testid', 'kbd-root');
  });

  it('classNames 定制子部件 className', () => {
    const { container } = render(
      <Kbd
        keys="cmd+k"
        platform="mac"
        separator="+"
        classNames={{ key: 'x-key', separator: 'x-sep' }}
      />,
    );
    expect(container.querySelector('.ms-kbd__key')).toHaveClass('x-key');
    expect(container.querySelector('.ms-kbd__sep')).toHaveClass('x-sep');
  });
});
