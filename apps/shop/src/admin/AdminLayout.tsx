import {
  Avatar,
  Breadcrumb,
  Button,
  Command,
  Dropdown,
  Kbd,
  Tour,
  type TourStep,
  toast,
} from '@magic-scope/react';
import { type ComponentType, type ReactNode, useEffect, useState } from 'react';
import { AppearanceControl } from '../components/AppearanceControl';
import { themeFamilies, useAppearance } from '../lib/appearance';
import { navigate, pathnameOf, RouterLink } from '../lib/router';
import { Customers } from './Customers';
import { Marketing } from './Marketing';
import { Orders } from './Orders';
import { Overview } from './Overview';
import { ProductsAdmin } from './ProductsAdmin';
import { Settings } from './Settings';
import './AdminLayout.css';

/* ============================================================================
 * AdminLayout —— Arden 商家控制台外壳(Linear 式轻控制台)。
 * 侧栏导航 + 顶栏(面包屑 / ⌘K 命令面板 / 外观四轴 / 新手引导)+ 路由分发,
 * 版面骨架复用 admin.css 的 .ad-*,本文件只补私有布局细节。
 * ========================================================================== */

type NavKey = 'overview' | 'orders' | 'products' | 'customers' | 'marketing' | 'settings';

interface NavEntry {
  key: NavKey;
  to: string;
  label: string;
  icon: ReactNode;
}

/* -------------------------- 15px 线性图标 ---------------------------------
 * stroke=currentColor,颜色随导航项文字色走;全部 aria-hidden 纯装饰。 */

const iconOverview = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <rect
      x="1.8"
      y="1.8"
      width="4.7"
      height="4.7"
      rx="1.3"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <rect
      x="8.5"
      y="1.8"
      width="4.7"
      height="4.7"
      rx="1.3"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <rect
      x="1.8"
      y="8.5"
      width="4.7"
      height="4.7"
      rx="1.3"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <rect
      x="8.5"
      y="8.5"
      width="4.7"
      height="4.7"
      rx="1.3"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  </svg>
);

const iconOrders = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M3.9 1.9h7.2v11.2l-1.8-1.05L7.5 13.1l-1.8-1.05-1.8 1.05V1.9Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M5.9 5.2h3.2M5.9 7.6h3.2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const iconProducts = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M7.4 1.9h5.7v5.7l-5.55 5.55a1.3 1.3 0 0 1-1.84 0L2.15 9.6a1.3 1.3 0 0 1 0-1.84L7.4 1.9Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <circle cx="10.3" cy="4.7" r="0.9" stroke="currentColor" strokeWidth="1.1" />
  </svg>
);

const iconCustomers = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="5.4" cy="4.9" r="2.2" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M1.9 13.1c.4-2.5 1.8-3.9 3.5-3.9s3.1 1.4 3.5 3.9"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M9.7 3a2.2 2.2 0 0 1 0 3.8M10.6 9.6c1.4.5 2.3 1.7 2.6 3.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const iconMarketing = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M12.8 2.4 5.6 4.7H3.2c-.8 0-1.4.6-1.4 1.4v.9c0 .8.6 1.4 1.4 1.4h2.4l7.2 2.3V2.4Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="m5.9 8.9.85 3.2a.85.85 0 0 0 .82.63h.33"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const iconSettings = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M1.9 4.5h6.2M11.9 4.5h1.2M1.9 10.5h2.2M7.9 10.5h5.2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <circle cx="10" cy="4.5" r="1.7" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="6" cy="10.5" r="1.7" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const iconArrowOut = (
  <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M4.4 10.6 10.6 4.4M5.6 4.4h5v5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const iconCaret = (
  <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="m4.7 5.6 2.8-2.8 2.8 2.8M4.7 9.4l2.8 2.8 2.8-2.8"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const iconHelp = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5.7" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M5.8 5.9a1.7 1.7 0 1 1 2.55 1.47c-.53.31-.85.6-.85 1.23"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <circle cx="7.5" cy="10.7" r="0.65" fill="currentColor" />
  </svg>
);

/* ------------------------------ 导航配置 ---------------------------------- */

const STORE_NAV: NavEntry[] = [
  { key: 'overview', to: '/admin', label: 'Overview', icon: iconOverview },
  { key: 'orders', to: '/admin/orders', label: 'Orders', icon: iconOrders },
  { key: 'products', to: '/admin/products', label: 'Products', icon: iconProducts },
  { key: 'customers', to: '/admin/customers', label: 'Customers', icon: iconCustomers },
];

const GROW_NAV: NavEntry[] = [
  { key: 'marketing', to: '/admin/marketing', label: 'Marketing', icon: iconMarketing },
  { key: 'settings', to: '/admin/settings', label: 'Settings', icon: iconSettings },
];

const ALL_NAV: NavEntry[] = [...STORE_NAV, ...GROW_NAV];

const PAGES: Record<NavKey, ComponentType> = {
  overview: Overview,
  orders: Orders,
  products: ProductsAdmin,
  customers: Customers,
  marketing: Marketing,
  settings: Settings,
};

/** 由 pathname 解析当前激活的导航键(未匹配子路径时落回 Overview)。 */
function activeKeyOf(pathname: string): NavKey {
  if (pathname.startsWith('/admin/orders')) return 'orders';
  if (pathname.startsWith('/admin/products')) return 'products';
  if (pathname.startsWith('/admin/customers')) return 'customers';
  if (pathname.startsWith('/admin/marketing')) return 'marketing';
  if (pathname.startsWith('/admin/settings')) return 'settings';
  return 'overview';
}

/* ------------------------------ 新手引导 ---------------------------------- */

const TOUR_SEEN_KEY = 'arden.admin.tour';

const TOUR_STEPS: TourStep[] = [
  {
    target: '#ad-nav',
    placement: 'right',
    title: 'Everything in reach',
    description: 'Move between orders, products, customers and growth tools from the sidebar.',
  },
  {
    target: '#ad-search-trigger',
    placement: 'bottom',
    title: 'Command palette',
    description: 'Press ⌘K anywhere to jump to a page or tweak the console without the mouse.',
  },
  {
    target: '#ad-appearance',
    placement: 'bottom',
    title: 'Make it yours',
    description: 'Palette, light or dark, density and motion — the whole console restyles live.',
  },
  {
    target: '#ad-page',
    placement: 'top',
    title: 'Your workspace',
    description: 'Every section keeps this same quiet layout, so your data stays the focus.',
  },
];

/* ------------------------------- 布局本体 --------------------------------- */

export function AdminLayout({ path }: { path: string }) {
  const pathname = pathnameOf(path);
  const active = activeKeyOf(pathname);
  const Page = PAGES[active];
  const activeLabel = ALL_NAV.find((item) => item.key === active)?.label ?? 'Overview';
  const { update } = useAppearance();

  const [cmdOpen, setCmdOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  // ⌘K / Ctrl+K 全局开合命令面板
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // 首次进入自动弹引导;看过(任何方式关闭)后只有点 "?" 才再弹
  useEffect(() => {
    try {
      if (!localStorage.getItem(TOUR_SEEN_KEY)) setTourOpen(true);
    } catch {
      /* 隐私模式下读取失败则不自动弹 */
    }
  }, []);

  const closeTour = () => {
    setTourOpen(false);
    try {
      localStorage.setItem(TOUR_SEEN_KEY, 'seen');
    } catch {
      /* 持久化失败可忽略 */
    }
  };

  const demoToast = () => toast('This is a demo console');

  const renderNavItem = (item: NavEntry) => (
    <RouterLink
      key={item.key}
      to={item.to}
      className="ad-nav-item"
      data-active={active === item.key || undefined}
      aria-current={active === item.key ? 'page' : undefined}
    >
      {item.icon}
      {item.label}
    </RouterLink>
  );

  return (
    <div className="ad-root">
      <aside className="ad-sidebar">
        <RouterLink to="/admin" className="ad-brand">
          <span className="ad-brand-mark" aria-hidden="true" />
          Arden
          <small>Console</small>
        </RouterLink>

        <nav id="ad-nav" className="ad-nav" aria-label="Console navigation">
          <span className="ad-nav-section">Store</span>
          {STORE_NAV.map(renderNavItem)}
          <span className="ad-nav-section">Grow</span>
          {GROW_NAV.map(renderNavItem)}
        </nav>

        <div className="ad-sidebar-footer">
          <RouterLink to="/" className="ad-view-store">
            {iconArrowOut}
            View storefront
          </RouterLink>
          <Dropdown
            placement="top-start"
            trigger={
              <button type="button" className="ad-user">
                <Avatar name="Ava Martin" size="sm" />
                <span className="ad-user-name">Ava Martin</span>
                <span className="ad-user-caret" aria-hidden="true">
                  {iconCaret}
                </span>
              </button>
            }
            items={[
              { label: 'Profile', onSelect: demoToast },
              { label: 'Keyboard shortcuts', onSelect: demoToast },
              { type: 'separator' },
              { label: 'Sign out', onSelect: demoToast },
            ]}
          />
        </div>
      </aside>

      <div className="ad-main">
        <header className="ad-topbar">
          <Breadcrumb items={[{ label: 'Admin', href: '#/admin' }, { label: activeLabel }]} />
          <div className="ad-topbar-spacer" />
          <Button
            id="ad-search-trigger"
            variant="ghost"
            size="sm"
            className="ad-search-trigger"
            onClick={() => setCmdOpen(true)}
          >
            <span className="ad-search-inner">
              Search…
              <Kbd keys="cmd+k" size="sm" />
            </span>
          </Button>
          <span id="ad-appearance" className="ad-appearance-slot">
            <AppearanceControl align="end" />
          </span>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Replay the console tour"
            onClick={() => setTourOpen(true)}
          >
            {iconHelp}
          </Button>
        </header>

        <div id="ad-page" className="ad-page">
          <Page />
        </div>
      </div>

      {/* ⌘K 命令面板:页面跳转 / 回店面 / 外观切换 */}
      <Command.Dialog open={cmdOpen} onOpenChange={setCmdOpen} onSelect={() => setCmdOpen(false)}>
        <Command.Input placeholder="Search pages and actions…" />
        <Command.List label="Console commands">
          <Command.Empty>Nothing matches your search.</Command.Empty>
          <Command.Group heading="Go to">
            {ALL_NAV.map((item) => (
              <Command.Item
                key={item.key}
                value={`go:${item.key}`}
                icon={item.icon}
                keywords={[item.label.toLowerCase(), 'page']}
                onSelect={() => navigate(item.to)}
              >
                {item.label}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Separator />
          <Command.Group heading="Storefront">
            <Command.Item
              value="storefront:view"
              icon={iconArrowOut}
              keywords={['view store', 'shop', 'home']}
              onSelect={() => navigate('/')}
            >
              View store
            </Command.Item>
          </Command.Group>
          <Command.Separator />
          <Command.Group heading="Appearance">
            <Command.Item
              value="appearance:light"
              keywords={['light', 'scheme', 'appearance']}
              onSelect={() => update({ scheme: 'light' })}
            >
              Switch to light mode
            </Command.Item>
            <Command.Item
              value="appearance:dark"
              keywords={['dark', 'scheme', 'appearance']}
              onSelect={() => update({ scheme: 'dark' })}
            >
              Switch to dark mode
            </Command.Item>
            {themeFamilies.map((family) => (
              <Command.Item
                key={family.name}
                value={`appearance:theme:${family.name}`}
                keywords={['theme', 'palette', family.label.toLowerCase()]}
                onSelect={() => update({ theme: family.name })}
              >
                {`Use ${family.label} theme`}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command.Dialog>

      {/* 新手引导:首访自动弹,之后由顶栏 "?" 重放 */}
      <Tour open={tourOpen} steps={TOUR_STEPS} onClose={closeTour} />
    </div>
  );
}
