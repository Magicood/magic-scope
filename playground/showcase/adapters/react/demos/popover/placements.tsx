import { Button, Popover } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Popover placement="top" trigger={<Button variant="ghost">top</Button>}>
        上方浮层
      </Popover>
      <Popover placement="bottom" trigger={<Button variant="ghost">bottom</Button>}>
        下方浮层
      </Popover>
      <Popover placement="left" trigger={<Button variant="ghost">left</Button>}>
        左侧浮层
      </Popover>
      <Popover placement="right" trigger={<Button variant="ghost">right</Button>}>
        右侧浮层
      </Popover>
    </div>
  );
}
