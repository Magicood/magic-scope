import { Alert } from '@magic-scope/react';

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
      <Alert variant="info">信息:已为你同步最新版本,刷新即可生效。</Alert>
      <Alert variant="success">成功:导出已完成,文件已发送到你的邮箱。</Alert>
      <Alert variant="warning">警告:存储空间已使用 80%,请及时清理。</Alert>
      <Alert variant="danger">危险:无法连接到服务器,你的更改尚未保存。</Alert>
    </div>
  );
}
