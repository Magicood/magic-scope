import { Button, Popconfirm } from '@magic-scope/react';

// 对抗性内容:超长无空格串 + 巨量正文,验证气泡被宽度边界收住,
// 标题长串换行不外溢、描述多行折行而非撑破容器。
const LONG_TOKEN = 'wss://api.magic-scope.dev/v3/workspaces/connections/'.repeat(4);
const LONG_TEXT =
  '此操作将永久删除该工作区及其所有项目数据,并级联清除关联的成员权限、绑定的集成回调与缓存的构建产物;删除后无法通过任何手段恢复,且会立即同步到所有团队成员。请再次确认你已知晓全部后果,并对由此产生的一切连锁影响负责。';

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
        title="确定删除该工作区?"
        description={LONG_TEXT}
        variant="danger"
        confirmText="删除"
        placement="bottom"
      />
    </div>
  );
}
