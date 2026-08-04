import { Badge, Button, Command, Dropdown, type DropdownItem, Kbd } from '@magic-scope/react';
import { useEffect, useState } from 'react';
import { categories, products } from '../data/products';
import { money } from '../lib/format';
import { navigate, pathnameOf, queryOf, RouterLink, useHashPath } from '../lib/router';
import { useCart } from '../lib/store';
import { AppearanceControl } from './AppearanceControl';
import './SiteHeader.css';

/* ============================================================================
 * SiteHeader —— 买家端页头:白色 surface 条 + ⌘K 搜索(Command)。
 *
 * Chromatic Grid 的壳层规则:
 *   · 导航项前挂品类色点(色彩=品类识别,不是装饰),当前项底色即该品类色的淡染;
 *   · 右侧两枚 chip 一浅一深(搜索=浅底 / 购物车=墨黑实心),密度与明度都成反差;
 *   · 公告跑马灯已移交首页首屏 bento,页头不再自带公告条。
 * 滚动态只加一条发丝线,不做毛玻璃(白条本来就是不透明的结构件)。
 * ========================================================================== */

/* 商品按分类分组(静态目录,模块级算一次即可)。 */
const PRODUCT_GROUPS = categories
  .map((category) => ({
    category,
    items: products.filter((p) => p.category === category.id),
  }))
  .filter((group) => group.items.length > 0);

/* 移动端导航项(<=860px 时收进 Dropdown)。 */
const MOBILE_NAV_ITEMS: DropdownItem[] = [
  { label: 'Shop all', onSelect: () => navigate('/products') },
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
  const path = useHashPath();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  /* 当前所在栏目:列表页 + ?category 决定哪一项点亮(色点已给出品类身份)。 */
  const pathname = pathnameOf(path);
  const onListing = pathname === '/products';
  const activeCategory = onListing ? queryOf(path).get('category') : null;

  /* 滚动态:scrollY > 8 挂 data-scrolled;passive 监听,卸载时 cleanup。 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="sh" data-scrolled={scrolled || undefined}>
        <div className="sh-inner">
          <RouterLink to="/" className="sh-brand">
            Arden
          </RouterLink>

          <nav className="sh-nav" aria-label="Primary">
            {/* 全部:四色条即「四个品类」的图形化,与下面四个单色点同源 */}
            <RouterLink
              to="/products"
              className="sh-nav-link"
              data-active={(onListing && !activeCategory) || undefined}
              aria-current={onListing && !activeCategory ? 'page' : undefined}
            >
              <span className="sf-spectrum sh-nav-spectrum" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
              Shop all
            </RouterLink>

            {categories.map((c) => (
              <RouterLink
                key={c.id}
                to={`/products?category=${c.id}`}
                className="sh-nav-link"
                data-cat={c.id}
                data-active={activeCategory === c.id || undefined}
                aria-current={activeCategory === c.id ? 'page' : undefined}
              >
                <span className="sf-dot sf-cat-dot" aria-hidden="true" />
                {c.label}
              </RouterLink>
            ))}
          </nav>

          <div className="sh-actions">
            {/* 搜索 chip:浅底药丸 + ⌘K 键帽(键帽走 rightIcon 槽,不进省略号的 label) */}
            <Button
              variant="ghost"
              size="sm"
              shape="pill"
              className="sh-chip sh-search"
              leftIcon={SearchIcon}
              rightIcon={<Kbd keys="cmd+k" size="sm" className="sh-search-kbd" />}
              aria-keyshortcuts="Meta+K"
              onClick={() => setSearchOpen(true)}
            >
              <span className="sh-chip-label">Search</span>
            </Button>

            <AppearanceControl align="end" />

            {/* 角标模式:count<=0 时徽标自动不渲染,只留宿主按钮 */}
            <Badge standalone={false} count={cart.count} variant="solid" tone="primary" size="sm">
              <Button
                variant="solid"
                size="sm"
                shape="pill"
                className="sh-chip sh-cart"
                leftIcon={BagIcon}
                aria-label={cart.count > 0 ? `Open cart, ${cart.count} items` : 'Open cart'}
                onClick={cart.openDrawer}
              >
                <span className="sh-chip-label">Cart</span>
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
                  icon={<span className="sf-dot sf-cat-dot" data-cat={category.id} />}
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
