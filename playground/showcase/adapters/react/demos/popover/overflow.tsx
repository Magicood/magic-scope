import { Button, Popover } from '@magic-scope/react';

export default function Demo() {
  return (
    <Popover placement="bottom" trigger={<Button variant="outline">超长内容 ✦</Button>}>
      <div style={{ display: 'grid', gap: '0.5rem', maxInlineSize: '16rem' }}>
        <strong
          style={{
            fontSize: '0.85rem',
            overflowWrap: 'anywhere',
          }}
        >
          超长无空格串:仍被收在浮层边界内,断行而不撑破。
        </strong>
        <code
          style={{
            fontSize: '0.78rem',
            color: 'var(--ms-color-fg-muted)',
            overflowWrap: 'anywhere',
          }}
        >
          urn:magic-scope:spell:teleportation-circle-of-the-arcane-sanctum-0xDEADBEEFCAFEBABE0123456789ABCDEF
        </code>
        <p
          style={{
            margin: 0,
            fontSize: '0.82rem',
            color: 'var(--ms-color-fg-muted)',
            lineHeight: 1.6,
          }}
        >
          巨量正文也照常多行换行铺开:这段说明刻意写得很长很长,用来验证浮层在承载用户内容时,
          会以最大宽度约束自然换行,内容向下生长而非横向撑破容器,触发器的方位贴合与圆角边框始终完整。
        </p>
      </div>
    </Popover>
  );
}
