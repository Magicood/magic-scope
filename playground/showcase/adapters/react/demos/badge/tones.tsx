import type { BadgeTone } from '@magic-scope/react';
import { Badge } from '@magic-scope/react';

const TONES: BadgeTone[] = ['primary', 'accent', 'success', 'warning', 'danger', 'neutral'];

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {TONES.map((tone) => (
        <Badge key={tone} tone={tone}>
          {tone}
        </Badge>
      ))}
    </div>
  );
}
