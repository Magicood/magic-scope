import { Center } from '@magic-scope/react';

const longWord =
  'supercalifragilisticexpialidocious超长无空格标识符节点禁止横向撑破容器必须自动换行不溢出';

const longText = `${'巨量文本压力测试:'.repeat(8)}居中盒在固定宽度下应让内容纵向流动而非把容器撑破或顶出布局。`;

// 对抗性:超长不间断串 + 巨量文本在固定宽度居中盒内仍不撑破、不裁焦点环。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.8rem', inlineSize: 'min(320px, 100%)' }}>
      <Center
        padding={4}
        style={{
          border: '1px dashed var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-md)',
          overflowWrap: 'anywhere',
          textAlign: 'center',
        }}
      >
        <span>{longWord}</span>
      </Center>

      <Center
        gap={2}
        padding={4}
        minBlockSize={120}
        style={{
          border: '1px dashed var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-md)',
          textAlign: 'center',
        }}
      >
        <strong>巨量文本</strong>
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>{longText}</span>
      </Center>

      {/* asChild 到可聚焦按钮:Tab 聚焦时焦点环完整可见,不被居中盒裁切。 */}
      <Center asChild padding={4}>
        <button
          type="button"
          style={{
            background: 'transparent',
            border: '1px dashed var(--ms-color-border)',
            borderRadius: 'var(--ms-radius-md)',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          Tab 聚焦我:焦点环不被裁
        </button>
      </Center>
    </div>
  );
}
