import { Result } from '@magic-scope/react';

export default function Demo() {
  return (
    <Result
      status="error"
      title="错误:https://api.example.com/v1/0xDEADBEEFCAFEBABE0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-no-spaces-at-all-keeps-going"
      subtitle="这串没有任何空格的请求哈希值必须在容器内换行而不撑破布局,正文同样塞入巨量文本以验证多行换行不丢内容:高负载下需要持续监控请求耗时、错误率、连接池占用与缓存命中率,任何一项越界都应在此处可读地展开,既不裁切图标也不溢出组件边界,保证信息密度与可访问性。"
      style={{ maxInlineSize: 'min(28rem, 100%)' }}
    >
      <code style={{ wordBreak: 'break-all', fontSize: '0.8rem', opacity: 0.85 }}>
        stacktrace://0xCAFEBABE/无空格超长堆栈/keeps-going-and-going-and-going-until-it-must-wrap-inside-the-content-slot-without-overflowing
      </code>
    </Result>
  );
}
