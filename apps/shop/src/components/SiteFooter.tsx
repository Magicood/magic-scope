import { Button, Input, toast } from '@magic-scope/react';
import { type FormEvent, useState } from 'react';
import { DEMO_ORDER_ID } from '../data/orders';
import { categories } from '../data/products';
import { RouterLink } from '../lib/router';
import './SiteFooter.css';

/* ============================================================================
 * SiteFooter —— 买家端页脚。
 * 结构:顶部发丝线 → 品牌陈述 + 订阅信(宽列)+ Shop/Studio/Support 三窄列
 * → 版权行。右下角的 Admin console 是双面站的切换入口,刻意放得低调。
 * ========================================================================== */

/** 页脚链接:有 to 走 hash 路由;缺省为演示占位(页面在样板站范围之外)。 */
interface FooterLink {
  label: string;
  to?: string;
}

const shopLinks: FooterLink[] = [
  { label: 'All products', to: '/products' },
  ...categories.map((c) => ({ label: c.label, to: `/products?category=${c.id}` })),
];

const studioLinks: FooterLink[] = [
  { label: 'Our story' },
  { label: 'The workshop' },
  { label: 'Materials' },
  { label: 'Journal' },
];

const supportLinks: FooterLink[] = [
  { label: 'Track an order', to: `/orders/${DEMO_ORDER_ID}` },
  { label: 'Shipping & returns' },
  { label: 'Care guides' },
  { label: 'Contact' },
];

/** 宽松的邮箱格式校验 —— 演示站只拦明显不合法的输入。 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav className="sf-footer-col" aria-label={title}>
      <p className="sf-footer-heading">{title}</p>
      <ul className="sf-footer-list">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <RouterLink to={link.to} className="sf-link">
                {link.label}
              </RouterLink>
            ) : (
              // 占位条目:保留悬停下划线的链接观感,但无目标页、不进 Tab 序
              <span className="sf-link sf-footer-dead">{link.label}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const [email, setEmail] = useState('');

  /** 订阅提交:noValidate 关掉原生气泡,校验与反馈统一走 toast。 */
  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      toast.error('Enter a valid email address');
      return;
    }
    toast.success('Thank you — first letter arrives with the season.');
    setEmail('');
  };

  return (
    <footer className="sf-footer">
      <div className="sf-container sf-footer-inner">
        <div className="sf-footer-grid">
          <div className="sf-footer-brand">
            <RouterLink to="/" className="sf-footer-wordmark">
              Arden
            </RouterLink>
            <p className="sf-footer-statement">
              Objects for the hours at home. Designed in-house, made slowly.
            </p>

            <div className="sf-footer-news">
              <p className="sf-footer-heading" id="sf-footer-news-label">
                Occasional letters
              </p>
              <form
                className="sf-footer-form"
                noValidate
                aria-labelledby="sf-footer-news-label"
                onSubmit={handleSubscribe}
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  autoComplete="email"
                  aria-label="Email address"
                  className="sf-footer-input"
                />
                <Button type="submit">Subscribe</Button>
              </form>
              <p className="sf-footer-hint">A short letter, four times a year.</p>
            </div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Studio" links={studioLinks} />
          <FooterColumn title="Support" links={supportLinks} />
        </div>

        <div className="sf-footer-bottom">
          <p className="sf-footer-fineprint">© 2026 Arden Studio</p>
          <RouterLink to="/admin" className="sf-link sf-footer-admin">
            Admin console
          </RouterLink>
        </div>
      </div>
    </footer>
  );
}
