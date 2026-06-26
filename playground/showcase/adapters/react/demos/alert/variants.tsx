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
      <Alert variant="info">信息:新版本咒文库已同步至本地缓存。</Alert>
      <Alert variant="success">成功:奥术回路校准完成,可以释放。</Alert>
      <Alert variant="warning">警告:法力储备低于 20%,谨慎施放高阶法术。</Alert>
      <Alert variant="danger">危险:检测到不稳定的虚空裂隙,立即中止仪式。</Alert>
    </div>
  );
}
