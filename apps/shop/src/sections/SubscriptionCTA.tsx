import { Button, toast } from '@magic-scope/react';
import { IconCheck } from '../components/icons';
import { Reveal } from '../components/Reveal';
import { formatPrice, subscription } from '../data/catalog';

export function SubscriptionCTA() {
  return (
    <section id="subscribe" className="db-section db-container">
      <Reveal>
        <div
          className="db-card"
          style={{
            padding: 'clamp(1.75rem, 4vw, 3.5rem)',
            backgroundImage:
              'linear-gradient(135deg, color-mix(in oklab, var(--ms-color-primary) 9%, var(--ms-color-surface)) 0%, color-mix(in oklab, var(--ms-color-accent) 8%, var(--ms-color-surface)) 100%)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(20rem, 100%), 1fr))',
              gap: 'clamp(1.75rem, 4vw, 3rem)',
              alignItems: 'center',
            }}
          >
            {/* 左:文案 + 权益 */}
            <div style={{ display: 'grid', gap: 'var(--ms-space-4, 1rem)' }}>
              <span className="db-eyebrow">每月订阅</span>
              <h2 className="db-display" style={{ margin: 0 }}>
                {subscription.title}
              </h2>
              <p className="db-lead" style={{ margin: 0, maxInlineSize: '34rem' }}>
                {subscription.body}
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'grid',
                  gap: 'var(--ms-space-3, 0.75rem)',
                  marginBlockStart: 'var(--ms-space-2, 0.5rem)',
                }}
              >
                {subscription.perks.map((perk) => (
                  <li
                    key={perk}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--ms-space-3, 0.75rem)',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        inlineSize: '1.15rem',
                        blockSize: '1.15rem',
                        flexShrink: 0,
                        marginBlockStart: '0.15rem',
                        color: 'var(--ms-color-success)',
                      }}
                    >
                      <IconCheck />
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 右:价格卡 */}
            <div
              style={{
                background: 'var(--ms-color-surface)',
                border: '1px solid var(--ms-color-border)',
                borderRadius: 'var(--ms-radius-lg, 1rem)',
                padding: 'clamp(1.5rem, 3vw, 2rem)',
                boxShadow:
                  '0 24px 50px -36px color-mix(in oklab, var(--ms-color-fg) 40%, transparent)',
                display: 'grid',
                gap: 'var(--ms-space-4, 1rem)',
                justifyItems: 'center',
                textAlign: 'center',
              }}
            >
              <span className="db-eyebrow">首单尝鲜价</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 'var(--ms-space-2, 0.5rem)',
                }}
              >
                <span className="db-price" style={{ fontSize: 'clamp(2.25rem, 6vw, 3rem)' }}>
                  {formatPrice(subscription.priceFirst)}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.2rem' }}>
                  <span className="db-price__was">{formatPrice(subscription.priceMonthly)}</span>
                  <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.9rem' }}>/月</span>
                </span>
              </div>

              <Button
                size="lg"
                fullWidth
                onClick={() => toast.success('订阅已开启,下一炉将为你预留')}
              >
                开始订阅 · 首单 8 折
              </Button>

              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: 'var(--ms-color-fg-subtle)',
                }}
              >
                随时可暂停或取消
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
