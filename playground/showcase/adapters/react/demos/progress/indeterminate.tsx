import { Progress } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ inlineSize: '100%' }}>
      <Progress indeterminate aria-label="加载中" />
    </div>
  );
}
