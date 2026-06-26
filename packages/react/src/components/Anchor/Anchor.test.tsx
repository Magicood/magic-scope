// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Anchor, type AnchorItem } from './Anchor';

const items: AnchorItem[] = [
  { key: 'intro', href: '#intro', title: '简介' },
  {
    key: 'usage',
    href: '#usage',
    title: '用法',
    children: [
      { key: 'install', href: '#install', title: '安装' },
      { key: 'config', href: '#config', title: '配置' },
    ],
  },
  { key: 'api', href: '#api', title: 'API' },
];

/** 在文档里放好 id 对应的目标元素,供 getElementById 命中。 */
function mountTargets(ids: string[]): void {
  for (const id of ids) {
    const el = document.createElement('section');
    el.id = id;
    document.body.appendChild(el);
  }
}

beforeEach(() => {
  // jsdom 不实现这些布局/滚动 API,挂上 spy 供断言
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Anchor', () => {
  it('渲染为 nav landmark,带默认可访问名与基础类名', () => {
    render(<Anchor items={items} />);
    const nav = screen.getByRole('navigation', { name: '页内导航' });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('ms-anchor');
    expect(nav).toHaveClass('ms-anchor--md');
    expect(nav).toHaveClass('ms-tone-primary');
  });

  it('渲染全部锚点链接,含嵌套子项', () => {
    render(<Anchor items={items} />);
    expect(screen.getByRole('link', { name: '简介' })).toHaveAttribute('href', '#intro');
    expect(screen.getByRole('link', { name: '安装' })).toHaveAttribute('href', '#install');
    expect(screen.getByRole('link', { name: '配置' })).toHaveAttribute('href', '#config');
    expect(screen.getByRole('link', { name: 'API' })).toBeInTheDocument();
  });

  it('点击锚点 preventDefault 并触发容器滚动(window 默认)', () => {
    mountTargets(['intro', 'usage', 'install', 'config', 'api']);
    render(<Anchor items={items} />);

    const link = screen.getByRole('link', { name: '用法' });
    const evt = fireEvent.click(link); // fireEvent 返回是否 defaultPrevented(false 表示被 prevent)
    // 默认被阻止时 fireEvent.click 返回 false
    expect(evt).toBe(false);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('点击后该锚点被高亮并带 aria-current=location(非受控)', () => {
    mountTargets(['intro', 'usage', 'install', 'config', 'api']);
    render(<Anchor items={items} />);

    const link = screen.getByRole('link', { name: '配置' });
    fireEvent.click(link);
    expect(link).toHaveAttribute('aria-current', 'location');
    expect(link).toHaveClass('ms-anchor__link--active');
    // 其它项不应高亮
    expect(screen.getByRole('link', { name: '简介' })).not.toHaveAttribute('aria-current');
  });

  it('点击触发 onChange,载荷为目标 key', () => {
    mountTargets(['intro', 'usage', 'install', 'config', 'api']);
    const onChange = vi.fn();
    render(<Anchor items={items} onChange={onChange} />);

    fireEvent.click(screen.getByRole('link', { name: 'API' }));
    expect(onChange).toHaveBeenCalledWith('api');
  });

  it('受控模式:高亮由 activeKey 决定,点击不改变内部高亮但仍发 onChange', () => {
    mountTargets(['intro', 'usage', 'install', 'config', 'api']);
    const onChange = vi.fn();
    render(<Anchor items={items} activeKey="usage" onChange={onChange} />);

    expect(screen.getByRole('link', { name: '用法' })).toHaveAttribute('aria-current', 'location');

    fireEvent.click(screen.getByRole('link', { name: '简介' }));
    // 受控:高亮仍停留在外部指定的 usage
    expect(screen.getByRole('link', { name: '用法' })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: '简介' })).not.toHaveAttribute('aria-current');
    // 但 onChange 仍被通知
    expect(onChange).toHaveBeenCalledWith('intro');
  });

  // 回归:挂载首帧 compute 会算出一个非 null active(jsdom 下 rect 全 0 → 回退首项 intro),
  // 但只能初始化内部高亮,绝不能派发 onChange —— 否则与受控父级 activeKey 打架。
  it('挂载时不因首帧 compute 误发 onChange(只初始化内部高亮)', () => {
    mountTargets(['intro', 'usage', 'install', 'config', 'api']);
    const onChange = vi.fn();
    render(<Anchor items={items} onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });

  // 回归:受控模式下挂载同样不能派发 onChange(父级 activeKey 才是真相源)。
  it('受控模式挂载时不误发 onChange', () => {
    mountTargets(['intro', 'usage', 'install', 'config', 'api']);
    const onChange = vi.fn();
    render(<Anchor items={items} activeKey="usage" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });

  // 回归:onChange 不得写进 setState updater 体内(StrictMode 下 updater 双调用会导致双发)。
  // 一次点击只应派发一次 onChange。
  it('StrictMode 下点击只派发一次 onChange(updater 保持纯函数)', () => {
    mountTargets(['intro', 'usage', 'install', 'config', 'api']);
    const onChange = vi.fn();
    render(
      <StrictMode>
        <Anchor items={items} onChange={onChange} />
      </StrictMode>,
    );
    // 挂载阶段(StrictMode 双挂载)也不应派发
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('link', { name: 'API' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('api');
  });

  // 回归:点同一项两次,第二次内部高亮未变则不应重复派发 onChange(prevActiveRef 去重)。
  it('重复点击同一锚点不重复派发 onChange', () => {
    mountTargets(['intro', 'usage', 'install', 'config', 'api']);
    const onChange = vi.fn();
    render(<Anchor items={items} onChange={onChange} />);

    const link = screen.getByRole('link', { name: 'API' });
    fireEvent.click(link);
    fireEvent.click(link);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('自定义 ariaLabel 覆盖默认 landmark 名', () => {
    render(<Anchor items={items} ariaLabel="目录" />);
    expect(screen.getByRole('navigation', { name: '目录' })).toBeInTheDocument();
  });

  it('classNames 槽位下沉到对应子部件', () => {
    const { container } = render(
      <Anchor items={items} classNames={{ root: 'my-root', link: 'my-link', list: 'my-list' }} />,
    );
    expect(screen.getByRole('navigation')).toHaveClass('my-root');
    expect(container.querySelector('.ms-anchor__list')).toHaveClass('my-list');
    expect(screen.getByRole('link', { name: '简介' })).toHaveClass('my-link');
  });

  it('showInk=false 时不渲染墨条', () => {
    const { container } = render(<Anchor items={items} showInk={false} />);
    expect(container.querySelector('.ms-anchor__ink')).toBeNull();
  });

  it('forwardRef 拿到 nav 元素', () => {
    const ref = vi.fn();
    render(<Anchor items={items} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
    expect((ref.mock.calls[0]?.[0] as HTMLElement).tagName).toBe('NAV');
  });

  it('透传 nav 原生属性(id / data-*)', () => {
    render(<Anchor items={items} id="toc" data-testid="anchor-nav" />);
    const nav = screen.getByTestId('anchor-nav');
    expect(nav).toHaveAttribute('id', 'toc');
  });
});
