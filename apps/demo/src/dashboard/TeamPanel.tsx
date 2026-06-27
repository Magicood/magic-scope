import { Avatar, Button, Switch, Tag, Text } from '@magic-scope/react';
import { useState } from 'react';
import { type Member, members } from '../data/content';

type RoleTone = 'primary' | 'neutral' | 'info';

const roleTone: Record<Member['role'], RoleTone> = {
  管理员: 'primary',
  成员: 'neutral',
  只读: 'info',
};

export function TeamPanel() {
  const [active, setActive] = useState<boolean[]>(() => members.map((member) => member.active));

  const toggle = (index: number) => {
    setActive((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <div
      className="v-panel"
      style={{
        display: 'grid',
        gap: 'var(--ms-space-5)',
        padding: 'var(--ms-space-6)',
      }}
    >
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--ms-space-3)',
        }}
      >
        <Text as="h2" size="lg" weight="semibold" style={{ minInlineSize: 0 }}>
          团队成员
        </Text>
        <Button
          size="sm"
          variant="soft"
          onClick={() => {
            window.alert('邀请链接已复制');
          }}
        >
          邀请成员
        </Button>
      </header>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
        }}
      >
        {members.map((member, index) => (
          <li
            key={member.email}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ms-space-4)',
              paddingBlock: 'var(--ms-space-4)',
              borderTop: index === 0 ? 'none' : '1px solid var(--ms-color-border)',
            }}
          >
            <Avatar name={member.name} size="md" />

            <div
              style={{
                display: 'grid',
                gap: '0.1rem',
                minInlineSize: 0,
                flex: '1 1 auto',
              }}
            >
              <Text weight="semibold" truncate style={{ overflowWrap: 'anywhere' }}>
                {member.name}
              </Text>
              <Text
                size="sm"
                truncate
                style={{
                  color: 'var(--ms-color-fg-muted)',
                  overflowWrap: 'anywhere',
                }}
              >
                {member.email}
              </Text>
            </div>

            <Tag tone={roleTone[member.role]} variant="soft" size="sm">
              {member.role}
            </Tag>

            <Switch
              checked={active[index]}
              onChange={() => toggle(index)}
              tone="success"
              size="sm"
              aria-label={`${member.name} 启用`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
