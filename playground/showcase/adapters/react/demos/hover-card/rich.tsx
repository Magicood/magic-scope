import { Avatar, Button, HoverCard } from '@magic-scope/react';

// 富交互卡:头像触发,卡内放头像 / 简介 / 可点按钮;指针可移入卡内操作(桥接宽限)。
export default function Demo() {
  return (
    <HoverCard openDelay={200}>
      <HoverCard.Trigger>
        <span style={{ display: 'inline-flex', cursor: 'pointer' }}>
          <Avatar name="Grace Hopper" />
        </span>
      </HoverCard.Trigger>
      <HoverCard.Content placement="bottom" tone="primary" arrow>
        <div style={{ display: 'grid', gap: '0.6rem', maxInlineSize: '260px' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <Avatar name="Grace Hopper" />
            <div>
              <strong>Grace Hopper</strong>
              <div style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.8rem' }}>
                @amazing-grace
              </div>
            </div>
          </div>
          <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
            编译器先驱,发明了第一个链接器。“最危险的一句话是:我们一直都这么做。”
          </p>
          <Button size="sm" variant="soft">
            关注
          </Button>
        </div>
      </HoverCard.Content>
    </HoverCard>
  );
}
