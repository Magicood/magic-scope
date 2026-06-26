// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Heading } from './Heading';
import { resolveAnchorId, slugify } from './logic';

describe('Heading', () => {
  it('默认渲染 h2 + ms-heading/ms-text,默认 variant=title', () => {
    render(<Heading>标题</Heading>);
    const el = screen.getByText('标题');
    expect(el.tagName).toBe('H2');
    expect(el).toHaveClass('ms-heading', 'ms-text', 'ms-heading--title');
  });

  it('level → 语义 hN 标签 + level 推导默认 variant', () => {
    render(<Heading level={1}>巨</Heading>);
    const el = screen.getByText('巨');
    expect(el.tagName).toBe('H1');
    // h1 默认 variant=display,且 display 默认 display 字族(Cinzel)
    expect(el).toHaveClass('ms-heading--display', 'ms-text--family-display');
  });

  it('variant 与 level 解耦:h2 + overline 视觉', () => {
    render(
      <Heading level={2} variant="overline">
        栏目
      </Heading>,
    );
    const el = screen.getByText('栏目');
    expect(el.tagName).toBe('H2');
    expect(el).toHaveClass('ms-heading--overline');
  });

  it('as 覆盖渲染标签(语义/视觉两套都保留)', () => {
    render(
      <Heading level={3} as="div" variant="title">
        div标题
      </Heading>,
    );
    const el = screen.getByText('div标题');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('ms-heading--title');
  });

  it('排版枚举属性 → 复用 ms-text--* 修饰类', () => {
    render(
      <Heading
        tone="accent"
        align="center"
        tracking="wide"
        transform="uppercase"
        wrap="pretty"
        breakWord
      >
        x
      </Heading>,
    );
    const el = screen.getByText('x');
    expect(el).toHaveClass(
      'ms-tone-accent',
      'ms-text--toned',
      'ms-text--align-center',
      'ms-text--tracking-wide',
      'ms-text--transform-uppercase',
      'ms-text--wrap-pretty',
      'ms-text--break',
    );
  });

  it('魔法 gradient/glow 无显式 tone 时兜底 primary 槽位(不染 toned)', () => {
    render(
      <Heading gradient glow="strong">
        魔法
      </Heading>,
    );
    const el = screen.getByText('魔法');
    expect(el).toHaveClass(
      'ms-text--gradient',
      'ms-text--glow',
      'ms-text--glow-strong',
      'ms-tone-primary',
    );
    expect(el.className).not.toContain('ms-text--toned');
  });

  it('数值字重 → inline --ms-text-weight;lineClamp → clamp 类 + 变量', () => {
    render(
      <Heading weight={620} lineClamp={2}>
        x
      </Heading>,
    );
    const el = screen.getByText('x');
    expect(el.style.getPropertyValue('--ms-text-weight')).toBe('620');
    expect(el).toHaveClass('ms-text--clamp');
    expect(el.style.getPropertyValue('--ms-line-clamp')).toBe('2');
  });

  it('anchor=true:从文本派生 id + 浮出可点 # permalink(href=#slug)', () => {
    render(
      <Heading level={2} anchor>
        Getting Started
      </Heading>,
    );
    const h = screen.getByRole('heading', { level: 2 });
    expect(h).toHaveAttribute('id', 'getting-started');
    expect(h).toHaveClass('ms-heading--anchored');
    const link = screen.getByRole('link', { name: /Getting Started 永久链接/ });
    expect(link).toHaveAttribute('href', '#getting-started');
  });

  it('anchor=字符串:作为显式 slug;CJK 标题可派生可读锚点', () => {
    const { rerender } = render(<Heading anchor="custom-slug">任意</Heading>);
    expect(screen.getByRole('heading')).toHaveAttribute('id', 'custom-slug');
    expect(screen.getByRole('link')).toHaveAttribute('href', '#custom-slug');
    rerender(<Heading anchor>魔法 标题</Heading>);
    expect(screen.getByRole('heading')).toHaveAttribute('id', '魔法-标题');
  });

  it('显式原生 id 优先于 anchor 派生', () => {
    render(
      <Heading anchor id="explicit">
        Will Be Ignored
      </Heading>,
    );
    expect(screen.getByRole('heading')).toHaveAttribute('id', 'explicit');
    expect(screen.getByRole('link')).toHaveAttribute('href', '#explicit');
  });

  it('留口:透传原生事件 + 合并 className/style', () => {
    const onClick = vi.fn();
    render(
      <Heading onClick={onClick} className="extra" style={{ opacity: 0.5 }}>
        x
      </Heading>,
    );
    const el = screen.getByText('x');
    expect(el).toHaveClass('ms-heading', 'extra');
    expect(el).toHaveStyle({ opacity: '0.5' });
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('asChild 把样式合并到子元素(无 anchor 时)', () => {
    render(
      <Heading asChild level={1} tone="accent">
        <a href="/x">去文档</a>
      </Heading>,
    );
    const link = screen.getByRole('link', { name: '去文档' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('ms-heading', 'ms-heading--display', 'ms-tone-accent');
    expect(link).toHaveAttribute('href', '/x');
  });

  it('logic:slugify 折叠空白/去标点/保留 CJK;resolveAnchorId 各分支', () => {
    expect(slugify('  Hello,  World!  ')).toBe('hello-world');
    expect(slugify('foo___bar--baz')).toBe('foo-bar-baz');
    expect(slugify('中文 标题')).toBe('中文-标题');
    expect(resolveAnchorId('explicit', true, 'x')).toBe('explicit');
    expect(resolveAnchorId(undefined, 'slug', 'x')).toBe('slug');
    expect(resolveAnchorId(undefined, true, 'Some Title')).toBe('some-title');
    expect(resolveAnchorId(undefined, false, 'x')).toBeUndefined();
    expect(resolveAnchorId(undefined, true, '   ')).toBeUndefined();
  });
});
