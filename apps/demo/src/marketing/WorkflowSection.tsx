import { Heading, useReveal } from '@magic-scope/react';
import type { CSSProperties } from 'react';
import { Reveal } from '../components/Reveal';
import { workflow } from '../data/content';

export function WorkflowSection() {
  // 观察步骤列表进视口一次:命中后序号依次点亮、连接线从左生长(错峰由 --i 驱动)。
  const { ref, inView } = useReveal<HTMLOListElement>({ amount: 0.2 });

  return (
    <section id="workflow" className="v-section v-section--band">
      <div className="v-container">
        <Reveal>
          <div className="v-section-head v-section-head--center">
            <span className="v-eyebrow">四步上手</span>
            <Heading
              level={2}
              weight="semibold"
              align="center"
              wrap="balance"
              style={{
                margin: 0,
                fontSize: 'clamp(1.6rem, 1rem + 2vw, 2.25rem)',
                lineHeight: 1.15,
              }}
            >
              从接入到决策,一条顺滑的路径
            </Heading>
            <p className="v-lead" style={{ marginInline: 'auto' }}>
              不必拼凑工具链。从数据接入到协作决策,每一步都在同一处完成。
            </p>
          </div>
        </Reveal>

        {/* 序号点亮 + 连接线生长的编排:延迟由每步 --i 错峰;reduced-motion / motion=off 下经 --ms-motion-scale 归零直接落终态 */}
        <style>{`
          .v-flow__step {
            opacity: 0;
            transform: translateY(12px);
            transition:
              opacity 0.5s var(--ms-ease-standard, cubic-bezier(0.2, 0, 0, 1)),
              transform 0.5s var(--ms-ease-standard, cubic-bezier(0.2, 0, 0, 1));
            transition-delay: calc(var(--i, 0) * 110ms * var(--ms-motion-scale, 1));
          }
          .v-flow__num {
            opacity: 0.14;
            transition: opacity 0.5s ease, color 0.5s ease;
            transition-delay: calc((var(--i, 0) * 110ms + 120ms) * var(--ms-motion-scale, 1));
          }
          .v-flow__line {
            transform: scaleX(0);
            transform-origin: left center;
            transition: transform 0.6s var(--ms-ease-emphasized, cubic-bezier(0.2, 0, 0, 1));
            transition-delay: calc((var(--i, 0) * 110ms + 260ms) * var(--ms-motion-scale, 1));
          }
          .v-flow.is-in .v-flow__step {
            opacity: 1;
            transform: none;
          }
          .v-flow.is-in .v-flow__num {
            opacity: 0.4;
          }
          .v-flow.is-in .v-flow__line {
            transform: scaleX(1);
          }
          @media (prefers-reduced-motion: reduce) {
            .v-flow__step,
            .v-flow__num,
            .v-flow__line {
              transition: none;
            }
          }
        `}</style>

        <ol
          ref={ref}
          className={`v-flow${inView ? ' is-in' : ''}`}
          style={{
            listStyle: 'none',
            margin: 0,
            marginBlockStart: 'clamp(2.5rem, 5vw, 4rem)',
            padding: 0,
            display: 'grid',
            gap: 'clamp(1.5rem, 3vw, 2rem)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))',
            alignItems: 'start',
          }}
        >
          {workflow.map((step, index) => {
            const ordinal = String(index + 1).padStart(2, '0');
            const isLast = index === workflow.length - 1;

            return (
              <li key={step.id} className="v-flow__step" style={{ '--i': index } as CSSProperties}>
                <div
                  style={{
                    position: 'relative',
                    display: 'grid',
                    gap: 'var(--ms-space-2)',
                    minInlineSize: 0,
                    paddingInlineEnd: 'var(--ms-space-2)',
                  }}
                >
                  {!isLast ? (
                    <span
                      className="v-flow__line"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        insetBlockStart: '0.85rem',
                        insetInlineEnd: 'calc(var(--ms-space-2) * -1)',
                        inlineSize: '1.5rem',
                        blockSize: '1px',
                        background: 'linear-gradient(90deg, var(--ms-color-border), transparent)',
                      }}
                    />
                  ) : null}

                  <span
                    className="v-flow__num"
                    aria-hidden="true"
                    style={{
                      fontSize: 'clamp(2.25rem, 4vw, 3rem)',
                      fontWeight: 'var(--ms-font-weight-bold)',
                      lineHeight: 1,
                      color: 'var(--ms-color-primary)',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {ordinal}
                  </span>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 'var(--ms-font-weight-semibold)',
                      lineHeight: 1.3,
                      color: 'var(--ms-color-fg)',
                      textWrap: 'balance',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      lineHeight: 1.65,
                      color: 'var(--ms-color-fg-muted)',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
