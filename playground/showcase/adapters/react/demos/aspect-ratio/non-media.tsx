import { AspectRatio } from '@magic-scope/react';

/**
 * 对抗性:比例盒里塞非媒体内容 —— 超长无空格串 + 巨量文本。
 * clip 把溢出裁在盒内、比例不被撑破;内部自行滚动消化超量文字,布局不抖。
 * 焦点环:链接放在带 padding 的内层,outline 不被 overflow 裁掉。
 */
const LONG_TOKEN = 'ABRACADABRA-'.repeat(24);
const LONG_TEXT =
  '这是一段用于压力测试的超长正文,会沿着容器持续向下延伸,反复堆叠以验证溢出处理。'.repeat(20);

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <AspectRatio
        ratio="16 / 9"
        rounded="md"
        clip
        style={{
          background: 'var(--ms-color-bg-subtle)',
          border: '1px solid var(--ms-color-border)',
        }}
      >
        <div
          style={{
            inlineSize: '100%',
            blockSize: '100%',
            overflow: 'auto',
            padding: 'var(--ms-space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ms-space-2)',
          }}
        >
          <strong style={{ overflowWrap: 'anywhere' }}>{LONG_TOKEN}</strong>
          <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
            {LONG_TEXT}
          </p>
          <a href="#aspect-ratio-anchor" style={{ color: 'var(--ms-color-accent)' }}>
            盒内可聚焦链接(焦点环不被裁切)
          </a>
        </div>
      </AspectRatio>
    </div>
  );
}
