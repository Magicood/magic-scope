import { useState } from 'react';
import {
  Accordion,
  Alert,
  AlertDialogHost,
  Avatar,
  alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  ContextMenu,
  confirm,
  Dialog,
  Divider,
  Drawer,
  Input,
  Kbd,
  Label,
  Menu,
  NumberInput,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  prompt,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  Tag,
  Textarea,
  Timeline,
  TimelineItem,
  Toaster,
  Tooltip,
  toast,
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
  const [plan, setPlan] = useState('free');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [volume, setVolume] = useState(40);
  const [qty, setQty] = useState(3);

  return (
    <main
      style={{
        maxWidth: 'min(900px, 100%)',
        margin: '0 auto',
        padding: 'clamp(1rem, 4vw, 2rem)',
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
        <Button variant="outline" onClick={() => setDrawerOpen(true)}>
          打开 Drawer
        </Button>
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
        <Popconfirm
          trigger={<Button variant="outline">删除(Popconfirm)</Button>}
          title="确定删除该项?"
          description="此操作不可撤销。"
          variant="danger"
          confirmText="删除"
          onConfirm={() => toast.success('已删除')}
        />
        <ContextMenu
          items={[
            { label: '编辑', onSelect: () => toast('编辑') },
            { label: '复制', onSelect: () => toast('复制') },
            { label: '删除', danger: true, onSelect: () => toast.error('已删除') },
          ]}
        >
          <span
            style={{
              padding: '0.5rem 0.875rem',
              border: '1px dashed var(--ms-color-border)',
              borderRadius: '8px',
              color: 'var(--ms-color-fg-muted)',
            }}
          >
            在此处右键(ContextMenu)
          </span>
        </ContextMenu>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <h3 style={{ marginBlockStart: 0 }}>奥术对话框</h3>
        <p style={{ color: 'var(--ms-color-fg-muted)' }}>
          原生 &lt;dialog&gt; + showModal:焦点陷阱、Esc、遮罩、入场动画。
        </p>
        <Button onClick={() => setDialogOpen(false)}>关闭</Button>
      </Dialog>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} side="end" title="筛选">
        <p style={{ color: 'var(--ms-color-fg-muted)', marginBlockStart: 0 }}>
          右侧抽屉:原生 dialog 焦点陷阱、Esc、点遮罩关闭、滑入动画。
        </p>
        <div style={{ display: 'grid', gap: '0.75rem', marginBlockStart: '1rem' }}>
          <Checkbox defaultChecked>只看 stable</Checkbox>
          <Checkbox>包含 draft</Checkbox>
        </div>
      </Drawer>

      <h2>表单 Forms</h2>
      <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '360px' }}>
        <Label required>用户名</Label>
        <Input placeholder="输入用户名" />
        <Textarea placeholder="多行输入" />
        <div style={row}>
          <Switch defaultChecked />
          <Checkbox defaultChecked>记住我</Checkbox>
        </div>
        <RadioGroup value={plan} onValueChange={setPlan} aria-label="套餐">
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
          <Radio value="ent" disabled>
            Enterprise(禁用)
          </Radio>
        </RadioGroup>
        <RadioGroup defaultValue="m" orientation="horizontal" size="lg" aria-label="尺码">
          <Radio value="s">小</Radio>
          <Radio value="m">中</Radio>
          <Radio value="l">大</Radio>
        </RadioGroup>
        <Slider
          value={volume}
          onValueChange={setVolume}
          showValue
          formatValue={(v) => `${v}%`}
          aria-label="音量"
        />
        <Slider defaultValue={3} min={0} max={5} step={1} size="sm" aria-label="评分" />
        <div style={row}>
          <NumberInput
            value={qty}
            onValueChange={(v) => setQty(v ?? 0)}
            min={0}
            max={99}
            aria-label="数量"
          />
          <NumberInput
            defaultValue={1.5}
            min={0}
            max={10}
            step={0.5}
            size="sm"
            aria-label="评分(0.5 步)"
          />
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
      <Timeline aria-label="动态" style={{ maxWidth: '26rem' }}>
        <TimelineItem variant="success" title="部署上线" time="10:00">
          已发布到生产环境,健康检查通过。
        </TimelineItem>
        <TimelineItem variant="primary" title="合并 PR #128" time="09:42">
          设备适配 P1:浮层抽屉 + Table 卡片化。
        </TimelineItem>
        <TimelineItem variant="warning" title="CI 重试一次" time="09:30" icon="!">
          flaky 测试触发重跑,第二次通过。
        </TimelineItem>
        <TimelineItem title="提交代码" time="09:12">
          默认变体(中性节点)。
        </TimelineItem>
      </Timeline>

      <h2>反馈 Feedback</h2>
      <Alert variant="info">这是一条信息提示,用于背景说明。</Alert>
      <Alert variant="success">操作成功:改动已保存。</Alert>
      <div style={row}>
        <Spinner />
        <Progress value={66} style={{ maxWidth: '12rem' }} />
      </div>
      <Skeleton style={{ blockSize: '1rem', maxWidth: '20rem' }} />
      <div style={row}>
        <Button variant="outline" onClick={() => toast('已保存 ✦')}>
          普通 toast
        </Button>
        <Button variant="outline" onClick={() => toast.success('操作成功')}>
          success
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error('出错了', { description: '请稍后重试' })}
        >
          error
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast('已删除 1 项', {
              variant: 'warning',
              action: { label: '撤销', onClick: () => toast.success('已撤销') },
            })
          }
        >
          带 action
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const ok = await confirm('确定删除该项?此操作不可撤销。', {
              variant: 'danger',
              confirmText: '删除',
            });
            if (ok) toast.success('已删除');
          }}
        >
          confirm(danger)
        </Button>
        <Button
          variant="outline"
          onClick={() => alert('这是一条命令式 alert 提示。', { title: '提示' })}
        >
          alert
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const name = await prompt('给它起个名字', {
              defaultValue: '未命名',
              placeholder: '输入名称',
            });
            if (name) toast.success(`已命名为「${name}」`);
          }}
        >
          prompt
        </Button>
      </div>

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

      <Toaster position="bottom-end" />
      <AlertDialogHost />
    </main>
  );
}
