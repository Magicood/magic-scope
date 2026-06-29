import { Divider } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(28rem, 100%)', color: 'var(--ms-color-fg-muted)' }}>
      <p style={{ marginBlockStart: 0 }}>第一节·快速上手。十分钟内完成项目初始化与首次部署。</p>
      <Divider />
      <p style={{ marginBlockEnd: 0 }}>第二节·进阶配置。逐步介绍环境变量与团队协作流程。</p>
    </div>
  );
}
