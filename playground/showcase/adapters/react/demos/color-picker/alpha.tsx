import { ColorPicker } from '@magic-scope/react';
import { useState } from 'react';

// alpha 开关:开启(默认)时面板多一条棋盘格底的透明度滑条,
// 输出可带 alpha 通道(#rrggbbaa / rgba / hsla);关闭后颜色恒不透明。
export default function Demo() {
  const [withAlpha, setWithAlpha] = useState('rgba(124, 58, 237, 0.6)');
  const [solid, setSolid] = useState('#06b6d4');
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <ColorPicker format="rgb" value={withAlpha} onChange={setWithAlpha} aria-label="带透明度" />
        <span style={{ minInlineSize: '7rem', color: 'var(--ms-color-fg-muted)' }}>
          alpha 开(默认)
        </span>
        <code style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>{withAlpha}</code>
      </div>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <ColorPicker
          alpha={false}
          format="rgb"
          value={solid}
          onChange={setSolid}
          aria-label="恒不透明"
        />
        <span style={{ minInlineSize: '7rem', color: 'var(--ms-color-fg-muted)' }}>
          alpha 关(恒不透明)
        </span>
        <code style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>{solid}</code>
      </div>
    </div>
  );
}
