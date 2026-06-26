import { Button, Popover } from '@magic-scope/react';

export default function Demo() {
  return (
    <Popover placement="bottom" trigger={<Button>更多操作 ✦</Button>}>
      <div style={{ display: 'grid', gap: '0.25rem', minInlineSize: '12rem' }}>
        <strong style={{ fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>法术操作</strong>
        <Button variant="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
          施放
        </Button>
        <Button variant="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
          重新铭刻
        </Button>
        <Button variant="ghost" size="sm" style={{ justifyContent: 'flex-start' }}>
          移出法术书
        </Button>
      </div>
    </Popover>
  );
}
