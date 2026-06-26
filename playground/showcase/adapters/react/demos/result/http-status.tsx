import { Button, Result } from '@magic-scope/react';

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
      }}
    >
      {/* HTTP 异常不传 title 时,自动给默认标题(404→页面不存在)。 */}
      <Result
        status="404"
        subtitle="你要找的传送门不在此处,可能已被回收或链接失效。"
        extra={<Button variant="outline">返回首页</Button>}
      />
      <Result
        status="403"
        subtitle="当前法师等级不足以进入这片秘境,请联系大贤者授权。"
        extra={<Button variant="outline">申请权限</Button>}
      />
      <Result
        status="500"
        subtitle="奥术服务器陷入混沌,工程法师已在抢修,请稍后重试。"
        extra={<Button variant="solid">重试</Button>}
      />
    </div>
  );
}
