import { Avatar, Rate } from '@magic-scope/react';
import { Reveal } from '../components/Reveal';
import { reviews } from '../data/catalog';

/** 首页「顾客评价」区块:真实评价卡片网格(2→1),错峰渐入。 */
export function Reviews() {
  return (
    <section className="db-section db-container">
      <div className="db-section-head db-section-head--center">
        <span className="db-eyebrow">真实评价</span>
        <h2
          className="db-display"
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBlockStart: '0.6rem' }}
        >
          他们的清晨
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))',
          gap: 'var(--ms-space-6, 1.5rem)',
          marginBlockStart: 'var(--ms-space-8, 2.5rem)',
        }}
      >
        {reviews.map((review, index) => (
          <Reveal key={`${review.name}-${review.date}`} delay={index * 80}>
            <figure
              className="db-card"
              style={{
                gap: 'var(--ms-space-4, 1rem)',
                padding: 'var(--ms-space-6, 1.5rem)',
                blockSize: '100%',
                margin: 0,
              }}
            >
              <Rate value={review.rating} readOnly size="sm" />

              <blockquote
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  lineHeight: 'var(--ms-leading-relaxed, 1.75)',
                  color: 'var(--ms-color-fg)',
                }}
              >
                {review.body}
              </blockquote>

              <figcaption
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ms-space-3, 0.75rem)',
                  marginBlockStart: 'auto',
                }}
              >
                <Avatar name={review.name} size="sm" />
                <span style={{ display: 'grid', minInlineSize: 0 }}>
                  <span
                    className="db-display"
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 'var(--ms-font-weight-semibold, 600)',
                    }}
                  >
                    {review.name}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--ms-color-fg-subtle)' }}>
                    {review.date}
                  </span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
