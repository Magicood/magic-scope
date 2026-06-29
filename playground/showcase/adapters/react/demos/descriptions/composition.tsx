import { Descriptions } from '@magic-scope/react';

/**
 * 复合子组件入口:用 Descriptions.Item 表达每一项,value 可直接写 JSX。
 * columns 传响应式断点对象:窄屏 1 列、md 2 列、lg 3 列(随屏重排)。
 */
export default function Demo() {
  return (
    <Descriptions
      title="产品详情"
      columns={{ base: 1, md: 2, lg: 3 }}
      bordered
      size="sm"
      style={{ inlineSize: 'min(680px, 100%)' }}
    >
      <Descriptions.Item label="名称" value="Pro 协作套件" />
      <Descriptions.Item label="状态">
        <span style={{ color: 'var(--ms-color-accent, #a78bfa)', fontWeight: 600 }}>已上线</span>
      </Descriptions.Item>
      <Descriptions.Item label="计费方式" value="按年订阅" />
      <Descriptions.Item label="标签">
        <span style={{ display: 'inline-flex', gap: '0.35rem' }}>
          <span>团队版</span>
          <span aria-hidden>·</span>
          <span>SSO</span>
        </span>
      </Descriptions.Item>
      <Descriptions.Item label="库存" value="—" />
      {/* span 跨满整行 */}
      <Descriptions.Item label="说明" span={3}>
        续费后自动延长一年,到期前 30 天发送提醒邮件,可随时在设置中取消。
      </Descriptions.Item>
    </Descriptions>
  );
}
