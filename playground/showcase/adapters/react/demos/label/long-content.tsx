import { Input, Label } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(320px, 80vw)' }}>
      {/* 超长无空格串:不撑破容器,在边界内换行 */}
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <Label htmlFor="ms-label-long-url" required style={{ overflowWrap: 'anywhere' }}>
          回调地址https://api.example.com/v1/webhooks/deploy?token=超长无空格链接不该撑破布局a1b2c3d4e5f6g7h8
        </Label>
        <Input id="ms-label-long-url" placeholder="目标地址" aria-required />
      </div>

      {/* 巨量正文:多行换行,星号始终贴在文末 */}
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <Label htmlFor="ms-label-long-text" required>
          这是一段刻意写得很长很长的标签说明用来验证当标签文案远超一行宽度时是否能在容器内正常换行而不会溢出撑破布局并且必填星号要始终贴在整段文字的末尾
        </Label>
        <Input id="ms-label-long-text" placeholder="随便填" aria-required />
      </div>
    </div>
  );
}
