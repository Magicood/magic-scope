import { Spinner } from '@magic-scope/react';

// 可见旁注:showLabel 把无障碍 label 同时渲染为文字,labelPlacement 定位,
// labelContent 用自定义节点替换可见文本(aria-label 仍用 label 保证读屏语义)。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Spinner showLabel label="加载中" labelPlacement="end" />
      <Spinner showLabel label="上传中" labelPlacement="bottom" />
      <Spinner label="下载进度" labelContent={<strong>82%</strong>} labelPlacement="end" />
    </div>
  );
}
