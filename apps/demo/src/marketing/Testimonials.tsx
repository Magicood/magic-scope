import { Avatar, Heading, RevealGroup, Text } from '@magic-scope/react';
import { testimonials } from '../data/content';

export function Testimonials() {
  return (
    <section id="testimonials" className="v-section">
      <div className="v-container">
        <div className="v-section-head v-section-head--center">
          <span className="v-eyebrow">客户怎么说</span>
          <Heading
            level={2}
            className="v-section-head__title"
            style={{
              fontSize: 'clamp(1.6rem, 1rem + 2vw, 2.25rem)',
              fontWeight: 'var(--ms-font-weight-semibold)',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            被认真做数据的团队信任
          </Heading>
        </div>

        {/* 口碑卡:fade 纯淡入(不带位移)——与前面区块的 up/zoom 明显区隔,收束到安静的信任感 */}
        <RevealGroup
          variant="fade"
          stagger={70}
          amount={0.15}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))',
            gap: 'var(--ms-space-4)',
            marginBlockStart: 'var(--ms-space-8)',
          }}
        >
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="v-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ms-space-5)',
                height: '100%',
                padding: 'var(--ms-space-6)',
                margin: 0,
                minInlineSize: 0,
              }}
            >
              <Text
                as="blockquote"
                size="base"
                leading="relaxed"
                style={{
                  margin: 0,
                  color: 'var(--ms-color-fg)',
                  overflowWrap: 'anywhere',
                }}
              >
                {item.quote}
              </Text>

              <figcaption
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ms-space-3)',
                  marginBlockStart: 'auto',
                  minInlineSize: 0,
                }}
              >
                <Avatar name={item.name} size="md" />
                <div style={{ display: 'grid', gap: '0.1rem', minInlineSize: 0 }}>
                  <Text weight="semibold" truncate style={{ color: 'var(--ms-color-fg)' }}>
                    {item.name}
                  </Text>
                  <Text size="sm" truncate style={{ color: 'var(--ms-color-fg-muted)' }}>
                    {item.role}
                  </Text>
                </div>
              </figcaption>
            </figure>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
