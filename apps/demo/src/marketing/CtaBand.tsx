import { Button, Heading } from '@magic-scope/react';
import { Reveal } from '../components/Reveal';
import { navigate } from '../lib/router';

/** 营销收尾 CTA 区块:居中抬升大面板 + 双按钮 + 信任小字。 */
export function CtaBand() {
  return (
    <section className="v-section">
      <div className="v-container">
        <Reveal>
          <div
            className="v-panel v-panel--raised"
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 'var(--ms-radius-xl, 1.25rem)',
              padding: 'clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
              textAlign: 'center',
            }}
          >
            {/* 极淡的 primary→accent 渐变底,克制不过曝 */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(120% 140% at 50% -20%, color-mix(in oklab, var(--ms-color-primary) 12%, transparent), transparent 60%), linear-gradient(135deg, color-mix(in oklab, var(--ms-color-primary) 6%, transparent), color-mix(in oklab, var(--ms-color-accent) 6%, transparent))',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                position: 'relative',
                display: 'grid',
                justifyItems: 'center',
                gap: 'clamp(1.25rem, 3vw, 1.75rem)',
                maxInlineSize: '46rem',
                marginInline: 'auto',
                minInlineSize: 0,
              }}
            >
              <span className="v-eyebrow" style={{ justifyContent: 'center' }}>
                准备好了吗
              </span>

              <Heading
                level={2}
                align="center"
                wrap="balance"
                style={{
                  fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
                  lineHeight: 1.1,
                  overflowWrap: 'anywhere',
                }}
              >
                把分散的数据,<span className="v-gradient-text">现在就开始</span>汇成一处
              </Heading>

              <p
                className="v-lead"
                style={{
                  margin: 0,
                  maxInlineSize: '34rem',
                  textAlign: 'center',
                  overflowWrap: 'anywhere',
                }}
              >
                几分钟接入,实时看清产品发生了什么。让团队从同一份事实出发做决策。
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 'var(--ms-space-3, 0.75rem)',
                  marginBlockStart: 'var(--ms-space-2, 0.5rem)',
                }}
              >
                <Button
                  variant="solid"
                  tone="primary"
                  size="lg"
                  glow="hover"
                  onClick={() => navigate('/app')}
                >
                  免费开始
                </Button>
                <Button variant="outline" tone="primary" size="lg" onClick={() => navigate('/app')}>
                  预约演示
                </Button>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--ms-font-size-sm, 0.875rem)',
                  color: 'var(--ms-color-fg-subtle)',
                  overflowWrap: 'anywhere',
                }}
              >
                无需信用卡 · 几分钟接入
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
