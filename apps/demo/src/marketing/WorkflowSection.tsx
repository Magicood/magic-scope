import { Heading } from '@magic-scope/react';
import { Reveal } from '../components/Reveal';
import { workflow } from '../data/content';

export function WorkflowSection() {
  return (
    <section id="workflow" className="v-section">
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

        <ol
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
              <Reveal key={step.id} as="li" delay={index * 90}>
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
                    aria-hidden="true"
                    style={{
                      fontSize: 'clamp(2.25rem, 4vw, 3rem)',
                      fontWeight: 'var(--ms-font-weight-bold)',
                      lineHeight: 1,
                      color: 'var(--ms-color-primary)',
                      opacity: 0.32,
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
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
