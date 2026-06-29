import type { TabItem } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';

// 对抗性内容:超长无空格标签 + 巨量正文 + 超长 URL,验证 tablist 横向收住、
// 面板正文换行,不撑破布局、不裁掉焦点环。
const items: TabItem[] = [
  {
    value: 'long-label',
    label: '超长无空格标签Supercalifragilisticexpialidocious不会自动换行撑破容器',
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        标签过长时 tablist 横向溢出可滚动,标签本身不撑破容器。
      </p>
    ),
  },
  {
    value: 'wall',
    label: '巨量正文',
    content: (
      <div style={{ color: 'var(--ms-color-fg-muted)' }}>
        <p style={{ marginBlockStart: 0 }}>
          {'这是一段用于压力测试的超长正文,会持续延伸,以验证面板内的自动换行与垂直滚动表现。'.repeat(
            16,
          )}
        </p>
        <p style={{ marginBlockEnd: 0 }}>
          参考:
          https://magic-scope.example.com/docs/components/tabs?from=showcase&trace=aVeryLongUnbreakableQueryStringThatMustWrapInsteadOfOverflowing0123456789
        </p>
      </div>
    ),
  },
  {
    value: 'normal',
    label: '正常项',
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>对照:正常长度的标签与内容。</p>
    ),
  },
];

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(28rem, 100%)' }}>
      <Tabs items={items} defaultValue="long-label" />
    </div>
  );
}
