import { Badge } from '@magic-scope/react';
import { useEffect, useState } from 'react';
import { cartCount, useCart } from '../lib/cart';
import { navigate } from '../lib/router';
import { CartDrawer } from './CartDrawer';
import { IconBag, IconSearch } from './icons';
import { Logo } from './Logo';

const NAV = [
  { label: '咖啡豆', href: '#/shop' },
  { label: '冲煮器具', href: '#/shop' },
  { label: '每月订阅', href: '#/#subscribe' },
  { label: '我们的故事', href: '#/#story' },
];

export function SiteHeader() {
  const items = useCart();
  const count = cartCount(items);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`db-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="db-container db-header__inner">
        <a href="#/" aria-label="Daybreak 首页" style={{ display: 'inline-flex' }}>
          <Logo />
        </a>

        <nav className="db-header__nav" aria-label="主导航">
          {NAV.map((item) => (
            <a key={item.label} href={item.href} className="db-header__link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="db-header__actions">
          <button
            type="button"
            className="db-icon-btn db-header__search"
            aria-label="搜索"
            onClick={() => navigate('/shop')}
          >
            <span style={{ inlineSize: '1.2rem', blockSize: '1.2rem' }}>
              <IconSearch />
            </span>
          </button>
          <button
            type="button"
            className="db-icon-btn"
            aria-label={`购物车,${count} 件`}
            onClick={() => setCartOpen(true)}
            style={{ position: 'relative' }}
          >
            <span style={{ inlineSize: '1.25rem', blockSize: '1.25rem' }}>
              <IconBag />
            </span>
            {count > 0 && (
              <Badge
                tone="primary"
                variant="solid"
                size="sm"
                style={{ position: 'absolute', insetBlockStart: '-4px', insetInlineEnd: '-4px' }}
              >
                {count}
              </Badge>
            )}
          </button>
        </div>
      </div>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
