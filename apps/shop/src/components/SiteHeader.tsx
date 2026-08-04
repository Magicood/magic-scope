import {
  Badge,
  Button,
  Command,
  Dropdown,
  type DropdownItem,
  Kbd,
  Marquee,
} from '@magic-scope/react';
import { useEffect, useState } from 'react';
import { categories, products } from '../data/products';
import { money } from '../lib/format';
import { navigate, RouterLink } from '../lib/router';
import { useCart } from '../lib/store';
import { AppearanceControl } from './AppearanceControl';
import './SiteHeader.css';

/* ============================================================================
 * SiteHeader —— 买家端页头:公告条(Marquee)+ sticky 主头部 + ⌘K 搜索(Command)。
 * 未滚动时透明融入页面;scrollY > 8 挂 data-scrolled,CSS 侧切毛玻璃半透明底。
 * ========================================================================== */

/* 公告条文案 —— 三条克制的短句,循环滚动。 */
const ANNOUNCEMENTS = [
  'Complimentary shipping over $150',
  'New lighting for autumn',
  'Made slowly, kept for years',
];

/* 商品按分类分组(静态目录,模块级算一次即可)。 */
const PRODUCT_GROUPS = categories
  .map((category) => ({
    category,
    items: products.filter((p) => p.category === category.id),
  }))
  .filter((group) => group.items.length > 0);

/* 移动端导航项(<=760px 时收进 Dropdown)。 */
const MOBILE_NAV_ITEMS: DropdownItem[] = [
  { label: 'Shop All', onSelect: () => navigate('/products') },
  { type: 'separator' },
  ...categories.map((c) => ({
    label: c.label,
    onSelect: () => navigate(`/products?category=${c.id}`),
  })),
];

/* ------------------------- 图标(15px,与 AppearanceControl 同风格) ------------------------- */

const SearchIcon = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="6.7" cy="6.7" r="4.3" stroke="currentColor" strokeWidth="1.2" />
    <path d="M10.1 10.1 13.3 13.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const BagIcon = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M3.2 4.9h8.6l-.62 6.75a1.7 1.7 0 0 1-1.69 1.55H5.51a1.7 1.7 0 0 1-1.69-1.55L3.2 4.9Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M5.3 6.7V4.1a2.2 2.2 0 0 1 4.4 0v2.6"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const MenuIcon = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M2.2 5.1h10.6M2.2 9.9h10.6"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const GridIcon = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="4.6" height="4.6" rx="1.3" stroke="currentColor" strokeWidth="1.2" />
    <rect x="8.4" y="2" width="4.6" height="4.6" rx="1.3" stroke="currentColor" strokeWidth="1.2" />
    <rect x="2" y="8.4" width="4.6" height="4.6" rx="1.3" stroke="currentColor" strokeWidth="1.2" />
    <rect
      x="8.4"
      y="8.4"
      width="4.6"
      height="4.6"
      rx="1.3"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  </svg>
);

const ConsoleIcon = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <rect
      x="1.8"
      y="2.6"
      width="11.4"
      height="9.8"
      rx="2.2"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M4.5 6.2 6.3 7.7 4.5 9.2M8 9.4h2.4"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function SiteHeader() {
  const cart = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  /* 滚动态:scrollY > 8 挂 data-scrolled;passive 监听,卸载时 cleanup。 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* 公告条:随页面滚走,不参与 sticky */}
      <div className="sh-announce">
        <Marquee speed={30} gap={0} gradient gradientWidth="12%" aria-label="Store announcements">
          {ANNOUNCEMENTS.map((text) => (
            <span key={text} className="sh-announce-item">
              {text}
            </span>
          ))}
        </Marquee>
      </div>

      <header className="sh" data-scrolled={scrolled || undefined}>
        <div className="sf-container sh-inner">
          <RouterLink to="/" className="sh-brand">
            Arden
          </RouterLink>

          <nav className="sh-nav" aria-label="Primary">
            <RouterLink to="/products" className="sf-link sh-nav-link">
              Shop All
            </RouterLink>
            {categories.map((c) => (
              <RouterLink
                key={c.id}
                to={`/products?category=${c.id}`}
                className="sf-link sh-nav-link"
              >
                {c.label}
              </RouterLink>
            ))}
          </nav>

          <div className="sh-actions">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={SearchIcon}
              aria-label="Search"
              aria-keyshortcuts="Meta+K"
              onClick={() => setSearchOpen(true)}
            >
              <Kbd keys="cmd+k" size="sm" className="sh-search-kbd" />
            </Button>

            <AppearanceControl align="end" />

            {/* 角标模式:count<=0 时徽标自动不渲染,只留宿主按钮 */}
            <Badge standalone={false} count={cart.count} variant="solid" tone="primary" size="sm">
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={cart.count > 0 ? `Open cart, ${cart.count} items` : 'Open cart'}
                onClick={cart.openDrawer}
              >
                {BagIcon}
              </Button>
            </Badge>

            {/* 移动端导航入口(桌面端 CSS 隐藏) */}
            <span className="sh-menu">
              <Dropdown
                placement="bottom-end"
                items={MOBILE_NAV_ITEMS}
                trigger={
                  <Button variant="ghost" size="sm" iconOnly aria-label="Menu">
                    {MenuIcon}
                  </Button>
                }
              />
            </span>
          </div>
        </div>
      </header>

      {/* ⌘K 搜索:hotkey 由库全局监听并自带 cleanup;根级 onSelect 统一收面板 */}
      <Command.Dialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        hotkey
        onSelect={() => setSearchOpen(false)}
      >
        <Command.Input placeholder="Search products and pages…" />
        <Command.List label="Search results">
          <Command.Empty>No results found.</Command.Empty>
          {PRODUCT_GROUPS.map(({ category, items }) => (
            <Command.Group key={category.id} heading={category.label}>
              {items.map((p) => (
                <Command.Item
                  key={p.id}
                  value={p.id}
                  keywords={[category.label, p.tagline]}
                  shortcut={<span className="sh-cmd-price">{money(p.price)}</span>}
                  onSelect={() => navigate(`/products/${p.id}`)}
                >
                  {p.name}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
          <Command.Separator />
          <Command.Group heading="Pages">
            <Command.Item
              value="page-shop-all"
              icon={GridIcon}
              onSelect={() => navigate('/products')}
            >
              Shop all
            </Command.Item>
            <Command.Item value="page-cart" icon={BagIcon} onSelect={() => cart.openDrawer()}>
              Cart
            </Command.Item>
            <Command.Item value="page-admin" icon={ConsoleIcon} onSelect={() => navigate('/admin')}>
              Admin console
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
