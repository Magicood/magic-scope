import { Steps } from '@magic-scope/react';

// 复合子组件入口 <Steps.Step />(与 items 二选一)+ 对抗性内容:
// 超长无空格串与长描述均不应撑破容器(组件内做了换行约束)。
export default function Demo() {
  return (
    <Steps current={1} direction="vertical" style={{ inlineSize: 'min(24rem, 100%)' }}>
      <Steps.Step
        title="超长标题对抗"
        description="AbracadabraSupercalifragilisticexpialidocious超长无空格魔咒名应自动换行而非撑破布局"
      />
      <Steps.Step
        title="长描述对抗"
        description="这是一段刻意写得很长的步骤描述文本,用于验证在受限宽度的容器里多行描述会正常折行、保持步骤项与连线对齐,而不会把整个步骤条横向撑开。"
      />
      <Steps.Step title="自定义图标" description="icon 槽位覆盖默认序号" icon="✦" />
      <Steps.Step title="收尾" description="末步不画连线" />
    </Steps>
  );
}
