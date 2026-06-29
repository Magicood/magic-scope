import { Tag } from '@magic-scope/react';
import { useState } from 'react';

const SCHOOLS = ['前端', '后端', '设计', '产品', '运维'];

export default function Demo() {
  const [picked, setPicked] = useState<string[]>(['前端', '设计']);

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
