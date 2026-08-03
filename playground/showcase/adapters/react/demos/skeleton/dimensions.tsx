import { Skeleton } from '@magic-scope/react';

// 便捷尺寸与多行:width/height 直接给宽高,lines 排多行文本骨架(末行自动收窄),animation 切动画类型。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(320px, 100%)' }}>
      <Skeleton width={240} height={16} animation="wave" />
      <Skeleton width="60%" height={16} animation="pulse" />
      <Skeleton lines={4} animation="shimmer" />
    </div>
  );
}
