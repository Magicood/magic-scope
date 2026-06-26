// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { List } from './List';

describe('List', () => {
  it('variant → 根标签 ul / ol / dl + 修饰类', () => {
    const { container, rerender } = render(
      <List>
        <List.Item>a</List.Item>
      </List>,
    );
    const ul = container.querySelector('.ms-list');
    expect(ul?.tagName).toBe('UL');
    expect(ul).toHaveClass('ms-list--unordered');

    rerender(
      <List variant="ordered">
        <List.Item>a</List.Item>
      </List>,
    );
    expect(container.querySelector('.ms-list')?.tagName).toBe('OL');

    rerender(
      <List variant="description">
        <List.Term>术语</List.Term>
        <List.Detail>释义</List.Detail>
      </List>,
    );
    const dl = container.querySelector('.ms-list');
    expect(dl?.tagName).toBe('DL');
    expect(screen.getByText('术语').tagName).toBe('DT');
    expect(screen.getByText('释义').tagName).toBe('DD');
  });

  it('marker 字符串 → inline list-style-type 变量;不传按 variant 兜底', () => {
    const { container, rerender } = render(
      <List marker="lower-roman">
        <List.Item>a</List.Item>
      </List>,
    );
    const root = container.querySelector('.ms-list') as HTMLElement;
    expect(root.style.getPropertyValue('--ms-list-marker-type')).toBe('lower-roman');

    rerender(
      <List variant="ordered">
        <List.Item>a</List.Item>
      </List>,
    );
    const ol = container.querySelector('.ms-list') as HTMLElement;
    expect(ol.style.getPropertyValue('--ms-list-marker-type')).toBe('decimal');
  });

  it('marker 为 ReactNode → 自定义标记类 + 每项注入 aria-hidden 标记', () => {
    const { container } = render(
      <List marker={<span data-testid="star">★</span>}>
        <List.Item>a</List.Item>
        <List.Item>b</List.Item>
      </List>,
    );
    const root = container.querySelector('.ms-list') as HTMLElement;
    expect(root).toHaveClass('ms-list--custom-marker');
    expect(root.style.getPropertyValue('--ms-list-marker-type')).toBe('none');
    const markers = container.querySelectorAll('.ms-list__marker');
    expect(markers).toHaveLength(2);
    expect(markers[0]).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getAllByTestId('star')).toHaveLength(2);
    // 内容被包进 content 列
    expect(container.querySelector('.ms-list__content')?.textContent).toBe('a');
  });

  it('spacing / markerPosition / tone → 修饰类;tone 出 toned + ms-tone-*', () => {
    const { container } = render(
      <List spacing="lg" markerPosition="inside" tone="success">
        <List.Item>a</List.Item>
      </List>,
    );
    const root = container.querySelector('.ms-list');
    expect(root).toHaveClass(
      'ms-list--spacing-lg',
      'ms-list--marker-inside',
      'ms-tone-success',
      'ms-list--toned',
    );
  });

  it('glow 无显式 tone 时兜底 primary 槽位 + glow 类', () => {
    const { container } = render(
      <List glow>
        <List.Item>a</List.Item>
      </List>,
    );
    const root = container.querySelector('.ms-list');
    expect(root).toHaveClass('ms-list--glow', 'ms-tone-primary');
    // glow 不应误染 toned(无显式 tone)
    expect(root?.className).not.toContain('ms-list--toned');
  });

  it('嵌套 List 独立渲染(子列表是自己的 ul)', () => {
    const { container } = render(
      <List>
        <List.Item>
          顶层
          <List variant="ordered">
            <List.Item>子项</List.Item>
          </List>
        </List.Item>
      </List>,
    );
    const lists = container.querySelectorAll('.ms-list');
    expect(lists).toHaveLength(2);
    expect(lists[1]?.tagName).toBe('OL');
  });

  it('classNames 注入子部件 className', () => {
    render(
      <List variant="description" classNames={{ term: 'my-term', detail: 'my-detail' }}>
        <List.Term>t</List.Term>
        <List.Detail>d</List.Detail>
      </List>,
    );
    expect(screen.getByText('t')).toHaveClass('ms-list__term', 'my-term');
    expect(screen.getByText('d')).toHaveClass('ms-list__detail', 'my-detail');
    // item className 注入到自定义标记项
    const { container: c2 } = render(
      <List classNames={{ item: 'my-item' }}>
        <List.Item>x</List.Item>
      </List>,
    );
    expect(c2.querySelector('.ms-list__item')).toHaveClass('my-item');
  });

  it('留口:透传原生事件 + 合并 className/style', () => {
    const onClick = vi.fn();
    const { container } = render(
      <List onClick={onClick} className="extra" style={{ opacity: 0.5 }} data-testid="lst">
        <List.Item>a</List.Item>
      </List>,
    );
    const root = screen.getByTestId('lst');
    expect(root).toHaveClass('ms-list', 'extra');
    expect(root).toHaveStyle({ opacity: '0.5' });
    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledOnce();
    expect(container.querySelector('.ms-list__item')?.textContent).toBe('a');
  });

  it('asChild 把样式合并到子元素(根)', () => {
    const { container } = render(
      <List asChild tone="accent">
        <nav aria-label="目录">
          <span>内容</span>
        </nav>
      </List>,
    );
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav).toHaveClass('ms-list', 'ms-tone-accent');
    expect(nav).toHaveAttribute('aria-label', '目录');
  });

  it('List.Item asChild 合并到子元素(如包裹链接)', () => {
    render(
      <List>
        <List.Item asChild>
          <a href="/x">链接项</a>
        </List.Item>
      </List>,
    );
    const link = screen.getByRole('link', { name: '链接项' });
    expect(link).toHaveClass('ms-list__item');
    expect(link).toHaveAttribute('href', '/x');
  });
});
