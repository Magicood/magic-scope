import type { DescriptionsItem } from '@magic-scope/react';
import { Descriptions } from '@magic-scope/react';

/**
 * 对抗性用例:超长不换行串 / 巨量文本 / 空值占位 / 超长标签 / 含可聚焦链接,
 * 验证内容不撑破网格、长串可换行、空值落占位短横、焦点环不被裁切。
 */
const longToken =
  'msp://artifact/0xDEADBEEFCAFEBABE-9f3c1a72b4e85d60f1a293c47e8b0d5612fa9c3e0b7d4859/seal';

const longText =
  '这是一段刻意写得很长的说明文本,用来检验内容格在巨量文本下能否正常折行而不把整张描述列表的网格列宽撑破——' +
  'it should wrap gracefully across multiple lines without overflowing its grid cell, ' +
  '即使中英文混排、夹杂长串与标点也应保持每列宽度稳定。'.repeat(2);

const items: DescriptionsItem[] = [
  { key: 'token', label: '资源句柄', value: longToken },
  { key: 'empty', label: '空字段(占位短横)', value: '' },
  {
    key: 'longlabel',
    label: '一个被刻意写得相当长的标签名用于检验标签格在窄列下的折行表现',
    value: '正常值',
  },
  {
    key: 'link',
    label: '溯源链接',
    value: (
      <a href="#descriptions" style={{ color: 'var(--ms-color-accent, #a78bfa)' }}>
        查看截图来源(焦点环不应被裁切)
      </a>
    ),
  },
  { key: 'note', label: '长段注解', value: longText, span: 2 },
];

export default function Demo() {
  return (
    <Descriptions
      items={items}
      title="边界用例"
      columns={2}
      bordered
      style={{ inlineSize: 'min(560px, 100%)' }}
    />
  );
}
