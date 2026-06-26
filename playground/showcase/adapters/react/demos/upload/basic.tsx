import { Upload } from '@magic-scope/react';

// 最朴素的用法:不接 customRequest,组件只做「选文件 + 客户端展示」,
// 文件停在 pending(○)态——证明组件本身不内置任何网络请求,传输权交给用户。
export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <Upload aria-label="基础上传" />
      <p
        style={{
          marginBlock: 'var(--ms-space-3) 0',
          color: 'var(--ms-color-fg-muted)',
          fontSize: '0.82rem',
        }}
      >
        点击或拖拽文件进虚线区。未接 customRequest 时,文件仅选入列表(pending),不发起任何上传。
      </p>
    </div>
  );
}
