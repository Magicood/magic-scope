import { Button, Tooltip } from '@magic-scope/react';

// openDelay / closeDelay 分别控制 hover·focus 到显示、离开·失焦到隐藏的延时。
// 对比:即时弹出(openDelay 0)、慢热(openDelay 600)、悬停延迟收起(closeDelay 600)。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Tooltip content="立即弹出,无等待" openDelay={0}>
        <Button variant="outline">即时显示</Button>
      </Tooltip>
      <Tooltip content="悬停 0.6 秒后才浮现,过滤掠过" openDelay={600}>
        <Button variant="outline">慢热显示</Button>
      </Tooltip>
      <Tooltip content="离开后停留 0.6 秒再收起,便于移入气泡" closeDelay={600}>
        <Button variant="outline">延迟收起</Button>
      </Tooltip>
    </div>
  );
}
