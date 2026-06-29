import { Alert } from '@magic-scope/react';

export default function Demo() {
  return (
    <Alert variant="info" style={{ maxInlineSize: 'min(32rem, 100%)' }}>
      <strong style={{ display: 'block', marginBlockEnd: '0.25rem' }}>
        超长内容边界:overflow-wrap-anywhere-才能让这串没有任何空格的请求 ID
        哈希值在容器内换行而不撑破布局
      </strong>
      <span>
        https://api.example.com/v1/traces/0xDEADBEEFCAFEBABE0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-no-spaces-at-all-keeps-going-and-going-and-going-until-it-must-wrap
        正文同样塞入巨量文本以验证多行换行不丢内容:用于压力测试的超长正文,会持续延伸以检验服务在高负载下的日志聚合、链路追踪、指标采集与告警阈值是否稳定,任何一项越界都应在此处可读地展开,既不裁切焦点环,也不溢出组件边界,保证信息密度与可访问性。
      </span>
    </Alert>
  );
}
