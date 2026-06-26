import { Empty } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
      <Empty image="default" description="default 插画" />
      <Empty image="simple" description="simple 插画" />
      <Empty image="default" tone="primary" description="primary 色调" />
      <Empty image="simple" tone="success" description="success 色调" />
    </div>
  );
}
