import { Mark } from '@magic-scope/react';

// 匹配规则:caseSensitive 区分大小写、wholeWord 整词边界。
// 对照展示同一段文本在不同开关下的命中差异。
const TEXT = 'Magic 与 magic 大小写不同;magical 含 magic 但整词匹配下不命中。';

function Row({ label, node }: { label: string; node: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: '0.2rem' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
      <p style={{ lineHeight: 1.9, margin: 0 }}>{node}</p>
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.7rem', maxInlineSize: 'min(560px, 100%)' }}>
      <Row
        label="默认:不区分大小写、不限整词 —— Magic / magic / magical 中的 magic 全命中"
        node={
          <Mark search="magic" tone="primary">
            {TEXT}
          </Mark>
        }
      />
      <Row
        label="caseSensitive:只命中小写 magic,Magic 不染色"
        node={
          <Mark search="magic" caseSensitive tone="success">
            {TEXT}
          </Mark>
        }
      />
      <Row
        label="wholeWord:整词边界,magical 内嵌的 magic 不命中"
        node={
          <Mark search="magic" wholeWord tone="danger">
            {TEXT}
          </Mark>
        }
      />
    </div>
  );
}
