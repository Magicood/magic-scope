import { Button, Statistic } from '@magic-scope/react';
import { Reveal } from '../components/Reveal';
import { story } from '../data/catalog';
import { navigate } from '../lib/router';

/** 首页「品牌理念」编辑带:左栏叙事 + CTA,右栏暖色数据面板。 */
export function StoryBand() {
  return (
    <section id="story" className="db-section">
      <div className="db-container">
        <Reveal>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'clamp(2rem, 5vw, 4rem)',
            }}
          >
            {/* 左栏:叙事 + CTA(1.1 份) */}
            <div style={{ flex: '1.1 1 22rem', minInlineSize: 0 }}>
              <span className="db-eyebrow">{story.eyebrow}</span>
              <h2
                className="db-display"
                style={{
                  marginBlockStart: '0.9rem',
                  fontSize: 'clamp(1.9rem, 4.5vw, 3rem)',
                  textWrap: 'balance',
                }}
              >
                {story.title}
              </h2>

              <div
                style={{
                  display: 'grid',
                  gap: '1.15rem',
                  marginBlockStart: '1.5rem',
                  maxInlineSize: '34rem',
                }}
              >
                {story.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    style={{
                      margin: 0,
                      color: 'var(--ms-color-fg-muted)',
                      lineHeight: 'var(--ms-leading-relaxed, 1.8)',
                      fontSize: 'clamp(1rem, 1.3vw, 1.075rem)',
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div style={{ marginBlockStart: '2rem' }}>
                <Button variant="outline" size="lg" onClick={() => navigate('/shop')}>
                  了解我们的故事
                </Button>
              </div>
            </div>

            {/* 右栏:温暖的数据展示面板(0.9 份) */}
            <div style={{ flex: '0.9 1 18rem', minInlineSize: 0 }}>
              <div
                className="db-card"
                style={{
                  padding: 'clamp(1.75rem, 4vw, 2.75rem)',
                  background:
                    'linear-gradient(155deg, color-mix(in oklab, var(--ms-color-primary) 12%, var(--ms-color-surface)), color-mix(in oklab, var(--ms-color-accent) 8%, var(--ms-color-surface)))',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    marginBlockEnd: '1.75rem',
                    fontFamily: 'var(--ms-font-display)',
                    fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                    lineHeight: 'var(--ms-leading-snug, 1.4)',
                    color: 'var(--ms-color-fg)',
                  }}
                >
                  把好咖啡做成一件可被追溯的小事。
                </p>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {story.stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        paddingBlockStart: index === 0 ? 0 : '1.5rem',
                        borderBlockStart: index === 0 ? 'none' : '1px solid var(--ms-color-border)',
                      }}
                    >
                      <Statistic
                        value={stat.value}
                        size="lg"
                        classNames={{ value: 'db-display' }}
                      />
                      <span
                        style={{
                          textAlign: 'end',
                          fontSize: '0.9rem',
                          lineHeight: 1.35,
                          color: 'var(--ms-color-fg-muted)',
                          textWrap: 'balance',
                        }}
                      >
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
