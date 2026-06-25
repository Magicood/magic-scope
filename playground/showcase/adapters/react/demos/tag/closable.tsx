import { Tag } from '@magic-scope/react';
import { useState } from 'react';

const INITIAL = ['奥术飞弹', '冰霜新星', '烈焰风暴', '时间停滞'];

export default function Demo() {
  const [skills, setSkills] = useState<string[]>(INITIAL);

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {skills.length === 0 ? (
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.875rem' }}>
          法术已全部移除。
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
