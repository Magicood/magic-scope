import { Badge } from '@magic-scope/react';
import { Logo } from '../components/Logo';
import { brand, footer } from '../data/content';

export function SiteFooter() {
  return (
    <footer className="v-footer">
      <div className="v-container">
        <div className="v-footer__top">
          <div style={{ maxInlineSize: '20rem' }}>
            <Logo size={26} />
            <p
              style={{
                marginBlockStart: '0.9rem',
                fontSize: '0.9rem',
                lineHeight: 'var(--ms-leading-relaxed, 1.65)',
                color: 'var(--ms-color-fg-muted)',
              }}
            >
              {brand.description}
            </p>
            <div style={{ marginBlockStart: '1rem' }}>
              <Badge variant="soft" tone="success" size="sm">
                <span className="v-dot-pulse" aria-hidden="true" /> 所有系统运行正常
              </Badge>
            </div>
          </div>

          {footer.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <div className="v-footer__col-title">{col.title}</div>
              {col.links.map((link) => (
                <a key={link} href="#features" className="v-footer__link">
                  {link}
                </a>
              ))}
            </nav>
          ))}
        </div>

        <div className="v-footer__bottom">
          <span>{footer.copyright}</span>
          <span style={{ display: 'inline-flex', gap: '1.25rem' }}>
            <a href="#features" className="v-footer__link" style={{ padding: 0 }}>
              隐私
            </a>
            <a href="#features" className="v-footer__link" style={{ padding: 0 }}>
              条款
            </a>
            <a href="#features" className="v-footer__link" style={{ padding: 0 }}>
              状态
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
