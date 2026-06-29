import { Accordion } from '@magic-scope/react';

// 对抗性内容:超长无空格标题串与巨量正文应被收在面板边界内,不撑破布局、不裁焦点环。
const HUGE_TITLE = '一个刻意写得很长的标题用于压力测试'.repeat(8);
const HUGE_WORD = 'Supercalifragilisticexpialidocious'.repeat(6);
const HUGE_BODY =
  '这是一段刻意写得很长的说明文字,用来验证多行正文会在面板内自动换行而非溢出容器。'.repeat(8);

export default function Demo() {
  return (
    <Accordion
      type="single"
      defaultValue="overflow"
      items={[
        {
          value: 'overflow',
          title: HUGE_TITLE,
          content: (
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <p style={{ margin: 0, overflowWrap: 'anywhere' }}>{HUGE_WORD}</p>
              <p style={{ margin: 0 }}>{HUGE_BODY}</p>
            </div>
          ),
        },
        {
          value: 'normal',
          title: '普通项 Normal',
          content: '相邻的正常项,展开/收起不受超长项影响。',
        },
      ]}
    />
  );
}
