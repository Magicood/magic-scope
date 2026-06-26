import { Upload } from '@magic-scope/react';
import { useState } from 'react';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

// beforeUpload 准入钩子:返回 false 阻止入列、返回新 File 则替换(如压缩 / 改名)、
// 也可返回 Promise 做异步校验。这里:超过 2MB 直接拒,并把文件名统一加前缀演示「改写」。
export default function Demo() {
  const [rejected, setRejected] = useState<string>('');
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(440px, 100%)' }}>
      <Upload
        multiple
        beforeUpload={(file) => {
          if (file.size > MAX_BYTES) {
            setRejected(`「${file.name}」超过 2MB,已拦截`);
            return false;
          }
          setRejected('');
          // 返回新 File:给文件名加前缀(真实场景可在此压缩 / 转码)
          return new File([file], `ms-${file.name}`, { type: file.type });
        }}
        triggerText="选文件(>2MB 会被拦截)"
        hint="beforeUpload 做准入校验与改名,组件本身不碰网络"
        aria-label="准入校验上传"
      />
      {rejected && (
        <small style={{ color: 'var(--ms-color-danger-fg, var(--ms-color-fg))' }}>{rejected}</small>
      )}
    </div>
  );
}
