import { Paragraph } from '@magic-scope/react';
import { useState } from 'react';

// 多行省略 ellipsis:true 单行尾省略;对象 { rows, expandable } 多行 clamp + 「展开/收起」。
// expandable 时组件内置切换按钮,onExpandChange 把状态回调给外部(这里同步到一行提示)。
const ARTICLE =
  '良好的入门文档,第一步从不是罗列功能,而是说清楚这个产品要帮用户解决什么问题。先交代使用场景,再给出最短可用的上手路径,让新用户在几分钟内跑通一个完整流程。许多团队急于堆砌参数说明,却忘了文档真正的价值在于降低理解成本,而不是穷举每一个选项。';

export default function Demo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ display: 'grid', gap: '1.1rem', maxInlineSize: 'min(520px, 100%)' }}>
      {/* 单行尾部省略(true 速记) */}
      <Paragraph ellipsis>{`单行尾部省略 · ${ARTICLE}`}</Paragraph>

      {/* 固定两行 clamp,不带展开 */}
      <Paragraph ellipsis={{ rows: 2 }}>{`两行省略 · ${ARTICLE}`}</Paragraph>

      {/* 三行 clamp + 可展开/收起,回调同步状态 */}
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <Paragraph ellipsis={{ rows: 3, expandable: true }} onExpandChange={setExpanded}>
          {ARTICLE}
        </Paragraph>
        <Paragraph size="xs" dimmed>
          当前状态:{expanded ? '已展开' : '已收起'}
        </Paragraph>
      </div>
    </div>
  );
}
