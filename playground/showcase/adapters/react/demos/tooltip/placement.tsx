import { Button, Tooltip } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Tooltip content="出现在上方" placement="top">
        <Button variant="outline">top 上方</Button>
      </Tooltip>
      <Tooltip content="出现在下方" placement="bottom">
        <Button variant="outline">bottom 下方</Button>
      </Tooltip>
    </div>
  );
}
