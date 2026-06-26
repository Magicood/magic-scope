import { Blockquote } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: 'min(560px, 100%)' }}>
      <Blockquote variant="bordered">bordered:左强调条读 tone 槽位,语义引用的默认形态。</Blockquote>
      <Blockquote variant="filled">filled:柔底块,读 --ms-c-soft,适合需要面积感的引述。</Blockquote>
      <Blockquote variant="card">card:卡片化容器,带边框与底色,自成一块。</Blockquote>
      <Blockquote variant="plain">plain:纯文字,无色块不染色,只保留引用语义与缩进。</Blockquote>
    </div>
  );
}
