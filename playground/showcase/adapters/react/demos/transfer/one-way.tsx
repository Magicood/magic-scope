import type { TransferItem } from '@magic-scope/react';
import { Transfer } from '@magic-scope/react';
import { useState } from 'react';

// 单向模式:只保留「左→右」方向按钮,右栏不显示移回控件。
// 适合「一旦加入即不可撤销」的归集场景(如收件人加入群发列表)。
const dataSource: TransferItem[] = [
  { key: 'alice', title: 'Alice 爱丽丝' },
  { key: 'bob', title: 'Bob 鲍勃' },
  { key: 'carol', title: 'Carol 卡萝' },
  { key: 'dave', title: 'Dave 戴夫' },
  { key: 'erin', title: 'Erin 艾琳' },
];

export default function Demo() {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  return (
    <Transfer
      dataSource={dataSource}
      targetKeys={targetKeys}
      onChange={setTargetKeys}
      oneWay
      titles={['通讯录', '群发名单']}
    />
  );
}
