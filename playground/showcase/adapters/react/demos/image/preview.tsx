import { Image } from '@magic-scope/react';

// 点击/回车任意一张图进入全屏灯箱:工具栏可缩放/旋转/还原/关闭,
// 键盘 Esc 关、+/- 缩放、r 旋转、0 还原。
const SHOTS = [
  { id: 314, alt: '雪山日照' },
  { id: 433, alt: '林中麋鹿' },
  { id: 1039, alt: '瀑布飞流' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ms-space-3)' }}>
        {SHOTS.map((s) => (
          <Image
            key={s.id}
            src={`https://picsum.photos/id/${s.id}/300/200`}
            alt={s.alt}
            width={150}
            height={104}
            rounded="md"
            preview
          />
        ))}
      </div>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        点击缩略图放大;在灯箱里用工具栏或键盘缩放、旋转。
      </small>
    </div>
  );
}
