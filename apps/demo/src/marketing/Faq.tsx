import { Accordion, Button } from '@magic-scope/react';
import { Reveal } from '../components/Reveal';
import { faqs } from '../data/content';
import { navigate } from '../lib/router';

export function Faq() {
  const items = faqs.map((faq, index) => ({
    value: `faq-${index}`,
    title: faq.q,
    content: (
      <span
        style={{
          color: 'var(--ms-color-fg-muted)',
          lineHeight: 1.7,
          overflowWrap: 'anywhere',
        }}
      >
        {faq.a}
      </span>
    ),
  }));

  return (
    <section id="faq" className="v-section">
      <div
        className="v-container"
        style={{
          display: 'grid',
          gap: 'clamp(2rem, 5vw, 4rem)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
          alignItems: 'start',
        }}
      >
        <Reveal>
          <div
            style={{
              display: 'grid',
              gap: 'var(--ms-space-4)',
              maxInlineSize: '30rem',
              minInlineSize: 0,
            }}
          >
            <span className="v-eyebrow">FAQ</span>
            <h2
              className="v-section-head__title"
              style={{
                fontSize: 'clamp(1.6rem, 1rem + 2vw, 2.25rem)',
                fontWeight: 'var(--ms-font-weight-semibold)',
                lineHeight: 1.15,
                margin: 0,
                textWrap: 'balance',
              }}
            >
              还有疑问?
            </h2>
            <p className="v-lead" style={{ margin: 0 }}>
              这里整理了团队最常被问到的问题。没找到答案也没关系,我们很乐意为你解答。
            </p>
            <div style={{ marginBlockStart: 'var(--ms-space-2)' }}>
              <Button variant="outline" onClick={() => navigate('/app')}>
                联系我们
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div style={{ minInlineSize: 0 }}>
            <Accordion
              type="single"
              collapsible
              tone="primary"
              defaultValue="faq-0"
              items={items}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
