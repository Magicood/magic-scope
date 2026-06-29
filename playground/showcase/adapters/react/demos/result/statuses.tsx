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
      <Result status="success" title="提交成功" subtitle="数据已同步,变更立即生效。" />
      <Result status="error" title="提交失败" subtitle="网络连接中断,请检查后重试。" />
      <Result status="info" title="待确认" subtitle="操作尚未生效,确认无误后再继续。" />
      <Result
        status="warning"
        title="存储空间偏低"
        subtitle="剩余空间低于 20%,请及时清理或扩容。"
      />
    </div>
  );
}
