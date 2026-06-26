// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Link } from './Link';
import { mergeRel, resolveExternalProps } from './logic';

describe('Link', () => {
  it('默认渲染 a + ms-link + underline-auto', () => {
    render(<Link href="/x">文档</Link>);
    const el = screen.getByRole('link', { name: '文档' });
    expect(el.tagName).toBe('A');
    expect(el).toHaveClass('ms-link', 'ms-link--underline-auto');
    expect(el).toHaveAttribute('href', '/x');
  });

  it('underline 四态 → 修饰类', () => {
    const { rerender } = render(<Link underline="hover">a</Link>);
    expect(screen.getByText('a').closest('a')).toHaveClass('ms-link--underline-hover');
    rerender(<Link underline="always">a</Link>);
    expect(screen.getByText('a').closest('a')).toHaveClass('ms-link--underline-always');
    rerender(<Link underline="none">a</Link>);
    expect(screen.getByText('a').closest('a')).toHaveClass('ms-link--underline-none');
  });

  it('tone → ms-tone-* + toned;size → 字号类', () => {
    render(
      <Link tone="success" size="lg" href="/x">
        x
      </Link>,
    );
    const el = screen.getByRole('link');
    expect(el).toHaveClass('ms-tone-success', 'ms-link--toned', 'ms-link--size-lg');
  });

  it('external → target=_blank + rel 安全令牌 + 外链图标 + sr-only 新窗口提示', () => {
    render(
      <Link href="https://example.com" external>
        外站
      </Link>,
    );
    const el = screen.getByRole('link', { name: /外站/ });
    expect(el).toHaveClass('ms-link--external');
    expect(el).toHaveAttribute('target', '_blank');
    expect(el).toHaveAttribute('rel', 'noopener noreferrer');
    // 外链图标(装饰)与 sr-only 文案
    expect(el.querySelector('.ms-link__external-icon')).toBeInTheDocument();
    expect(el).toHaveTextContent('(在新窗口打开)');
  });

  it('external + 用户已有 rel → 安全合并去重(不重复 noopener)', () => {
    render(
      <Link href="https://example.com" external rel="noopener nofollow">
        x
      </Link>,
    );
    const el = screen.getByRole('link');
    expect(el).toHaveAttribute('rel', 'noopener nofollow noreferrer');
  });

  it('external + hideExternalIcon → 去图标但保留 target/rel 与 sr-only', () => {
    render(
      <Link href="https://example.com" external hideExternalIcon>
        x
      </Link>,
    );
    const el = screen.getByRole('link');
    expect(el.querySelector('.ms-link__external-icon')).not.toBeInTheDocument();
    expect(el).toHaveAttribute('target', '_blank');
    expect(el).toHaveTextContent('(在新窗口打开)');
  });

  it('disabled → 去 href + aria-disabled + tabIndex=-1 + 拦截点击', () => {
    const onClick = vi.fn();
    render(
      <Link href="/x" disabled onClick={onClick}>
        禁用
      </Link>,
    );
    const el = screen.getByText('禁用').closest('a') as HTMLAnchorElement;
    expect(el).toHaveClass('ms-link--disabled');
    expect(el).not.toHaveAttribute('href');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    expect(el).toHaveAttribute('tabindex', '-1');
    fireEvent.click(el);
    // 用户处理器先跑,但内部 guard preventDefault;onClick 仍被调用一次(compose 语义:用户先执行)
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('留口:透传原生事件 + 合并 className/style;onClick 不被覆盖', () => {
    const onClick = vi.fn();
    render(
      <Link href="/x" onClick={onClick} className="extra" style={{ opacity: 0.5 }} data-testid="lk">
        x
      </Link>,
    );
    const el = screen.getByTestId('lk');
    expect(el).toHaveClass('ms-link', 'extra');
    expect(el).toHaveStyle({ opacity: '0.5' });
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('asChild 把样式/props 合并到子元素(路由 Link),保留子元素 href', () => {
    render(
      <Link asChild tone="accent" external>
        <a href="/route">路由</a>
      </Link>,
    );
    const link = screen.getByRole('link', { name: /路由/ });
    expect(link).toHaveClass('ms-link', 'ms-tone-accent', 'ms-link--external');
    expect(link).toHaveAttribute('href', '/route');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('logic.mergeRel / resolveExternalProps 纯函数', () => {
    expect(mergeRel(undefined, ['noopener', 'noreferrer'])).toBe('noopener noreferrer');
    expect(mergeRel('nofollow', ['noopener'])).toBe('nofollow noopener');
    expect(mergeRel('noopener', ['noopener'])).toBe('noopener');
    // 非外链:原样回传用户值,不强加令牌
    expect(resolveExternalProps(false, undefined, 'nofollow')).toEqual({
      target: undefined,
      rel: 'nofollow',
    });
    // 外链:补 _blank + 安全 rel;尊重用户已给的 target
    expect(resolveExternalProps(true, '_self', undefined)).toEqual({
      target: '_self',
      rel: 'noopener noreferrer',
    });
  });
});
