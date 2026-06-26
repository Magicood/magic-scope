import type { TransferItem } from '@magic-scope/react';
import { Transfer } from '@magic-scope/react';
import { useState } from 'react';

// 较长的数据集,演示 showSearch:两栏各带搜索框,
// 全选只作用于「当前可见(已过滤)」的项,绝不波及被搜索隐藏的项。
const dataSource: TransferItem[] = Array.from({ length: 18 }, (_, i) => ({
  key: `field-${i}`,
  title: `字段 column_${String(i).padStart(2, '0')}`,
}));

export default function Demo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(['field-01', 'field-05', 'field-12']);
  return (
    <Transfer
      dataSource={dataSource}
      targetKeys={targetKeys}
      onChange={setTargetKeys}
      showSearch
      titles={['全部字段', '导出字段']}
    />
  );
}
