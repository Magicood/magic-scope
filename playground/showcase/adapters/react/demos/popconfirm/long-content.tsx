import { Button, Popconfirm } from '@magic-scope/react';

// 对抗性内容:超长无空格串 + 巨量正文,验证气泡被宽度边界收住,
// 标题长串换行不外溢、描述多行折行而非撑破容器。
const LONG_TOKEN = 'wss://arcane.magic-scope.dev/v3/incantations/'.repeat(4);
const LONG_TEXT =
  '此操作将永久销毁该法术卷轴及其所有衍生符文,并级联清除关联的施法记录、绑定的奥术回路与缓存的吟唱缓冲;销毁后无法通过任何手段恢复,且会立即广播到所有订阅者。请再次确认你已知晓全部后果,并对由此产生的一切连锁反应负责。';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Popconfirm
        trigger={<Button variant="outline">超长无空格串</Button>}
        title={LONG_TOKEN}
        description="标题是一段超长无空格 URL,应在气泡内换行而非把气泡撑破。"
        placement="bottom"
      />
      <Popconfirm
        trigger={<Button variant="outline">巨量正文</Button>}
        title="确定销毁该法术卷轴?"
        description={LONG_TEXT}
        variant="danger"
        confirmText="销毁"
        placement="bottom"
      />
    </div>
  );
}
