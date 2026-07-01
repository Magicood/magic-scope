import { RevealGroup } from '@magic-scope/react';
import { Reveal } from '../components/Reveal';
import { logos } from '../data/content';

export function LogoCloud() {
  return (
    <section className="v-section--tight">
      <div className="v-container">
        {/* Hero 收束 ↔ 商标墙之间的极淡分隔,给长滚动页一个「章节到章节」的呼吸 */}
        <hr className="v-hairline" style={{ marginBlockEnd: 'clamp(1.75rem, 3.5vw, 2.5rem)' }} />
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
        {/* logo 墙:每枚依次淡入(fade + stagger,轻量不喧宾夺主) */}
        <RevealGroup variant="fade" stagger={55} amount={0.3} className="v-logos">
          {logos.map((name) => (
            <span key={name} className="v-logos__item">
              {name}
            </span>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
