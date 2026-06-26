import type { TransferItem } from '@magic-scope/react';
import { Transfer } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const dataSource: TransferItem[] = [
  { key: 'read', title: '读取 read' },
  { key: 'write', title: '写入 write' },
  { key: 'delete', title: '删除 delete' },
  { key: 'publish', title: '发布 publish' },
  { key: 'audit', title: '审计 audit' },
  { key: 'root', title: '超级管理员 root(锁定)', disabled: true },
];

function Playground({ values }: { values: ControlValues }) {
  const [targetKeys, setTargetKeys] = useState<string[]>(['read']);
  return (
    <Transfer
      dataSource={dataSource}
      targetKeys={targetKeys}
      onChange={setTargetKeys}
      titles={['可分配权限', '已授予']}
      showSearch={values.showSearch as boolean}
      oneWay={values.oneWay as boolean}
      disabled={values.disabled as boolean}
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/transfer/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/transfer/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'transfer',
  Playground,
  demos: buildDemos(comps, reactSources),
};
