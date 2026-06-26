import { Result } from '@magic-scope/react';

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
      }}
    >
      <Result status="success" title="施法成功" subtitle="奥术回路已稳定,法术效果已生效。" />
      <Result status="error" title="施法失败" subtitle="法力涌流中断,请检查符文锚点后重试。" />
      <Result status="info" title="仪式待确认" subtitle="结界尚未激活,确认无误后再开始仪式。" />
      <Result
        status="warning"
        title="法力储备偏低"
        subtitle="当前法力低于 20%,谨慎施放高阶法术。"
      />
    </div>
  );
}
