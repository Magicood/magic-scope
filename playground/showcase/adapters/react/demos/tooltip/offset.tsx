import { Button, Tooltip } from '@magic-scope/react';

// offset:气泡与 trigger 的间距(像素)。对比默认 8 与拉大到 16。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <Tooltip content="默认间距 offset=8" offset={8}>
        <Button variant="outline">offset 8</Button>
      </Tooltip>
      <Tooltip content="拉大间距 offset=16" offset={16} arrow>
        <Button variant="outline">offset 16</Button>
      </Tooltip>
    </div>
  );
}
