import { Alert } from '@magic-scope/react';

export default function Demo() {
  return (
    <Alert
      variant="danger"
      id="form-alert"
      aria-live="assertive"
      style={{ maxInlineSize: 'min(32rem, 100%)' }}
    >
      <strong style={{ display: 'block', marginBlockEnd: '0.4rem' }}>表单校验未通过</strong>
      <ul style={{ margin: 0, paddingInlineStart: '1.1rem', display: 'grid', gap: '0.2rem' }}>
        <li>邮箱地址格式不正确</li>
        <li>密码与确认密码不一致</li>
        <li>尚未勾选同意服务条款</li>
      </ul>
    </Alert>
  );
}
