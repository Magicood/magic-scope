// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Blockquote } from './Blockquote';
import { needsToneSlot, resolveTone } from './logic';

describe('Blockquote', () => {
  it('默认渲染 blockquote + bordered/md,兜底 primary tone 槽位', () => {
    render(<Blockquote>引文</Blockquote>);
    const el = screen.getByText('引文').closest('blockquote');
    expect(el).not.toBeNull();
    expect(el).toHaveClass(
      'ms-blockquote',
      'ms-blockquote--bordered',
      'ms-blockquote--md',
      'ms-tone-primary',
    );
  });

  it('variant / size / tone → 修饰类', () => {
    render(
      <Blockquote variant="filled" size="lg" tone="success" data-testid="bq">
        x
      </Blockquote>,
    );
    const el = screen.getByTestId('bq');
    expect(el).toHaveClass('ms-blockquote--filled', 'ms-blockquote--lg', 'ms-tone-success');
  });

  it('plain 变体无 tone 无魔法时不染 tone 槽位', () => {
    render(
      <Blockquote variant="plain" data-testid="bq">
        x
      </Blockquote>,
    );
    expect(screen.getByTestId('bq').className).not.toContain('ms-tone-');
  });

  it('cite 出处 → footer + cite 子节点;citeUrl → 原生 cite 属性', () => {
    render(
      <Blockquote cite="鲁迅" citeUrl="https://example.com" data-testid="bq">
        其实地上本没有路
      </Blockquote>,
    );
    const el = screen.getByTestId('bq');
    expect(el).toHaveClass('ms-blockquote--with-cite');
    expect(el).toHaveAttribute('cite', 'https://example.com');
    const cite = el.querySelector('cite.ms-blockquote__cite');
    expect(cite).not.toBeNull();
    expect(cite).toHaveTextContent('鲁迅');
    expect(el.querySelector('footer.ms-blockquote__footer')).not.toBeNull();
  });

  it('icon 槽优先于 quoteMark;quoteMark 字符串自定义引号', () => {
    const { rerender } = render(
      <Blockquote icon={<svg aria-hidden data-testid="ic" />} quoteMark data-testid="bq">
        x
      </Blockquote>,
    );
    const el = screen.getByTestId('bq');
    expect(el).toHaveClass('ms-blockquote--with-icon');
    expect(el.className).not.toContain('ms-blockquote--quoted'); // icon 在,不出引号
    expect(el.querySelector('.ms-blockquote__mark')).toBeNull();
    rerender(
      <Blockquote quoteMark="«" data-testid="bq">
        x
      </Blockquote>,
    );
    const mark = screen.getByTestId('bq').querySelector('.ms-blockquote__mark');
    expect(mark).toHaveTextContent('«');
  });

  it('魔法:gradient/glow 加魔法类,无显式 tone 时兜底 primary 槽位', () => {
    render(
      <Blockquote variant="plain" gradient glow="strong" data-testid="bq">
        x
      </Blockquote>,
    );
    const el = screen.getByTestId('bq');
    expect(el).toHaveClass(
      'ms-blockquote--gradient',
      'ms-blockquote--glow-strong',
      'ms-tone-primary',
    );
  });

  it('classNames 子部件覆盖类生效', () => {
    render(
      <Blockquote
        cite="出处"
        quoteMark
        classNames={{ mark: 'my-mark', content: 'my-content', cite: 'my-cite' }}
        data-testid="bq"
      >
        x
      </Blockquote>,
    );
    const el = screen.getByTestId('bq');
    expect(el.querySelector('.ms-blockquote__mark')).toHaveClass('my-mark');
    expect(el.querySelector('.ms-blockquote__content')).toHaveClass('my-content');
    expect(el.querySelector('.ms-blockquote__cite')).toHaveClass('my-cite');
  });

  it('留口:透传原生事件 + 合并 className/style', () => {
    const onClick = vi.fn();
    render(
      <Blockquote onClick={onClick} className="extra" style={{ opacity: 0.5 }} data-testid="bq">
        x
      </Blockquote>,
    );
    const el = screen.getByTestId('bq');
    expect(el).toHaveClass('ms-blockquote', 'extra');
    expect(el).toHaveStyle({ opacity: '0.5' });
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('as 多态 + asChild 把样式/citeUrl 合并到子元素', () => {
    const { rerender } = render(
      <Blockquote as="figure" data-testid="bq">
        x
      </Blockquote>,
    );
    expect(screen.getByTestId('bq').tagName).toBe('FIGURE');
    rerender(
      <Blockquote asChild tone="accent" citeUrl="https://x.test">
        <article data-testid="child">引文</article>
      </Blockquote>,
    );
    const child = screen.getByTestId('child');
    expect(child.tagName).toBe('ARTICLE');
    expect(child).toHaveClass('ms-blockquote', 'ms-tone-accent');
    expect(child).toHaveAttribute('cite', 'https://x.test');
  });

  it('logic:resolveTone / needsToneSlot 纯函数行为', () => {
    expect(resolveTone('danger', 'plain', false, 'off')).toBe('danger'); // 显式优先
    expect(resolveTone(undefined, 'bordered', false, 'off')).toBe('primary'); // 有色块兜底
    expect(resolveTone(undefined, 'plain', false, 'off')).toBeUndefined(); // 纯文字不染
    expect(resolveTone(undefined, 'plain', true, 'off')).toBe('primary'); // 魔法需槽位
    expect(needsToneSlot(false, 'soft')).toBe(true);
    expect(needsToneSlot(false, 'off')).toBe(false);
  });
});
