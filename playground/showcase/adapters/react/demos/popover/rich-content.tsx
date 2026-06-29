import { Button, Popover } from '@magic-scope/react';

export default function Demo() {
  return (
    <Popover placement="bottom" trigger={<Button>更多操作 ✦</Button>}>
      <div style={{ display: 'grid', gap: '0.25rem', minInlineSize: '12rem' }}>
        <strong style={{ fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>更多操作</strong>
        <Button variant="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
          重命名
        </Button>
        <Button variant="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
          复制链接
        </Button>
        <Button variant="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
          移出项目
        </Button>
      </div>
    </Popover>
  );
}
