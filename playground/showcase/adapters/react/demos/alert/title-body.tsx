import { Alert } from '@magic-scope/react';

export default function Demo() {
  return (
    <Alert variant="warning" style={{ maxInlineSize: 'min(32rem, 100%)' }}>
      <strong style={{ display: 'block', marginBlockEnd: '0.25rem' }}>存储空间即将用尽</strong>
      <span>建议先清理历史构建产物,或升级套餐扩容后再继续。</span>
    </Alert>
  );
}
