import { Alert } from '@magic-scope/react';

export default function Demo() {
  return (
    <Alert variant="info" style={{ maxInlineSize: 'min(32rem, 100%)' }}>
      <strong style={{ display: 'block', marginBlockEnd: '0.25rem' }}>
        超长内容边界:overflow-wrap-anywhere-才能让这串没有任何空格的咒文锚点哈希值在容器内换行而不撑破布局
      </strong>
      <span>
        arcane://incantation/0xDEADBEEFCAFEBABE0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-no-spaces-at-all-keeps-going-and-going-and-going-until-it-must-wrap
        正文同样塞入巨量文本以验证多行换行不丢内容:奥术回路在高负载下需要持续监控法力涌流、符文锚点、结界完整度与虚空裂隙稳定性,任何一项越界都应在此处可读地展开,既不裁切焦点环,也不溢出组件边界,保证信息密度与可访问性。
      </span>
    </Alert>
  );
}
