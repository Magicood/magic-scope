import { Paragraph } from '@magic-scope/react';
import { useState } from 'react';

// 多行省略 ellipsis:true 单行尾省略;对象 { rows, expandable } 多行 clamp + 「展开/收起」。
// expandable 时组件内置切换按钮,onExpandChange 把状态回调给外部(这里同步到一行提示)。
const ESSAY =
  '在魔法学院的第一课,导师从不教咒语,只教如何聆听。她说,世界本身就在不停地低语,风穿过回廊是一种,烛火摇曳是另一种,而你急促的呼吸,往往盖过了它们全部。真正的施法,是先学会安静,再学会回应。许多学徒急于背诵词条,却忘了词条只是容器,意图才是被装进去的东西。';

export default function Demo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ display: 'grid', gap: '1.1rem', maxInlineSize: 'min(520px, 100%)' }}>
      {/* 单行尾部省略(true 速记) */}
      <Paragraph ellipsis>{`单行尾部省略 · ${ESSAY}`}</Paragraph>

      {/* 固定两行 clamp,不带展开 */}
      <Paragraph ellipsis={{ rows: 2 }}>{`两行省略 · ${ESSAY}`}</Paragraph>

      {/* 三行 clamp + 可展开/收起,回调同步状态 */}
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <Paragraph ellipsis={{ rows: 3, expandable: true }} onExpandChange={setExpanded}>
          {ESSAY}
        </Paragraph>
        <Paragraph size="xs" dimmed>
          当前状态:{expanded ? '已展开' : '已收起'}
        </Paragraph>
      </div>
    </div>
  );
}
