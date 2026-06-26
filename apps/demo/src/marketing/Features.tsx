import { Heading, Tag, Text } from '@magic-scope/react';
import { useState } from 'react';
import { Reveal } from '../components/Reveal';
import { features } from '../data/content';

/** Tag 配色在 primary / accent 间轮换,给标签一点节奏感。 */
type FeatureTone = 'primary' | 'accent';

export function Features() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="features" className="v-section">
      <div className="v-container">
        <Reveal>
          <div className="v-section-head">
            <span className="v-eyebrow">为什么选 Vela</span>
            <Heading
              level={2}
              variant="display"
              wrap="balance"
              style={{ marginBlockStart: '0.75rem' }}
            >
              把数据变成习惯,
              <span className="v-gradient-text">而不是负担</span>
            </Heading>
            <p className="v-lead">
              一套连贯的能力,从实时指标到协作看板,让团队每天都能凭证据做决定。
            </p>
          </div>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gap: 'clamp(1rem, 2vw, 1.25rem)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gridAutoRows: 'minmax(0, auto)',
            marginBlockStart: 'clamp(2.5rem, 5vw, 3.5rem)',
          }}
        >
          {features.map((feature, index) => {
            const tone: FeatureTone = index % 2 === 0 ? 'primary' : 'accent';
            const isHovered = hovered === feature.id;

            return (
              <div
                key={feature.id}
                style={{
                  display: 'grid',
                  minInlineSize: 0,
                }}
              >
                <Reveal delay={index * 60}>
                  <article
                    onMouseEnter={() => setHovered(feature.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="v-panel"
                    style={{
                      blockSize: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 'var(--ms-space-3)',
                      minInlineSize: 0,
                      padding: 'clamp(1.25rem, 2.4vw, 1.75rem)',
                      borderColor: isHovered
                        ? 'var(--ms-color-border-strong, var(--ms-color-primary))'
                        : 'var(--ms-color-border)',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                      transition:
                        'transform 0.2s var(--ms-ease-standard, cubic-bezier(0.2, 0, 0, 1)), border-color 0.2s var(--ms-ease-standard, cubic-bezier(0.2, 0, 0, 1))',
                    }}
                  >
                    <Tag size="sm" variant="soft" tone={tone}>
                      {feature.tag}
                    </Tag>

                    <Heading
                      level={3}
                      variant="subtitle"
                      wrap="balance"
                      breakWord
                      style={{ minInlineSize: 0 }}
                    >
                      {feature.title}
                    </Heading>

                    <Text
                      as="p"
                      size="sm"
                      leading="relaxed"
                      style={{
                        color: 'var(--ms-color-fg-muted)',
                        overflowWrap: 'anywhere',
                        minInlineSize: 0,
                      }}
                    >
                      {feature.body}
                    </Text>
                  </article>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
