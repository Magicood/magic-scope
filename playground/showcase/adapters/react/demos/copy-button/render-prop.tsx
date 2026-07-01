import { CopyButton } from '@magic-scope/react';

// render-prop children:(copied) => ReactNode 完全接管内容与文案,
// 并用 onCopy / onError 感知结果。
export default function Demo() {
  return (
    <CopyButton
      value="https://magic-scope.dev/invite/AB12CD"
      variant="outline"
      onCopy={(v) => console.log('已复制:', v)}
      onError={(e) => console.warn('复制失败:', e)}
    >
      {(copied) => (copied ? '✓ 链接已复制' : '⧉ 复制邀请链接')}
    </CopyButton>
  );
}
