import { Badge } from '@magic-scope/react';
import { brand, footer } from '../data/catalog';
import { Logo } from './Logo';

export function SiteFooter() {
  return (
    <footer className="db-footer">
      <div className="db-container">
        <div className="db-footer__top">
          <div style={{ maxInlineSize: '22rem' }}>
            <Logo />
            <p
              style={{
                marginBlockStart: '0.9rem',
                fontSize: '0.9rem',
                lineHeight: 1.7,
                color: 'var(--ms-color-fg-muted)',
              }}
            >
              {brand.tagline}。{brand.intro}
            </p>
            <div style={{ marginBlockStart: '1rem' }}>
              <Badge variant="soft" tone="success" size="sm">
                当日烘焙 · 顺丰冷链
              </Badge>
            </div>
          </div>

          {footer.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <div className="db-footer__col-title">{col.title}</div>
              {col.links.map((link) => (
                <a key={link} href="#/shop" className="db-footer__link">
                  {link}
                </a>
              ))}
            </nav>
          ))}
        </div>

        <div className="db-footer__bottom">
          <span>{footer.copyright}</span>
          <span style={{ display: 'inline-flex', gap: '1.25rem' }}>
            <a href="#/shop" className="db-footer__link" style={{ padding: 0 }}>
              配送
            </a>
            <a href="#/shop" className="db-footer__link" style={{ padding: 0 }}>
              退换
            </a>
            <a href="#/shop" className="db-footer__link" style={{ padding: 0 }}>
              隐私
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
