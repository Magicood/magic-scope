import { Alert } from '@magic-scope/react';

export default function Demo() {
  return (
    <Alert variant="warning" style={{ maxInlineSize: 'min(32rem, 100%)' }}>
      <strong style={{ display: 'block', marginBlockEnd: '0.25rem' }}>法力即将耗尽</strong>
      <span>建议先吟唱回复咒,或饮用一瓶法力药剂再继续。</span>
    </Alert>
  );
}
