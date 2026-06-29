import { Spinner } from '@magic-scope/react';

const LONG_WORD = '正在同步超长数据集-supercalifragilisticexpialidocious-跨区域增量拉取0123456789';

const LONG_TEXT =
  '正在加载海量数据索引,这条说明很长很长用来验证多行正文会自然换行而不会把旋转器挤变形或撑破容器边界,旋转器始终保持原始尺寸与发光焦点环完整不被裁切。';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(300px, 100%)' }}>
      {/* 单行紧凑:超长无空格串用省略号收住,旋转器不被压缩 */}
      <span
        style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', minInlineSize: 0 }}
      >
        <Spinner size="sm" label="加载中" />
        <span
          style={{
            color: 'var(--ms-color-fg-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minInlineSize: 0,
          }}
        >
          {LONG_WORD}
        </span>
      </span>
      {/* 多行正文:巨量文本自然换行,旋转器顶端对齐保持完整 */}
      <span
        style={{
          display: 'inline-flex',
          gap: '0.5rem',
          alignItems: 'flex-start',
          minInlineSize: 0,
        }}
      >
        <Spinner size="sm" label="加载中" />
        <span
          style={{ color: 'var(--ms-color-fg-muted)', overflowWrap: 'anywhere', minInlineSize: 0 }}
        >
          {LONG_TEXT}
        </span>
      </span>
    </div>
  );
}
