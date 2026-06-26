import { Alert } from '@magic-scope/react';

// icon 图标列三态:不传按 variant 给默认符文;传 ReactNode 覆盖为自定义符文;
// 传 false 完全关闭图标列(正文左对齐占满)。
export default function Demo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxInlineSize: 'min(32rem, 100%)',
      }}
    >
      <Alert variant="info" title="默认符文">
        不传 icon,按 variant 自动给出语义符文。
      </Alert>
      <Alert variant="success" title="自定义符文" icon={<span aria-hidden="true">✦</span>}>
        传入 ReactNode 覆盖默认图标,可换成任意奥术符号。
      </Alert>
      <Alert variant="warning" title="关闭图标列" icon={false}>
        传 icon={'{false}'} 完全移除图标槽,正文占满整行。
      </Alert>
    </div>
  );
}
