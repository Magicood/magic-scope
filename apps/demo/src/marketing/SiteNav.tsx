import { Button } from '@magic-scope/react';
import { useEffect, useState } from 'react';
import { Logo } from '../components/Logo';
import { nav } from '../data/content';
import { navigate } from '../lib/router';

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`v-nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="v-container v-nav__inner">
        <a href="#/" className="v-nav__brand" aria-label="Vela 首页">
          <Logo />
        </a>

        <nav className="v-nav__links" aria-label="主导航">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="v-nav__link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="v-nav__actions">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
            登录
          </Button>
          <Button variant="solid" size="sm" onClick={() => navigate('/app')}>
            免费开始
          </Button>
        </div>

        <button
          type="button"
          className="v-nav__burger"
          aria-label="菜单"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div className="v-nav__sheet">
          <div className="v-container v-nav__sheet-inner">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="v-nav__link"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Button variant="solid" fullWidth onClick={() => navigate('/app')}>
              免费开始
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
