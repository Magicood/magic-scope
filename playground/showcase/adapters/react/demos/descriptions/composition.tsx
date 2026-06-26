import { Descriptions } from '@magic-scope/react';

/**
 * 复合子组件入口:用 Descriptions.Item 表达每一项,value 可直接写 JSX。
 * columns 传响应式断点对象:窄屏 1 列、md 2 列、lg 3 列(随屏重排)。
 */
export default function Demo() {
  return (
    <Descriptions
      title="法杖详情"
      columns={{ base: 1, md: 2, lg: 3 }}
      bordered
      size="sm"
      style={{ inlineSize: 'min(680px, 100%)' }}
    >
      <Descriptions.Item label="名称" value="星界回响法杖" />
      <Descriptions.Item label="品质">
        <span style={{ color: 'var(--ms-color-accent, #a78bfa)', fontWeight: 600 }}>传说</span>
      </Descriptions.Item>
      <Descriptions.Item label="属性强化" value="奥术 +24%" />
      <Descriptions.Item label="镶嵌">
        <span style={{ display: 'inline-flex', gap: '0.35rem' }}>
          <span>寒霜符文</span>
          <span aria-hidden>·</span>
          <span>聚能符文</span>
        </span>
      </Descriptions.Item>
      <Descriptions.Item label="耐久" value="—" />
      {/* span 跨满整行 */}
      <Descriptions.Item label="特效" span={3}>
        施法后 20% 概率触发「奥术回响」,免费再次释放上一个法术。
      </Descriptions.Item>
    </Descriptions>
  );
}
