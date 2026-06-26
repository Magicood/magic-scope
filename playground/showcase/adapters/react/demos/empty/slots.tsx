import { Empty } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
      <Empty size="sm" description="sm 紧凑空态" />
      <Empty size="lg" description="lg 宽松空态" />
      <Empty image={false} description="关闭插画,仅留描述" />
      <Empty description={false} image="simple" />
    </div>
  );
}
