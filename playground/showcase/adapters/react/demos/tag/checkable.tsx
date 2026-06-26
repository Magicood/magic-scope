import { Tag } from '@magic-scope/react';
import { useState } from 'react';

const SCHOOLS = ['塑能', '咒法', '惑控', '防护', '预言'];

export default function Demo() {
  const [picked, setPicked] = useState<string[]>(['塑能', '惑控']);

  const toggle = (school: string) =>
    setPicked((prev) =>
      prev.includes(school) ? prev.filter((s) => s !== school) : [...prev, school],
    );

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {SCHOOLS.map((school) => (
        <Tag
          key={school}
          tone="primary"
          checkable
          selected={picked.includes(school)}
          onClick={() => toggle(school)}
        >
          {school}
        </Tag>
      ))}
    </div>
  );
}
