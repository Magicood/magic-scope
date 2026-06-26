// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FloatButton } from './FloatButton';

describe('FloatButton', () => {
  it('默认渲染为 <button type=button>,带基础类名 + 默认加号图标', () => {
    render(<FloatButton aria-label="新建" />);
    const btn = screen.getByRole('button', { name: '新建' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).toHaveClass(
      'ms-float-button',
      'ms-float-button--circle',
      'ms-float-button--default',
    );
    // 默认占位图标(svg)存在
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });

  it('type=primary + shape=square + tone 映射到类名', () => {
    render(<FloatButton aria-label="主操作" type="primary" shape="square" tone="success" />);
    const btn = screen.getByRole('button', { name: '主操作' });
    expect(btn).toHaveClass(
      'ms-float-button--primary',
      'ms-float-button--square',
      'ms-tone-success',
    );
  });

  it('forwardRef 透传到底层 button 元素', () => {
    const ref = createRef<HTMLButtonElement | HTMLAnchorElement>();
    render(<FloatButton ref={ref} aria-label="x" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('传 href 渲染 <a>;target=_blank 自动补 rel 安全属性', () => {
    render(
      <FloatButton href="https://example.com" target="_blank" aria-label="外链">
        link
      </FloatButton>,
    );
    const link = screen.getByRole('link', { name: '外链' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('description 渲染进方钮内文字槽位,并加 with-text 标记', () => {
    render(<FloatButton aria-label="文档" shape="square" description="文档" />);
    const btn = screen.getByRole('button', { name: '文档' });
    expect(btn).toHaveClass('ms-float-button--with-text');
    expect(btn.querySelector('.ms-float-button__description')).toHaveTextContent('文档');
  });

  it('badge 数字渲染计数,超 overflowCount 截断为 N+', () => {
    const { rerender } = render(<FloatButton aria-label="通知" badge={5} />);
    expect(screen.getByText('5')).toHaveClass('ms-float-button__badge');
    rerender(<FloatButton aria-label="通知" badge={{ count: 200, overflowCount: 99 }} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('badge 点模式渲染 dot 类名、不显数字', () => {
    render(<FloatButton aria-label="提醒" badge={{ dot: true, count: 9 }} />);
    const badge = document.querySelector('.ms-float-button__badge');
    expect(badge).toHaveClass('ms-float-button__badge--dot');
    expect(badge).toBeEmptyDOMElement();
  });

  it('onClick 正常触发(不覆盖用户处理器)', () => {
    const onClick = vi.fn();
    render(<FloatButton aria-label="点我" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: '点我' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('传 tooltip 用 Tooltip 包裹:trigger 注入 anchor-name + 气泡内容渲染', () => {
    render(<FloatButton aria-label="设置" tooltip="设置项" />);
    const btn = screen.getByRole('button', { name: '设置' });
    // Tooltip 包裹:trigger 被注入 anchor-name(用于 CSS Anchor Positioning)
    expect(btn.getAttribute('style')).toContain('anchor-name');
    // 气泡(role=tooltip)随之渲染,内容即 tooltip 文案
    expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent('设置项');
  });
});

describe('FloatButton.Group', () => {
  it('渲染触发钮:aria-expanded=false / aria-controls 关联子项列表', () => {
    render(
      <FloatButton.Group aria-label="更多">
        <FloatButton aria-label="子一" />
        <FloatButton aria-label="子二" />
      </FloatButton.Group>,
    );
    const trigger = screen.getByRole('button', { name: '更多' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const listId = trigger.getAttribute('aria-controls');
    expect(listId).toBeTruthy();
    expect(document.getElementById(listId as string)).toBeInTheDocument();
  });

  it('click 触发:点击切换展开,aria-expanded 与 open 类名同步', () => {
    render(
      <FloatButton.Group aria-label="更多">
        <FloatButton aria-label="子一" />
      </FloatButton.Group>,
    );
    const trigger = screen.getByRole('button', { name: '更多' });
    const group = trigger.closest('.ms-float-button-group');
    expect(group).not.toHaveClass('ms-float-button-group--open');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(group).toHaveClass('ms-float-button-group--open');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('收起态子项移出 tab 序(tabIndex=-1),展开态恢复可聚焦', () => {
    const { rerender } = render(
      <FloatButton.Group aria-label="更多" open={false}>
        <FloatButton aria-label="子一" />
      </FloatButton.Group>,
    );
    expect(screen.getByRole('button', { name: '子一' })).toHaveAttribute('tabindex', '-1');
    rerender(
      <FloatButton.Group aria-label="更多" open={true}>
        <FloatButton aria-label="子一" />
      </FloatButton.Group>,
    );
    expect(screen.getByRole('button', { name: '子一' })).not.toHaveAttribute('tabindex', '-1');
  });

  it('受控 open:不内部翻转,只回调 onOpenChange(期望目标态)', () => {
    const onOpenChange = vi.fn();
    render(
      <FloatButton.Group aria-label="更多" open={false} onOpenChange={onOpenChange}>
        <FloatButton aria-label="子一" />
      </FloatButton.Group>,
    );
    const trigger = screen.getByRole('button', { name: '更多' });
    fireEvent.click(trigger);
    // 受控:DOM 不变,仅回调请求打开
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('Esc 在展开态收起', () => {
    render(
      <FloatButton.Group aria-label="更多" defaultOpen>
        <FloatButton aria-label="子一" />
      </FloatButton.Group>,
    );
    const trigger = screen.getByRole('button', { name: '更多' });
    const group = trigger.closest('.ms-float-button-group') as HTMLElement;
    expect(group).toHaveClass('ms-float-button-group--open');
    fireEvent.keyDown(group, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('子项继承 Group shape(未显式给时),并被包进列表 li', () => {
    render(
      <FloatButton.Group aria-label="更多" shape="square" open>
        <FloatButton aria-label="子一" />
      </FloatButton.Group>,
    );
    const item = screen.getByRole('button', { name: '子一' });
    expect(item).toHaveClass('ms-float-button--square');
    const list = document.querySelector('.ms-float-button-group__list') as HTMLElement;
    expect(within(list).getByRole('button', { name: '子一' })).toBeInTheDocument();
  });

  // —— 回归:非 FloatButton 宿主子项不应被注入框架专属 prop(shape/tone) ——
  it('非 FloatButton 子项(div)不出现 shape DOM 属性、不触发 React unknown prop 告警', () => {
    const warn = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <FloatButton.Group aria-label="更多" shape="square" open={false}>
        <div data-testid="raw-child">自定义</div>
      </FloatButton.Group>,
    );
    const rawChild = screen.getByTestId('raw-child');
    // 框架专属 prop 不得落到 DOM 上
    expect(rawChild).not.toHaveAttribute('shape');
    expect(rawChild).not.toHaveAttribute('tone');
    // 通用 prop(收起态 tabIndex=-1)仍注入到原生子项
    expect(rawChild).toHaveAttribute('tabindex', '-1');
    // 不应有 React unknown prop / NaN 等告警
    const offending = warn.mock.calls.filter((args) =>
      String(args[0]).match(/unknown|non-boolean|React does not recognize|Invalid|Warning/i),
    );
    expect(offending).toHaveLength(0);
    warn.mockRestore();
  });

  it('FloatButton 子项仍正常继承 shape,非 FloatButton 子项与之并存互不影响', () => {
    render(
      <FloatButton.Group aria-label="更多" shape="square" open>
        <FloatButton aria-label="子一" />
        <a href="https://example.com" data-testid="raw-link">
          链接
        </a>
      </FloatButton.Group>,
    );
    // FloatButton 子项继承到 square
    expect(screen.getByRole('button', { name: '子一' })).toHaveClass('ms-float-button--square');
    // 原生 a 子项无残留 shape 属性
    expect(screen.getByTestId('raw-link')).not.toHaveAttribute('shape');
  });

  // —— 回归:inert 用条件 spread,展开态不渲染、收起态渲染 ——
  it('展开态根列表无 inert 属性,收起态有 inert 属性', () => {
    const { rerender } = render(
      <FloatButton.Group aria-label="更多" open>
        <FloatButton aria-label="子一" />
      </FloatButton.Group>,
    );
    const list = document.querySelector('.ms-float-button-group__list') as HTMLElement;
    // 展开态:完全不渲染 inert(避免 inert="false" 残留把列表对 AT 永久隐藏)
    expect(list.hasAttribute('inert')).toBe(false);
    rerender(
      <FloatButton.Group aria-label="更多" open={false}>
        <FloatButton aria-label="子一" />
      </FloatButton.Group>,
    );
    const collapsed = document.querySelector('.ms-float-button-group__list') as HTMLElement;
    // 收起态:存在 inert 属性(布尔属性「存在即生效」)
    expect(collapsed.hasAttribute('inert')).toBe(true);
  });

  // —— 回归:reduced-motion 判定不在 render 期读浏览器,defaultOpen SSR 注水首帧 style 一致 ——
  it('SSR(renderToString)首帧错峰 style 不被 reduced-motion 影响(render 期不读浏览器环境)', async () => {
    // 即便 prefers-reduced-motion 命中,render 期也按 reduced=false(有动效)产出,
    // 保证客户端注水首帧与 SSR 一致 —— reduced 判定迁到 useEffect,server 上不执行。
    const { renderToString } = await import('react-dom/server');
    const html = renderToString(
      <FloatButton.Group aria-label="更多" defaultOpen stagger={40}>
        <FloatButton aria-label="子一" />
        <FloatButton aria-label="子二" />
      </FloatButton.Group>,
    );
    // 第二个子项(index=1)SSR 延时应为 40ms(reduced=false),render 期未读 window/document。
    expect(html).toContain('--ms-float-item-delay:40ms');
  });

  it('挂载后 reduced-motion 命中则错峰归零(useEffect 修正)', () => {
    const matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    });
    vi.stubGlobal('matchMedia', matchMedia);
    render(
      <FloatButton.Group aria-label="更多" defaultOpen stagger={40}>
        <FloatButton aria-label="子一" />
        <FloatButton aria-label="子二" />
      </FloatButton.Group>,
    );
    // RTL render 已 flush effect → reduced=true → 第二项延时归零。
    const second = screen.getByRole('button', { name: '子二' });
    expect(second.getAttribute('style')).toContain('--ms-float-item-delay: 0ms');
    vi.unstubAllGlobals();
  });
});
