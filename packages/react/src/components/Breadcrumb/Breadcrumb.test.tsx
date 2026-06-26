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

    // aria-label 走 i18n 字典 breadcrumb.nav,默认中文「面包屑」(不再写死英文)
    const nav = screen.getByRole('navigation', { name: '面包屑' });
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

  it('tone 接 ms-tone 类,ariaLabel 覆盖默认无障碍名,...rest 原生事件透传到 nav', () => {
    const onMouseEnter = vi.fn();
    render(
      <Breadcrumb
        tone="primary"
        ariaLabel="路径"
        onMouseEnter={onMouseEnter}
        data-testid="bc"
        items={[{ label: '首页', href: '/' }, { label: '设置' }]}
      />,
    );

    const nav = screen.getByRole('navigation', { name: '路径' });
    expect(nav).toHaveClass('ms-tone-primary');
    // data-* 透传
    expect(nav).toHaveAttribute('data-testid', 'bc');
    // 原生事件透传
    fireEvent.mouseEnter(nav);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });

  it('onItemClick 与 item.onClick 同时触发,且 item.onClick 内 preventDefault 阻断后续', () => {
    const onItemClick = vi.fn();
    const itemClick = vi.fn((_i, _idx, e: { preventDefault: () => void }) => e.preventDefault());

    render(
      <Breadcrumb
        onItemClick={onItemClick}
        items={[{ label: '首页', href: '/', onClick: itemClick }, { label: '设置' }]}
      />,
    );

    fireEvent.click(screen.getByRole('link', { name: '首页' }));
    // item.onClick 先调用
    expect(itemClick).toHaveBeenCalledTimes(1);
    // item.onClick 里 preventDefault 后,内部 compose 不再调 onItemClick
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it('未 preventDefault 时 onItemClick 仍会触发(用户处理器与内部回调都跑)', () => {
    const onItemClick = vi.fn();
    const itemClick = vi.fn();

    render(
      <Breadcrumb
        onItemClick={onItemClick}
        items={[{ label: '首页', href: '/', onClick: itemClick }, { label: '设置' }]}
      />,
    );

    fireEvent.click(screen.getByRole('link', { name: '首页' }));
    expect(itemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledTimes(1);
    // 透出 (item, index, event)
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ label: '首页' }),
      0,
      expect.anything(),
    );
  });

  it('maxItems 折叠中间项为可展开省略号,点击展开后还原全部', () => {
    render(
      <Breadcrumb
        maxItems={3}
        items={[
          { label: 'A', href: '/a' },
          { label: 'B', href: '/b' },
          { label: 'C', href: '/c' },
          { label: 'D', href: '/d' },
          { label: 'E' },
        ]}
      />,
    );

    // 折叠后:头 1 + 省略 + 尾 1,中间 B/C/D 不可见
    expect(screen.queryByText('B')).not.toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    const expander = screen.getByRole('button', { name: /展开省略的 3 项/ });
    expect(expander).toBeInTheDocument();

    // 点击展开,全部还原
    fireEvent.click(expander);
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /展开省略/ })).not.toBeInTheDocument();
  });

  it('linkAs 替换链接元素,itemRender / item.render 完全自定义渲染', () => {
    const itemRender = vi.fn((item) => <span data-custom>{`渲染-${item.label}`}</span>);

    const { container } = render(
      <Breadcrumb
        linkAs="button"
        itemRender={itemRender}
        items={[
          { label: '首页', href: '/' },
          { label: '文档', href: '/docs', render: () => <em data-doc>自定义文档</em> },
          { label: '末页' },
        ]}
      />,
    );

    // item.render 优先于 itemRender:第二项渲染 <em data-doc>
    expect(container.querySelector('[data-doc]')).toHaveTextContent('自定义文档');
    // 其余项走全局 itemRender
    expect(itemRender).toHaveBeenCalled();
    expect(container.querySelectorAll('[data-custom]').length).toBeGreaterThan(0);
  });

  it('item.icon 渲染在 label 前并 aria-hidden,classNames 子部件类名钩子生效', () => {
    const { container } = render(
      <Breadcrumb
        classNames={{ list: 'my-list', link: 'my-link', current: 'my-current' }}
        items={[{ label: '首页', href: '/', icon: <svg data-icon /> }, { label: '设置' }]}
      />,
    );

    const icon = container.querySelector('.ms-breadcrumb__icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[data-icon]')).toBeInTheDocument();

    // classNames 钩子合并到对应子部件
    expect(container.querySelector('.ms-breadcrumb__list')).toHaveClass('my-list');
    expect(screen.getByRole('link', { name: '首页' })).toHaveClass('my-link');
    expect(screen.getByText('设置')).toHaveClass('my-current');
  });
});
