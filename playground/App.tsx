import { useState } from 'react';
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Dialog,
  Divider,
  Input,
  Kbd,
  Label,
  Menu,
  Pagination,
  Popover,
  Progress,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Table,
  Tabs,
  Tag,
  Textarea,
  Tooltip,
} from '../packages/react/src/index';

const row: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  flexWrap: 'wrap',
  alignItems: 'center',
};

export function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popOpen, setPopOpen] = useState(false);
  const [sel, setSel] = useState('frost');
  const [page, setPage] = useState(2);

  return (
    <main
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem',
        display: 'grid',
        gap: '1.5rem',
        color: 'var(--ms-color-fg)',
        fontFamily: 'var(--ms-font-sans)',
      }}
    >
      <h1 style={{ fontFamily: 'var(--ms-font-display)', color: 'var(--ms-color-primary-hover)' }}>
        ✦ magic-scope playground
      </h1>

      <h2>Overlay(重点实测)</h2>
      <div style={row}>
        <Button onClick={() => setDialogOpen(true)}>打开 Dialog</Button>
        <Tooltip content="奥术提示气泡 ✦">
          <Button variant="outline">悬停看 Tooltip</Button>
        </Tooltip>
        <Popover
          open={popOpen}
          onOpenChange={setPopOpen}
          trigger={<Button variant="outline">点开 Popover</Button>}
        >
          <div style={{ padding: '0.5rem', maxWidth: '14rem' }}>
            这是 Popover 内容,点外部或按 Esc 关闭。
          </div>
        </Popover>
        <Menu
          trigger={<Button variant="ghost">菜单 ▾</Button>}
          items={[
            { label: '编辑', onSelect: () => {} },
            { label: '复制', onSelect: () => {} },
            { label: '删除', danger: true, onSelect: () => {} },
          ]}
        />
        <Select
          value={sel}
          onChange={setSel}
          options={[
            { value: 'arcane', label: 'Arcane 紫' },
            { value: 'frost', label: 'Frost 青' },
            { value: 'ember', label: 'Ember 品红' },
          ]}
        />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <h3 style={{ marginBlockStart: 0 }}>奥术对话框</h3>
        <p style={{ color: 'var(--ms-color-fg-muted)' }}>
          原生 &lt;dialog&gt; + showModal:焦点陷阱、Esc、遮罩、入场动画。
        </p>
        <Button onClick={() => setDialogOpen(false)}>关闭</Button>
      </Dialog>

      <h2>表单 Forms</h2>
      <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '360px' }}>
        <Label required>用户名</Label>
        <Input placeholder="输入用户名" />
        <Textarea placeholder="多行输入" />
        <div style={row}>
          <Switch defaultChecked />
          <Checkbox defaultChecked>记住我</Checkbox>
        </div>
      </div>

      <h2>展示 Data Display</h2>
      <div style={row}>
        <Badge tone="primary">Primary</Badge>
        <Badge tone="success" variant="solid">
          Solid
        </Badge>
        <Tag tone="success" closable>
          可关闭
        </Tag>
        <Avatar name="Lyra Vex" />
        <Avatar name="Orin Sael" shape="square" />
        <Kbd>⌘K</Kbd>
      </div>

      <h2>反馈 Feedback</h2>
      <Alert variant="info">这是一条信息提示,用于背景说明。</Alert>
      <Alert variant="success">操作成功:改动已保存。</Alert>
      <div style={row}>
        <Spinner />
        <Progress value={66} style={{ maxWidth: '12rem' }} />
      </div>
      <Skeleton style={{ blockSize: '1rem', maxWidth: '20rem' }} />

      <h2>操作与布局</h2>
      <div style={row}>
        <Button>Solid</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <Divider />
      <Card variant="elevated" interactive style={{ maxWidth: '16rem' }}>
        交互卡片:hover 上浮发光,Tab 看聚焦环。
      </Card>

      <h2>结构 / 导航</h2>
      <Breadcrumb
        items={[
          { label: '首页', href: '#' },
          { label: '组件', href: '#' },
          { label: 'Tabs', current: true },
        ]}
      />
      <Tabs
        defaultValue="overview"
        items={[
          { value: 'overview', label: '概览', content: <p>这是概览面板的内容。</p> },
          { value: 'specs', label: '规格', content: <p>这是规格面板的内容。</p> },
          { value: 'usage', label: '用法', content: <p>这是用法面板的内容。</p> },
        ]}
      />
      <Accordion
        type="single"
        defaultValue="a"
        items={[
          {
            value: 'a',
            title: '什么是 magic-scope?',
            content: <p>一个带溯源的多框架 UI 组件库。</p>,
          },
          {
            value: 'b',
            title: '如何收录组件?',
            content: <p>pnpm new → 实现 → 填溯源 → registry。</p>,
          },
        ]}
      />
      <Table
        stripe
        hoverable
        columns={[
          { key: 'name', header: '组件' },
          { key: 'cat', header: '分类' },
          { key: 'status', header: '状态' },
        ]}
        data={[
          { name: 'Button', cat: 'actions', status: 'stable' },
          { name: 'Dialog', cat: 'overlay', status: 'stable' },
          { name: 'Tabs', cat: 'navigation', status: 'stable' },
        ]}
      />
      <Pagination page={page} total={8} onPageChange={setPage} />
    </main>
  );
}
