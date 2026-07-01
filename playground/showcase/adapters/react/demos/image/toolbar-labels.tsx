import { Image } from '@magic-scope/react';

// toolbarLabels:灯箱预览工具栏各按钮的 aria-label 覆盖(无障碍文案本地化)。
// 点击图片打开灯箱,工具栏的放大 / 缩小 / 旋转 / 复位 / 关闭均用自定义中文标签。
export default function Demo() {
  return (
    <Image
      src="https://picsum.photos/id/1025/240/160"
      alt="预览示例图"
      width={240}
      height={160}
      preview
      toolbarLabels={{
        zoomIn: '放大',
        zoomOut: '缩小',
        rotate: '旋转',
        reset: '复位',
        close: '关闭',
      }}
      style={{ borderRadius: 'var(--ms-radius-md)' }}
    />
  );
}
