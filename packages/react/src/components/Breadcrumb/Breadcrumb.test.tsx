// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  it('渲染 nav 容器并带 breadcrumb 无障碍名,根类名正确', () => {
    const { container } = render(
      <Breadcrumb
        items={[{ label: '首页', href: '/' }, { label: '设置' }]}
        className="custom-nav"
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(nav).toBeInTheDocument();
    // className 作用于 <nav>,与内置类名合并
    expect(nav).toHaveClass('ms-breadcrumb');
    expect(nav).toHaveClass('custom-nav');
    // 结构:nav → ol → li
    expect(container.querySelector('.ms-breadcrumb__list')).toBeInTheDocument();
  });

  it('非当前项有 href 时渲染为链接,末项默认作为当前页(span + aria-current)', () => {
    render(
      <Breadcrumb
        items={[
          { label: '首页', href: '/' },
          { label: '文档', href: '/docs' },
          { label: '面包屑' },
        ]}
      />,
    );

    // 前两项是可点击链接
    const home = screen.getByRole('link', { name: '首页' });
    expect(home).toHaveAttribute('href', '/');
    expect(home).toHaveClass('ms-breadcrumb__link');
    expect(screen.getByRole('link', { name: '文档' })).toHaveAttribute('href', '/docs');

    // 末项未显式标 current,按当前页处理:不是链接,带 aria-current="page"
    expect(screen.queryByRole('link', { name: '面包屑' })).not.toBeInTheDocument();
    const current = screen.getByText('面包屑');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveClass('ms-breadcrumb__current');
  });

  it('显式 current 的项即使带 href 也不渲染为链接,而是当前项 span', () => {
    render(
      <Breadcrumb
        items={[
          { label: '首页', href: '/' },
          { label: '当前节点', href: '/here', current: true },
          { label: '末项无 href' },
        ]}
      />,
    );

    // 显式 current 优先于 href,不渲染 <a>
    expect(screen.queryByRole('link', { name: '当前节点' })).not.toBeInTheDocument();
    const current = screen.getByText('当前节点');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveClass('ms-breadcrumb__current');

    // 末项无 href 且非显式 current:因是末项仍当作当前页
    const last = screen.getByText('末项无 href');
    expect(last).toHaveAttribute('aria-current', 'page');
  });

  it('在相邻项之间插入装饰性分隔符,且分隔符 aria-hidden、可自定义', () => {
    const { container } = render(
      <Breadcrumb
        separator=">"
        items={[{ label: '一', href: '/1' }, { label: '二', href: '/2' }, { label: '三' }]}
      />,
    );

    const separators = container.querySelectorAll('.ms-breadcrumb__separator');
    // 三项之间有两个分隔符(末项后不加)
    expect(separators).toHaveLength(2);
    separators.forEach((sep) => {
      expect(sep).toHaveAttribute('aria-hidden', 'true');
      expect(sep).toHaveTextContent('>');
    });
  });
});
