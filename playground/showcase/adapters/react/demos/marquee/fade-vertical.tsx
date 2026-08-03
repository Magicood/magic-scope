import { Marquee } from '@magic-scope/react';

// 纵向 vertical + 两端淡出:gradientColor 指定遮罩色(默认跟随容器背景)、gradientWidth 遮罩宽度。
const notes = ['系统升级完成', '新增 3 个组件', 'CI 全绿', '文档已更新', '性能优化 +18%'];

export default function Demo() {
  return (
    <div style={{ blockSize: '9rem', inlineSize: 'min(280px, 100%)' }}>
      <Marquee
        vertical
        speed={28}
        gradient
        gradientColor="var(--ms-color-bg)"
        gradientWidth={36}
        aria-label="更新日志"
      >
        {notes.map((n) => (
          <div key={n} style={{ paddingBlock: '0.35rem', color: 'var(--ms-color-fg-muted)' }}>
            {n}
          </div>
        ))}
      </Marquee>
    </div>
  );
}
