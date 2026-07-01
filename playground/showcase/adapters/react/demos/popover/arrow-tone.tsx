import { Button, Popover } from '@magic-scope/react';

// 箭头 + 间距 + 色调:arrow 指向 trigger,offset 拉开与 trigger 的间距,
// tone 染 panel 边框 / 发光 / 箭头。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Popover
        arrow
        offset={14}
        tone="accent"
        placement="top"
        trigger={<Button variant="outline">accent · offset 14</Button>}
      >
        <p style={{ margin: 0, padding: '0.4rem 0.6rem', maxInlineSize: '14rem' }}>
          arrow 箭头 + offset=14 间距 + tone=accent 染色。
        </p>
      </Popover>
      <Popover
        arrow
        tone="danger"
        placement="bottom"
        trigger={<Button variant="outline">danger</Button>}
      >
        <p style={{ margin: 0, padding: '0.4rem 0.6rem', maxInlineSize: '14rem' }}>
          tone=danger 染红色边框与箭头,用于警示类浮层。
        </p>
      </Popover>
    </div>
  );
}
