import type { BadgeTone } from '@magic-scope/react';
import { Badge } from '@magic-scope/react';

// 尺寸 / 圆点 / 脉冲:size 随密度缩放;dot 为纯圆点徽标(无文字)仅 tone 着色;
// pulse 叠加呼吸动效(受 --ms-motion-scale 门控,可一键降级);glow 变体为发光实底。
const DOT_TONES: BadgeTone[] = ['success', 'warning', 'danger', 'info', 'neutral'];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
        <Badge size="sm" tone="primary">
          sm 紧凑
        </Badge>
        <Badge size="md" tone="primary">
          md 默认
        </Badge>
        <Badge size="md" variant="glow" tone="accent">
          glow 发光
        </Badge>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
        {DOT_TONES.map((tone) => (
          <Badge key={tone} dot tone={tone} aria-label={`${tone} 状态`} />
        ))}
        <Badge dot pulse tone="success" aria-label="在线(脉冲)" />
        <Badge dot pulse tone="danger" aria-label="告警(脉冲)" />
      </div>
    </div>
  );
}
