import { Tag } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Tag tone="primary">primary</Tag>
      <Tag tone="accent">accent</Tag>
      <Tag tone="success">success</Tag>
      <Tag tone="warning">warning</Tag>
      <Tag tone="danger">danger</Tag>
      <Tag tone="neutral">neutral</Tag>
    </div>
  );
}
