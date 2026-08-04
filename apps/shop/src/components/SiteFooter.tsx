import { Button, Input, toast } from '@magic-scope/react';
import { type FormEvent, useState } from 'react';
import { DEMO_ORDER_ID } from '../data/orders';
import { categories } from '../data/products';
import { RouterLink } from '../lib/router';
import './SiteFooter.css';

/* ============================================================================
 * SiteFooter —— 买家端页脚:整块墨色拼贴件(.sf-tile-ink),圆角 14 / 外边距 10,
 * 与页面上方的色块拼贴同一套骨架,而不是一条「分割线以下的附属区」。
 * 内部 1.5fr / 1fr / 1fr / 1fr 不等分:超大字标 + 订阅 挨着三列密集链接,
 * 一疏一密。底行中间那组四色点是品牌签名,也是四个品类的图形化索引。
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

const ArrowIcon = (
  <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M3.4 11.6 11.6 3.4M5.3 3.4h6.3v6.3"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function FooterColumn({
  index,
  title,
  links,
}: {
  index: string;
  title: string;
  links: FooterLink[];
}) {
  return (
    <nav className="sfoot-col" aria-label={title}>
      <p className="sf-kicker sfoot-heading">
        <span className="sf-index sfoot-index">{index}</span>
        {title}
      </p>
      <ul className="sfoot-list">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <RouterLink to={link.to} className="sfoot-link">
                {link.label}
              </RouterLink>
            ) : (
              // 占位条目:保留链接观感,但无目标页、不进 Tab 序
              <span className="sfoot-link sfoot-dead">{link.label}</span>
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
    <footer className="sfoot">
      <div className="sf-tile sf-tile-ink sfoot-block">
        <div className="sfoot-grid">
          <div className="sfoot-brand">
            <RouterLink to="/" className="sf-display sfoot-wordmark">
              Arden
            </RouterLink>
            <p className="sfoot-statement">
              Objects for the hours at home. Designed in-house, made slowly.
            </p>

            <div className="sfoot-news">
              <p className="sf-kicker sfoot-heading" id="sfoot-news-label">
                Occasional letters
              </p>
              <form
                className="sfoot-form"
                noValidate
                aria-labelledby="sfoot-news-label"
                onSubmit={handleSubscribe}
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  autoComplete="email"
                  aria-label="Email address"
                  className="sfoot-input"
                  inputClassName="sfoot-input-field"
                />
                <Button type="submit" shape="pill" className="sfoot-submit">
                  Subscribe
                </Button>
              </form>
              <p className="sfoot-hint">A short letter, four times a year.</p>
            </div>
          </div>

          <FooterColumn index="01" title="Shop" links={shopLinks} />
          <FooterColumn index="02" title="Studio" links={studioLinks} />
          <FooterColumn index="03" title="Support" links={supportLinks} />
        </div>

        <div className="sfoot-bottom">
          <p className="sfoot-fineprint">© 2026 Arden Studio</p>

          {/* 四色点:品牌签名 + 四个品类的图形索引 */}
          <span className="sfoot-dots" aria-hidden="true">
            {categories.map((c) => (
              <i key={c.id} className="sf-dot sf-cat-dot" data-cat={c.id} />
            ))}
          </span>

          <RouterLink to="/admin" className="sfoot-admin">
            Admin console
            {ArrowIcon}
          </RouterLink>
        </div>
      </div>
    </footer>
  );
}
