import { Badge, Button, Heading, RevealGroup, Segmented } from '@magic-scope/react';
import { useState } from 'react';
import { Reveal } from '../components/Reveal';
import { type Plan, plans } from '../data/content';
import { navigate } from '../lib/router';

type BillingCycle = 'monthly' | 'yearly';

const cycleOptions = [
  { value: 'monthly', label: '月付' },
  {
    value: 'yearly',
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        年付
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 'var(--ms-font-weight-medium)',
            color: 'var(--ms-color-success)',
          }}
        >
          省 20%
        </span>
      </span>
    ),
  },
];

function PriceDisplay({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) {
  const price = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

  if (price === 0) {
    return (
      <span
        style={{
          fontSize: 'clamp(2rem, 1.4rem + 2vw, 2.6rem)',
          fontWeight: 'var(--ms-font-weight-bold)',
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
        }}
      >
        免费
      </span>
    );
  }

  if (price < 0) {
    return (
      <span
        style={{
          fontSize: 'clamp(2rem, 1.4rem + 2vw, 2.6rem)',
          fontWeight: 'var(--ms-font-weight-bold)',
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
        }}
      >
        按需
      </span>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.3rem' }}>
      <span
        style={{
          fontSize: 'clamp(2.25rem, 1.4rem + 2.4vw, 3rem)',
          fontWeight: 'var(--ms-font-weight-bold)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
        }}
      >
        ¥{price}
      </span>
      <span style={{ fontSize: '0.95rem', color: 'var(--ms-color-fg-muted)' }}>/ 月</span>
    </span>
  );
}

function PlanCard({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) {
  const featured = Boolean(plan.featured);

  return (
    <article
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ms-space-4)',
        minInlineSize: 0,
        blockSize: '100%',
        padding: 'clamp(1.5rem, 1rem + 1.5vw, 2rem)',
        borderRadius: 'var(--ms-radius-lg)',
        // 与全站 .v-panel 对齐的表面层次:顶部微亮、底部收深 + 顶部内高光;featured 额外叠主色描边与辉光
        backgroundColor: featured ? 'var(--ms-color-surface-raised)' : 'var(--ms-color-surface)',
        backgroundImage: featured
          ? 'linear-gradient(180deg, color-mix(in oklab, var(--ms-color-surface-raised) 88%, #fff), var(--ms-color-surface-raised))'
          : 'linear-gradient(180deg, color-mix(in oklab, var(--ms-color-surface-raised) 55%, var(--ms-color-surface)), var(--ms-color-surface))',
        border: featured ? '1px solid var(--ms-color-primary)' : '1px solid var(--ms-color-border)',
        boxShadow: featured
          ? 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 1px var(--ms-color-primary), 0 24px 56px -26px color-mix(in oklab, var(--ms-color-primary) 55%, transparent)'
          : 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.22), 0 26px 52px -34px rgba(0, 0, 0, 0.8)',
      }}
    >
      {featured ? (
        <div
          style={{
            position: 'absolute',
            insetBlockStart: 0,
            insetInlineStart: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Badge variant="solid" tone="primary" size="sm">
            最受欢迎
          </Badge>
        </div>
      ) : null}

      <Heading level={3} variant="subtitle" style={{ margin: 0 }}>
        {plan.name}
      </Heading>

      <div style={{ minBlockSize: '3.4rem', display: 'flex', alignItems: 'flex-end' }}>
        <PriceDisplay plan={plan} cycle={cycle} />
      </div>

      <p
        style={{
          margin: 0,
          color: 'var(--ms-color-fg-muted)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          overflowWrap: 'anywhere',
        }}
      >
        {plan.blurb}
      </p>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gap: 'var(--ms-space-2)',
        }}
      >
        {plan.features.map((feature) => (
          <li
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem',
              fontSize: '0.925rem',
              lineHeight: 1.5,
              minInlineSize: 0,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                flex: 'none',
                marginBlockStart: '0.05rem',
                color: 'var(--ms-color-success)',
                fontWeight: 'var(--ms-font-weight-semibold)',
              }}
            >
              ✓
            </span>
            <span style={{ overflowWrap: 'anywhere' }}>{feature}</span>
          </li>
        ))}
      </ul>

      <div style={{ marginBlockStart: 'auto', paddingBlockStart: 'var(--ms-space-2)' }}>
        <Button variant={featured ? 'solid' : 'outline'} fullWidth onClick={() => navigate('/app')}>
          {plan.cta}
        </Button>
      </div>
    </article>
  );
}

export function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <section id="pricing" className="v-section">
      <div className="v-container">
        <Reveal>
          <div className="v-section-head v-section-head--center">
            <span className="v-eyebrow">价格</span>
            <h2
              className="v-section-head__title"
              style={{
                fontSize: 'clamp(1.6rem, 1rem + 2vw, 2.25rem)',
                fontWeight: 'var(--ms-font-weight-semibold)',
                lineHeight: 1.15,
                margin: '0.5rem 0 0',
                textWrap: 'balance',
              }}
            >
              简单透明的定价
            </h2>
            <p className="v-lead" style={{ marginInline: 'auto', maxInlineSize: '32rem' }}>
              按团队规模平滑升级,费用始终可预期。年付立省两个月。
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBlockStart: 'var(--ms-space-6)',
            }}
          >
            <Segmented
              options={cycleOptions}
              value={cycle}
              onValueChange={(value) => setCycle(value as BillingCycle)}
              aria-label="计费周期"
            />
          </div>
        </Reveal>

        {/* 价格卡:up 上滑揭示 + RevealGroup 错峰(与 Features 的 zoom-in 拉开节奏) */}
        <RevealGroup
          variant="up"
          stagger={80}
          amount={0.15}
          style={{
            display: 'grid',
            gap: 'clamp(1rem, 2vw, 1.75rem)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 17rem), 1fr))',
            alignItems: 'stretch',
            marginBlockStart: 'clamp(2.5rem, 5vw, 3.5rem)',
          }}
        >
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} cycle={cycle} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
