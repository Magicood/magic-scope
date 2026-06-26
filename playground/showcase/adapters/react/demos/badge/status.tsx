import { Badge } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
      <Badge tone="success" variant="solid">
        ● 在线
      </Badge>
      <Badge tone="warning" variant="soft">
        待审核
      </Badge>
      <Badge tone="danger" variant="outline">
        已停用
      </Badge>
      <Badge tone="neutral" variant="soft">
        草稿
      </Badge>
      <Badge tone="accent" variant="solid">
        99+
      </Badge>
      <Badge tone="primary" variant="soft">
        v2.0
      </Badge>
    </div>
  );
}
