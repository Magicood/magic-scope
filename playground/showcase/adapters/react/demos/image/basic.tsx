import { Image } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(360px, 90vw)' }}>
      <Image
        src="https://picsum.photos/id/1015/480/300"
        alt="峡谷河流"
        width={360}
        height={220}
        rounded="md"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        给定 width/height 占位,图片 cover 填充,加载中显示脉冲骨架。
      </small>
    </div>
  );
}
