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
        subtitle="你要找的页面不存在,可能已被移动或链接失效。"
        extra={<Button variant="outline">返回首页</Button>}
      />
      <Result
        status="403"
        subtitle="当前账号没有访问权限,请联系管理员授权。"
        extra={<Button variant="outline">申请权限</Button>}
      />
      <Result
        status="500"
        subtitle="服务器出了点问题,工程师已在排查,请稍后重试。"
        extra={<Button variant="solid">重试</Button>}
      />
    </div>
  );
}
