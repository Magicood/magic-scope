// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NavigationMenu, type NavMenuItem } from './NavigationMenu';

/** 读 NavigationMenu.css 原文,用于断言 finding #2 的 CSS 契约(jsdom 不解析外部 CSS,直接验证规则文本)。 */
const navMenuCss = readFileSync(
  join(process.cwd(), 'packages/react/src/components/NavigationMenu/NavigationMenu.css'),
  'utf8',
);

const items: NavMenuItem[] = [
  { value: 'home', label: '首页', href: '/', active: true },
  {
    value: 'products',
    label: '产品',
    links: [
      { label: '编辑器', href: '/p/editor', description: '所见即所得' },
      { label: '看板', href: '/p/board' },
    ],
  },
  {
    value: 'company',
    label: '公司',
    content: <div data-testid="company-panel">关于我们</div>,
  },
  { value: 'disabled', label: '停用', content: <div>x</div>, disabled: true },
];

describe('NavigationMenu', () => {
  it('渲染为 nav 地标,带可访问名与基础类名', () => {
    const { container } = render(<NavigationMenu items={items} aria-label="站点导航" />);
    const nav = screen.getByRole('navigation', { name: '站点导航' });
    expect(nav).toBeInTheDocument();
    expect(container.querySelector('.ms-navmenu')).toBeInTheDocument();
  });

  it('纯链接项渲染为 <a> 且 active 标 aria-current=page', () => {
    render(<NavigationMenu items={items} />);
    const home = screen.getByRole('link', { name: '首页' });
    expect(home).toHaveAttribute('href', '/');
    expect(home).toHaveAttribute('aria-current', 'page');
  });

  it('带 panel 的项渲染为 button,aria-expanded 初始为 false', () => {
    render(<NavigationMenu items={items} />);
    const trigger = screen.getByRole('button', { name: /产品/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
  });

  it('点击触发器打开 panel:aria-expanded=true 且关联 aria-controls', () => {
    render(<NavigationMenu items={items} />);
    const trigger = screen.getByRole('button', { name: /公司/ });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const controls = trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const panel = document.getElementById(controls as string);
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
    expect(within(panel as HTMLElement).getByTestId('company-panel')).toBeInTheDocument();
  });

  it('再次点击同一触发器关闭 panel(toggle)', () => {
    render(<NavigationMenu items={items} />);
    const trigger = screen.getByRole('button', { name: /公司/ });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('同一时刻至多一个 panel 打开:开 B 自动关 A', () => {
    render(<NavigationMenu items={items} />);
    const products = screen.getByRole('button', { name: /产品/ });
    const company = screen.getByRole('button', { name: /公司/ });
    fireEvent.click(products);
    expect(products).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(company);
    expect(company).toHaveAttribute('aria-expanded', 'true');
    expect(products).toHaveAttribute('aria-expanded', 'false');
  });

  it('mega-menu links 渲染为链接网格', () => {
    render(<NavigationMenu items={items} />);
    fireEvent.click(screen.getByRole('button', { name: /产品/ }));
    expect(screen.getByRole('link', { name: /编辑器/ })).toHaveAttribute('href', '/p/editor');
    expect(screen.getByText('所见即所得')).toBeInTheDocument();
  });

  it('禁用项的触发器 disabled,点击不打开', () => {
    render(<NavigationMenu items={items} />);
    const trigger = screen.getByRole('button', { name: /停用/ });
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('键盘 ArrowRight 在触发器间横向移焦(跳过 disabled 应正常)', () => {
    render(<NavigationMenu items={items} />);
    const products = screen.getByRole('button', { name: /产品/ });
    products.focus();
    expect(products).toHaveFocus();
    fireEvent.keyDown(products, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: /公司/ })).toHaveFocus();
  });

  it('键盘 ArrowLeft 反向移焦', () => {
    render(<NavigationMenu items={items} />);
    const company = screen.getByRole('button', { name: /公司/ });
    company.focus();
    fireEvent.keyDown(company, { key: 'ArrowLeft' });
    expect(screen.getByRole('button', { name: /产品/ })).toHaveFocus();
  });

  it('键盘 ArrowDown 打开当前触发器的 panel', () => {
    render(<NavigationMenu items={items} />);
    const company = screen.getByRole('button', { name: /公司/ });
    company.focus();
    fireEvent.keyDown(company, { key: 'ArrowDown' });
    expect(company).toHaveAttribute('aria-expanded', 'true');
  });

  it('Escape 关闭 panel 并回焦触发器', () => {
    render(<NavigationMenu items={items} />);
    const company = screen.getByRole('button', { name: /公司/ });
    company.focus();
    fireEvent.keyDown(company, { key: 'ArrowDown' });
    expect(company).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(company, { key: 'Escape' });
    expect(company).toHaveAttribute('aria-expanded', 'false');
    expect(company).toHaveFocus();
  });

  it('受控模式:value 决定打开项,点击只回调不自动改', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <NavigationMenu items={items} value={null} onValueChange={onValueChange} />,
    );
    const company = screen.getByRole('button', { name: /公司/ });
    fireEvent.click(company);
    // 受控:内部不变(仍 false),只触发回调。
    expect(company).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).toHaveBeenCalledWith('company');
    // 父级把 value 切过去后才打开。
    rerender(<NavigationMenu items={items} value="company" onValueChange={onValueChange} />);
    expect(company).toHaveAttribute('aria-expanded', 'true');
  });

  it('非受控 defaultValue 初始即打开对应 panel', () => {
    render(<NavigationMenu items={items} defaultValue="company" />);
    expect(screen.getByRole('button', { name: /公司/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('viewport=false 时 panel 就地渲染(无共享 Viewport)', () => {
    const { container } = render(<NavigationMenu items={items} viewport={false} />);
    expect(container.querySelector('.ms-navmenu--viewport')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /公司/ }));
    expect(screen.getByTestId('company-panel')).toBeInTheDocument();
  });

  it('复合用法:子组件可组装出等价结构', () => {
    render(
      <NavigationMenu aria-label="复合导航" viewport={false}>
        <NavigationMenu.List>
          <NavigationMenu.Item value="docs">
            <NavigationMenu.Link href="/docs" asTrigger value="docs">
              文档
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item value="more">
            <NavigationMenu.Trigger value="more">更多</NavigationMenu.Trigger>
            <NavigationMenu.Content value="more">
              <div data-testid="more-panel">更多内容</div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>,
    );
    expect(screen.getByRole('link', { name: '文档' })).toHaveAttribute('href', '/docs');
    const more = screen.getByRole('button', { name: '更多' });
    fireEvent.click(more);
    expect(screen.getByTestId('more-panel')).toBeInTheDocument();
  });

  it('composeEventHandlers:用户 onClick 先跑,preventDefault 可阻断内部 toggle', () => {
    render(
      <NavigationMenu aria-label="拦截测试" viewport={false}>
        <NavigationMenu.List>
          <NavigationMenu.Item value="x">
            <NavigationMenu.Trigger value="x" onClick={(e) => e.preventDefault()}>
              X
            </NavigationMenu.Trigger>
            <NavigationMenu.Content value="x">内容</NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'X' });
    fireEvent.click(trigger);
    // 用户 preventDefault 阻断了内部 toggle,panel 不开。
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('forwardRef 透传到 nav 根元素', () => {
    const ref = createRef<HTMLElement>();
    render(<NavigationMenu ref={ref} items={items} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('点击 panel 外部关闭 panel', () => {
    render(
      <div>
        <NavigationMenu items={items} />
        <button type="button">外部</button>
      </div>,
    );
    const company = screen.getByRole('button', { name: /公司/ });
    fireEvent.click(company);
    expect(company).toHaveAttribute('aria-expanded', 'true');
    fireEvent.pointerDown(screen.getByRole('button', { name: '外部' }));
    expect(company).toHaveAttribute('aria-expanded', 'false');
  });

  it('classNames 槽位作用到对应部件', () => {
    const { container } = render(
      <NavigationMenu
        items={items}
        classNames={{ root: 'my-root', list: 'my-list', trigger: 'my-trigger' }}
      />,
    );
    expect(container.querySelector('.ms-navmenu.my-root')).toBeInTheDocument();
    expect(container.querySelector('.ms-navmenu__list.my-list')).toBeInTheDocument();
    expect(container.querySelector('.ms-navmenu__trigger.my-trigger')).toBeInTheDocument();
  });

  it('tone 写到根 class', () => {
    const { container } = render(<NavigationMenu items={items} tone="accent" />);
    expect(container.querySelector('.ms-navmenu.ms-tone-accent')).toBeInTheDocument();
  });

  /* —— 回归:finding #1 Space 键打开后不被合成 click 关回去 —— */
  it('回归#1:Space 在触发器上打开 panel,随后合成 click 不把它 toggle 关掉', () => {
    render(<NavigationMenu items={items} />);
    const company = screen.getByRole('button', { name: /公司/ });
    company.focus();
    // 真实浏览器序列:keydown 打开 → keyup → 合成 click(detail=0)。
    fireEvent.keyDown(company, { key: ' ' });
    expect(company).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyUp(company, { key: ' ' });
    // 合成 click 来自键盘(detail=0):必须被短路,不能 toggle 关闭。
    fireEvent.click(company, { detail: 0 });
    expect(company).toHaveAttribute('aria-expanded', 'true');
  });

  it('回归#1:鼠标真实 click(detail=1)仍能正常 toggle(标志位不污染后续点击)', () => {
    render(<NavigationMenu items={items} />);
    const company = screen.getByRole('button', { name: /公司/ });
    company.focus();
    // 先走一次 Space 开 + 合成 click(被短路)。
    fireEvent.keyDown(company, { key: ' ' });
    fireEvent.keyUp(company, { key: ' ' });
    fireEvent.click(company, { detail: 0 });
    expect(company).toHaveAttribute('aria-expanded', 'true');
    // 紧接着一次真实鼠标点击(detail=1)应正常关闭(标志位已清,不被吞)。
    fireEvent.click(company, { detail: 1 });
    expect(company).toHaveAttribute('aria-expanded', 'false');
  });

  /* —— 回归:finding #2 复合用法 + 默认 viewport=true 时 Content 仍就地渲染且带卡片类 —— */
  it('回归#2:复合用法保持默认 viewport=true,打开后 Content 仍就地渲染并带 .ms-navmenu__content', () => {
    const { container } = render(
      <NavigationMenu aria-label="复合默认viewport">
        <NavigationMenu.List>
          <NavigationMenu.Item value="more">
            <NavigationMenu.Trigger value="more">更多</NavigationMenu.Trigger>
            <NavigationMenu.Content value="more">
              <div data-testid="more-panel">更多内容</div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>,
    );
    // 默认 viewport=true:根带 --viewport class,但复合用法不自动渲染共享 Viewport。
    expect(container.querySelector('.ms-navmenu--viewport')).toBeInTheDocument();
    expect(container.querySelector('.ms-navmenu__viewport')).toBeNull();
    const more = screen.getByRole('button', { name: '更多' });
    fireEvent.click(more);
    // Content 必须就地渲染出来(不被吞),且携带带卡片样式的基类 .ms-navmenu__content。
    const panel = screen.getByTestId('more-panel');
    expect(panel).toBeInTheDocument();
    const content = container.querySelector('.ms-navmenu__content');
    expect(content).toBeInTheDocument();
    expect(content).toContainElement(panel);
    // 关键:它不在共享 Viewport 内层里(否则会被卡片中和规则还原成裸块)——这正是 finding #2 的修复点。
    expect(content?.closest('.ms-navmenu__viewport-inner')).toBeNull();
  });

  it('回归#2:CSS 契约 —— .ms-navmenu__content 基类自带定位/卡片(不再门控于 :not(--viewport))', () => {
    // 修复前:卡片样式写在 `.ms-navmenu:not(.ms-navmenu--viewport) .ms-navmenu__content` 下,
    // 复合 + 默认 viewport=true 时根带 --viewport class,该选择器不匹配 → 就地 Content 变裸块。
    // 修复后:基类 `.ms-navmenu__content` 直接带定位+卡片,viewport-inner 内才中和。
    // 断言:不存在「把卡片样式门控在 :not(.ms-navmenu--viewport) 下」的旧选择器。
    expect(navMenuCss).not.toMatch(/:not\(\.ms-navmenu--viewport\)\s+\.ms-navmenu__content/);
    // 基类必须携带卡片定位(border-radius / box-shadow / position),保证开箱可用。
    const baseBlock = navMenuCss.match(/\.ms-navmenu__content\s*\{[^}]*\}/);
    expect(baseBlock).not.toBeNull();
    expect(baseBlock?.[0]).toMatch(/position:\s*absolute/);
    expect(baseBlock?.[0]).toMatch(/box-shadow:/);
    // viewport-inner 内的 content 必须被中和(无卡片),避免共享 Viewport 里出现双层卡片。
    expect(navMenuCss).toMatch(/\.ms-navmenu__viewport-inner\s+\.ms-navmenu__content\s*\{/);
  });

  /* —— 回归:finding #3 焦点在 panel 内按 Esc,onEscapeKeyDown 可拦截关闭 —— */
  it('回归#3:焦点在 panel 内时 Esc 仍走 onEscapeKeyDown,preventDefault 可拦截关闭', () => {
    const onEscapeKeyDown = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(<NavigationMenu items={items} viewport={false} onEscapeKeyDown={onEscapeKeyDown} />);
    const company = screen.getByRole('button', { name: /公司/ });
    fireEvent.click(company);
    expect(company).toHaveAttribute('aria-expanded', 'true');
    // 焦点在 panel 内:从 panel 内部 dispatch Esc(会冒泡到 document 的全局监听)。
    const panel = screen.getByTestId('company-panel');
    fireEvent.keyDown(panel, { key: 'Escape' });
    // 父级 preventDefault 拦截:panel 不关。
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(company).toHaveAttribute('aria-expanded', 'true');
  });

  it('回归#3:焦点在 panel 内 Esc 未拦截则正常关闭并回焦触发器', () => {
    render(<NavigationMenu items={items} viewport={false} />);
    const company = screen.getByRole('button', { name: /公司/ });
    fireEvent.click(company);
    const panel = screen.getByTestId('company-panel');
    fireEvent.keyDown(panel, { key: 'Escape' });
    expect(company).toHaveAttribute('aria-expanded', 'false');
    expect(company).toHaveFocus();
  });

  /* —— 回归:finding #4 Esc 关闭只走单一路径,onEscapeKeyDown 只被调用一次 —— */
  it('回归#4:从触发器按 Esc 时 onEscapeKeyDown 恰好被调用一次(单一路径,不双触发)', () => {
    const onEscapeKeyDown = vi.fn();
    render(<NavigationMenu items={items} onEscapeKeyDown={onEscapeKeyDown} />);
    const company = screen.getByRole('button', { name: /公司/ });
    company.focus();
    fireEvent.keyDown(company, { key: 'ArrowDown' });
    expect(company).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(company, { key: 'Escape' });
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(company).toHaveAttribute('aria-expanded', 'false');
  });

  /* —— 回归:CSS Anchor Positioning 不被用户 style 覆盖 ——
   * 背景:同类浮层组件(如 Select)把 anchor-name 写进触发器的 inline style,若用户 style 在
   * `{...rest}` 里二次展开会覆盖掉 anchor 样式,锚点丢失 → 浮层掉到 top-layer 左上角。
   * NavigationMenu 走的是「另一套更稳的方案」:anchor-name / position-anchor 完全由 CSS 静态
   * 声明(.ms-navmenu / .ms-navmenu__viewport,锚名固定为 --ms-navmenu-anchor),组件的 inline
   * style 只放 --ms-navmenu-offset(间距变量),从不写 anchorName。因此用户 style 无论怎么覆盖
   * inline style,都动不了 CSS 里的 anchor —— 结构上免疫该 bug。下面两条把这个不变式锁死。 */
  it('回归(anchor):用户传 style 落到 <nav> 上,且不触碰任何 inline anchor-name(锚点不丢)', () => {
    const { container } = render(
      <NavigationMenu items={items} style={{ maxInlineSize: '16rem' }} />,
    );
    const nav = container.querySelector('.ms-navmenu') as HTMLElement;
    expect(nav).toBeInTheDocument();
    // 用户 style 生效(说明 style 经 {...rest} 落到了 nav 上)。
    expect(nav.style.maxInlineSize).toBe('16rem');
    // 组件从不把 anchor-name 写进 inline style(它在 CSS 里),所以用户 style 覆盖不到它。
    // jsdom 下读 inline style 的 anchor-name 应为空 —— 证明锚点不依赖 inline、不会被用户 style 顶掉。
    expect(nav.style.getPropertyValue('anchor-name')).toBe('');
    // panel 侧(共享 Viewport)同理:打开后其 inline style 也不含 position-anchor。
    fireEvent.click(screen.getByRole('button', { name: /公司/ }));
    const viewport = container.querySelector('.ms-navmenu__viewport') as HTMLElement;
    expect(viewport).toBeInTheDocument();
    expect(viewport.style.getPropertyValue('position-anchor')).toBe('');
  });

  it('回归(anchor):CSS 契约 —— anchor-name 锚 <nav>、position-anchor 锚 Viewport(固定锚名,免疫 inline 覆盖)', () => {
    // 这些声明都在 `@supports (anchor-name: --x) { … }` 内,锚名固定为 --ms-navmenu-anchor。
    const supportsBlock = navMenuCss.match(/@supports \(anchor-name:[^)]*\)\s*\{[\s\S]*?\n\}/);
    expect(supportsBlock).not.toBeNull();
    const css = supportsBlock?.[0] ?? '';
    // 触发器侧:.ms-navmenu 设 anchor-name(经 CSS,非 inline)。
    expect(css).toMatch(/\.ms-navmenu\s*\{[^}]*anchor-name:\s*--ms-navmenu-anchor/);
    // 面板侧:.ms-navmenu__viewport 设 position-anchor 指向同一锚名 + position-area。
    expect(css).toMatch(/\.ms-navmenu__viewport\s*\{[^}]*position-anchor:\s*--ms-navmenu-anchor/);
    expect(css).toMatch(/\.ms-navmenu__viewport\s*\{[^}]*position-area:/);
  });
});
