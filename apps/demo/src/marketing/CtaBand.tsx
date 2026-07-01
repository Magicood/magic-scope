import { Button, Heading, useReveal } from '@magic-scope/react';
import { Reveal } from '../components/Reveal';
import { navigate } from '../lib/router';

/** 营销收尾 CTA 区块:居中抬升大面板 + 双按钮 + 信任小字。 */
export function CtaBand() {
  // 面板进视口时,一道对角高光扫过一次(shine sweep);经 data-ms-fx / reduced-motion 门控。
  const { ref, inView } = useReveal<HTMLDivElement>({ amount: 0.35 });

  return (
    <section className="v-section">
      <div className="v-container">
        {/* 扫光编排:进场触发一次性 sweep;fx=off 或 reduced-motion 时不播(直接不显示高光条) */}
        <style>{`
          .v-cta-shine {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
            border-radius: inherit;
            opacity: 0;
          }
          .v-cta-shine::before {
            content: "";
            position: absolute;
            inset-block: -50%;
            inline-size: 40%;
            inset-inline-start: -50%;
            background: linear-gradient(
              100deg,
              transparent,
              color-mix(in oklab, var(--ms-color-glow, #fff) 22%, transparent),
              transparent
            );
            transform: skewX(-14deg);
          }
          .v-cta-band.is-in .v-cta-shine {
            opacity: 1;
          }
          .v-cta-band.is-in .v-cta-shine::before {
            animation: v-cta-sweep 1.15s var(--ms-ease-emphasized, cubic-bezier(0.2, 0, 0, 1)) 0.35s both;
          }
          @keyframes v-cta-sweep {
            from { inset-inline-start: -50%; }
            to { inset-inline-start: 150%; }
          }
          html[data-ms-fx="off"] .v-cta-shine,
          [data-ms-motion="off"] .v-cta-shine {
            display: none;
          }
          @media (prefers-reduced-motion: reduce) {
            .v-cta-shine { display: none; }
          }
        `}</style>
        <Reveal>
          <div
            ref={ref}
            className={`v-panel v-panel--raised v-cta-band${inView ? ' is-in' : ''}`}
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
            {/* 一次性扫光高光条(overflow 被面板裁剪) */}
            <div className="v-cta-shine" aria-hidden="true" />

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
