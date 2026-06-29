import { Tag } from '@magic-scope/react';
import { useState } from 'react';

const INITIAL = ['设计稿', '待评审', '前端', '高优先级'];

export default function Demo() {
  const [skills, setSkills] = useState<string[]>(INITIAL);

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {skills.length === 0 ? (
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.875rem' }}>
          标签已全部移除。
        </span>
      ) : (
        skills.map((skill) => (
          <Tag
            key={skill}
            tone="accent"
            closable
            onRemove={() => setSkills((prev) => prev.filter((s) => s !== skill))}
          >
            {skill}
          </Tag>
        ))
      )}
    </div>
  );
}
