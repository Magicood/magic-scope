import { Tag } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Tag tone="primary" size="sm" icon="✦">
          小号 sm
        </Tag>
        <Tag tone="primary" size="md" icon="✦">
          中号 md
        </Tag>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Tag tone="success" icon="✓">
          已学会
        </Tag>
        <Tag tone="warning" icon="⚠">
          蓝耗高
        </Tag>
        <Tag tone="danger" closable closeIcon="✕">
          自定义关闭图标
        </Tag>
      </div>
    </div>
  );
}
