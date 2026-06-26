import type { BadgeTone } from '@magic-scope/react';
import { Badge } from '@magic-scope/react';

const TONES: BadgeTone[] = ['primary', 'accent', 'success', 'warning', 'danger', 'neutral'];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {TONES.map((tone) => (
          <Badge key={tone} variant="solid" tone={tone}>
            solid
          </Badge>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {TONES.map((tone) => (
          <Badge key={tone} variant="soft" tone={tone}>
            soft
          </Badge>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {TONES.map((tone) => (
          <Badge key={tone} variant="outline" tone={tone}>
            outline
          </Badge>
        ))}
      </div>
    </div>
  );
}
