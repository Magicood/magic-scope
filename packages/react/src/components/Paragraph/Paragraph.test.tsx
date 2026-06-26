// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveCopyable, resolveEllipsis } from './logic';
import { Paragraph } from './Paragraph';

describe('Paragraph', () => {
  it('默认渲染 p + ms-paragraph', () => {
    render(<Paragraph>正文</Paragraph>);
    const el = screen.getByText('正文');
    // 文本在 __content span 内,根是 p
    const root = el.closest('p');
    expect(root).not.toBeNull();
    expect(root).toHaveClass('ms-paragraph');
    expect(el).toHaveClass('ms-paragraph__content');
  });

  it('排版档 → 修饰类', () => {
    render(
      <Paragraph size="lg" leading="relaxed" align="justify" dimmed data-testid="p">
        x
      </Paragraph>,
    );
    const root = screen.getByTestId('p');
    expect(root).toHaveClass(
      'ms-paragraph--size-lg',
      'ms-paragraph--leading-relaxed',
      'ms-paragraph--align-justify',
      'ms-paragraph--dimmed',
    );
  });

  it('tone → ms-tone-* + toned', () => {
    render(
      <Paragraph tone="success" data-testid="p">
        x
      </Paragraph>,
    );
    expect(screen.getByTestId('p')).toHaveClass('ms-tone-success', 'ms-paragraph--toned');
  });

  it('ellipsis 对象 → content clamp 类 + inline --ms-line-clamp', () => {
    render(<Paragraph ellipsis={{ rows: 3 }}>长正文</Paragraph>);
    const root = screen.getByText('长正文').closest('p') as HTMLElement;
    const content = screen.getByText('长正文');
    expect(content).toHaveClass('ms-paragraph__content--clamp');
    expect(root.style.getPropertyValue('--ms-line-clamp')).toBe('3');
  });

  it('expandable:展开/收起切换文案 + aria-expanded + onExpandChange', () => {
    const onExpandChange = vi.fn();
    render(
      <Paragraph ellipsis={{ rows: 2, expandable: true }} onExpandChange={onExpandChange}>
        很长的正文
      </Paragraph>,
    );
    const content = screen.getByText('很长的正文');
    // 初始:截断,按钮显示「展开」
    expect(content).toHaveClass('ms-paragraph__content--clamp');
    const toggle = screen.getByRole('button', { name: '展开' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    // 展开后:取消 clamp,按钮变「收起」,回调收到 true
    expect(content).not.toHaveClass('ms-paragraph__content--clamp');
    expect(screen.getByRole('button', { name: '收起' })).toHaveAttribute('aria-expanded', 'true');
    expect(onExpandChange).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole('button', { name: '收起' }));
    expect(onExpandChange).toHaveBeenLastCalledWith(false);
  });

  it('copyable:点击复制写入剪贴板 + onCopy 回调 + copied 态(glow 一闪)', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const onCopy = vi.fn();
    render(<Paragraph copyable={{ text: '要复制的内容', onCopy }}>显示文本</Paragraph>);

    const btn = screen.getByRole('button', { name: '复制' });
    fireEvent.click(btn);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('要复制的内容'));
    expect(onCopy).toHaveBeenCalledWith('要复制的内容');
    // 复制成功 → copied 态(切到「已复制」label + 闪动类)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '已复制' })).toHaveClass(
        'ms-paragraph__copy--copied',
      ),
    );
    vi.unstubAllGlobals();
  });

  it('copyable=true:无显式文本时复制段落自身可见文本,且兜底 primary tone 槽位', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(
      <Paragraph copyable data-testid="p">
        自身文本
      </Paragraph>,
    );
    // copyable 需 glow 槽位 → 兜底 primary
    expect(screen.getByTestId('p')).toHaveClass('ms-tone-primary');
    fireEvent.click(screen.getByRole('button', { name: '复制' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('自身文本'));
    vi.unstubAllGlobals();
  });

  it('留口:透传原生属性/事件 + 合并 className/style', () => {
    const onClick = vi.fn();
    render(
      <Paragraph
        onClick={onClick}
        className="extra"
        style={{ opacity: 0.5 }}
        lang="zh"
        data-testid="p"
      >
        x
      </Paragraph>,
    );
    const root = screen.getByTestId('p');
    expect(root).toHaveClass('ms-paragraph', 'extra');
    expect(root).toHaveStyle({ opacity: '0.5' });
    expect(root).toHaveAttribute('lang', 'zh');
    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('asChild 把样式合并到子元素(不挂复制/展开按钮)', () => {
    render(
      <Paragraph asChild size="lg" tone="accent" copyable>
        <article data-testid="art">内容</article>
      </Paragraph>,
    );
    const art = screen.getByTestId('art');
    expect(art.tagName).toBe('ARTICLE');
    expect(art).toHaveClass('ms-paragraph', 'ms-paragraph--size-lg', 'ms-tone-accent');
    // asChild 下不渲染复制按钮
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('Paragraph logic', () => {
  it('resolveEllipsis 归一化', () => {
    expect(resolveEllipsis(undefined)).toBeNull();
    expect(resolveEllipsis(false)).toBeNull();
    expect(resolveEllipsis(true)).toEqual({ rows: 1, expandable: false, symbol: undefined });
    expect(resolveEllipsis({ rows: 3, expandable: true, symbol: '…更多' })).toEqual({
      rows: 3,
      expandable: true,
      symbol: '…更多',
    });
    // rows 至少为 1
    expect(resolveEllipsis({ rows: 0 })?.rows).toBe(1);
    expect(resolveEllipsis({ rows: -5 })?.rows).toBe(1);
  });

  it('resolveCopyable 归一化', () => {
    expect(resolveCopyable(undefined)).toBeNull();
    expect(resolveCopyable(false)).toBeNull();
    expect(resolveCopyable(true)).toEqual({ text: undefined, onCopy: undefined });
    const onCopy = () => {};
    expect(resolveCopyable({ text: 'x', onCopy })).toEqual({ text: 'x', onCopy });
  });
});

// 复制按钮 copied 态会在 1.6s 后复位,避免泄漏到下条用例
beforeEach(() => {
  vi.useRealTimers();
});
