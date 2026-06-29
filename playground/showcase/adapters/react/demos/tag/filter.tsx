import type { TagTone } from '@magic-scope/react';
import { Tag } from '@magic-scope/react';
import { useState } from 'react';

const SCHOOLS = ['全部', '进行中', '已完成', '已归档'];

export default function Demo() {
  const [active, setActive] = useState<string>('全部');

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {SCHOOLS.map((school) => {
        const selected = active === school;
        return (
          <Tag
            key={school}
            tone={(selected ? 'primary' : 'neutral') as TagTone}
            title={`按「${school}」状态过滤`}
            onClick={() => setActive(school)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {school}
          </Tag>
        );
      })}
    </div>
  );
}
