import { Link } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.9rem', inlineSize: 'min(360px, 90vw)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center' }}>
        <Link href="#" glow="always" underline="hover">
          glow 常亮微光
        </Link>
        <Link href="#" disabled>
          禁用链接
        </Link>
      </div>
      {/* 对抗性:超长无空格串应在容器内换行/截断,不撑破布局 */}
      <Link href="#" external style={{ minWidth: 0 }}>
        https://grimoire.arcane.example.com/spellbook/teleportation-circle?ref=showcase&token=verylongtokenwithoutanyspaces1234567890abcdefghijklmnop
      </Link>
    </div>
  );
}
