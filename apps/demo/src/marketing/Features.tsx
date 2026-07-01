import { Heading, RevealGroup, Text } from '@magic-scope/react';
import type { ComponentType, CSSProperties, SVGProps } from 'react';
import {
  IconAlert,
  IconEvents,
  IconFunnel,
  IconOverview,
  IconSegment,
  IconTeam,
} from '../components/icons';
import { Reveal } from '../components/Reveal';
import { type Feature, features } from '../data/content';

/** 图标色系在 primary / accent 间轮换,给卡片一点节奏感。 */
type FeatureTone = 'primary' | 'accent';

/** bento 跨度:lead 卡占 4 列(主打特性)、banner 卡整行(收束条)、其余常规。 */
type SpanKind = 'wide' | 'full' | 'normal';

/** 每个特性对应一枚细线单色图标(取自统一图标集,几何、克制)。 */
const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  realtime: IconEvents,
  funnels: IconFunnel,
  alerts: IconAlert,
  segments: IconSegment,
  sql: IconOverview,
  collab: IconTeam,
};

function spanOf(feature: Feature): SpanKind {
  if (feature.id === 'realtime') return 'wide';
  if (feature.id === 'collab') return 'full';
  return 'normal';
}

export function Features() {
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

        {/* bento 网格:非对称跨度 + zoom-in 缩放揭示 + RevealGroup 错峰(一个 observer 管整网格,
            与 Hero 的 up 形成节奏对比)。lead/banner 卡制造层级,不再是六个等大方块。 */}
        <RevealGroup variant="zoom-in" stagger={70} amount={0.15} className="v-bento">
          {features.map((feature, index) => {
            const tone: FeatureTone = index % 2 === 0 ? 'primary' : 'accent';
            const toneColor =
              tone === 'accent' ? 'var(--ms-color-accent)' : 'var(--ms-color-primary)';
            const span = spanOf(feature);
            const isBanner = span === 'full';
            const Icon = ICONS[feature.id] ?? IconOverview;
            const cardClass = `v-panel v-feature${span === 'wide' ? ' v-feature--lead' : ''}${
              isBanner ? ' v-feature--banner' : ''
            }`;

            return (
              // 外层 div 作为 RevealGroup 单元(承接 zoom-in 揭示 + 网格跨度);内层 article 独立 hover
              <div key={feature.id} className="v-bento__cell" data-span={span}>
                <article className={cardClass}>
                  <div className="v-feature__head">
                    <span
                      className="v-feature__icon"
                      style={{ color: toneColor } as CSSProperties}
                      aria-hidden="true"
                    >
                      <Icon />
                    </span>
                    <Heading
                      level={3}
                      variant="subtitle"
                      wrap="balance"
                      breakWord
                      style={{ minInlineSize: 0 } as CSSProperties}
                    >
                      {feature.title}
                    </Heading>
                  </div>

                  <Text as="p" size="sm" leading="relaxed" className="v-feature__body">
                    {feature.body}
                  </Text>
                </article>
              </div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
