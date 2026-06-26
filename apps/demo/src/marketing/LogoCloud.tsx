import { Reveal } from '../components/Reveal';
import { logos } from '../data/content';

export function LogoCloud() {
  return (
    <section className="v-section--tight">
      <div className="v-container">
        <Reveal>
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.85rem',
              letterSpacing: 'var(--ms-tracking-wide, 0.02em)',
              color: 'var(--ms-color-fg-subtle)',
              marginBlockEnd: '1.75rem',
            }}
          >
            正在为 4,200+ 现代团队提供数据支撑
          </p>
        </Reveal>
        <Reveal delay={80}>
          <div className="v-logos">
            {logos.map((name) => (
              <span key={name} className="v-logos__item">
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
