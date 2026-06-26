import type { TransferItem } from '@magic-scope/react';
import { Transfer } from '@magic-scope/react';

const dataSource: TransferItem[] = [
  { key: 'arcane', title: 'Arcane 奥术' },
  { key: 'frost', title: 'Frost 霜寒' },
  { key: 'ember', title: 'Ember 余烬' },
  { key: 'storm', title: 'Storm 风暴' },
  { key: 'void', title: 'Void 虚空' },
];

export default function Demo() {
  // 非受控:用 defaultTargetKeys 给初始右栏,移动状态由组件内部自管,无需外部 useState。
  return (
    <Transfer
      dataSource={dataSource}
      defaultTargetKeys={['frost']}
      titles={['候选法术', '已装配']}
    />
  );
}
