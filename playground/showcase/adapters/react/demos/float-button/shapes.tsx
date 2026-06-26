import { FloatButton } from '@magic-scope/react';

// 上传箭头图标,纯装饰。
function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

// 形状(circle / square)× 类型(default / primary)矩阵。
// 方形 + description 文字:超长自动截断不撑破布局。
export default function Demo() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--ms-space-6)',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
      }}
    >
      <FloatButton shape="circle" icon={<UploadIcon />} aria-label="圆形" />
      <FloatButton shape="circle" type="primary" icon={<UploadIcon />} aria-label="圆形主色" />
      <FloatButton
        shape="square"
        icon={<UploadIcon />}
        description="上传"
        aria-label="方形带文字"
      />
      <FloatButton
        shape="square"
        type="primary"
        icon={<UploadIcon />}
        description="导出报告"
        aria-label="方形主色带超长文字"
      />
    </div>
  );
}
