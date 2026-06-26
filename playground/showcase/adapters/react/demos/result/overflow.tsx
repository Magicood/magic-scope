import { Result } from '@magic-scope/react';

export default function Demo() {
  return (
    <Result
      status="error"
      title="错误:arcane://incantation/0xDEADBEEFCAFEBABE0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-no-spaces-at-all-keeps-going"
      subtitle="这串没有任何空格的咒文锚点哈希值必须在容器内换行而不撑破布局,正文同样塞入巨量文本以验证多行换行不丢内容:奥术回路在高负载下需要持续监控法力涌流、符文锚点、结界完整度与虚空裂隙稳定性,任何一项越界都应在此处可读地展开,既不裁切图标也不溢出组件边界,保证信息密度与可访问性。"
      style={{ maxInlineSize: 'min(28rem, 100%)' }}
    >
      <code style={{ wordBreak: 'break-all', fontSize: '0.8rem', opacity: 0.85 }}>
        stacktrace://0xCAFEBABE/无空格超长堆栈/keeps-going-and-going-and-going-until-it-must-wrap-inside-the-content-slot-without-overflowing
      </code>
    </Result>
  );
}
