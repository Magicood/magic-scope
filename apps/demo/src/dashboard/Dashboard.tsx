import { Button, Dialog, Drawer, Input, Segmented, Toaster, toast } from '@magic-scope/react';
import { useState } from 'react';
import '../styles/dashboard.css';
import { IconPlus } from '../components/icons';
import { navigate } from '../lib/router';
import {
  applyDensity,
  applyFx,
  applyMotion,
  applyPreset,
  DEFAULT_THEME,
  type ThemeState,
} from '../lib/theme';
import { ActivityFeed } from './ActivityFeed';
import { CommandPalette } from './CommandPalette';
import { EventsTable } from './EventsTable';
import { Overview } from './Overview';
import { SettingsDrawer } from './SettingsDrawer';
import { Sidebar, SidebarContent } from './Sidebar';
import { TeamPanel } from './TeamPanel';
import { Topbar } from './Topbar';

interface DashboardProps {
  path: string;
}

const VIEW_PATH: Record<string, string> = {
  overview: '/app',
  events: '/app/events',
  team: '/app/team',
};

const META = {
  overview: { title: '概览', sub: '实时掌握产品健康度', action: '导出报告' },
  events: { title: '事件流', sub: '最近上报的产品事件', action: '新建告警' },
  team: { title: '团队成员', sub: '管理工作区成员与权限', action: '邀请成员' },
} as const;

function resolveView(path: string): 'overview' | 'events' | 'team' {
  const seg = path.replace(/^\/app\/?/, '');
  if (seg === 'events') return 'events';
  if (seg === 'team') return 'team';
  return 'overview';
}

function InviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  const submit = () => {
    toast.success(email ? `已向 ${email} 发送邀请` : '邀请链接已生成');
    setEmail('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm">
      <Dialog.Header>
        <Dialog.Title>邀请成员</Dialog.Title>
        <Dialog.Description>输入邮箱并选择角色,我们会发送加入链接。</Dialog.Description>
      </Dialog.Header>
      <Dialog.Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label htmlFor="invite-email" style={{ display: 'grid', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>邮箱</span>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </label>
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>角色</span>
            <Segmented
              value={role}
              onValueChange={setRole}
              options={[
                { value: 'admin', label: '管理员' },
                { value: 'member', label: '成员' },
                { value: 'viewer', label: '只读' },
              ]}
            />
          </div>
        </div>
      </Dialog.Body>
      <Dialog.Footer>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          取消
        </Button>
        <Button onClick={submit}>发送邀请</Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export function Dashboard({ path }: DashboardProps) {
  const view = resolveView(path);
  const meta = META[view];

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [theme, setThemeState] = useState<ThemeState>(DEFAULT_THEME);

  const onNavigate = (next: string) => {
    navigate(VIEW_PATH[next] ?? '/app');
    setMobileNav(false);
  };

  const patchTheme = (patch: Partial<ThemeState>) => {
    setThemeState((prev) => {
      const nextState = { ...prev, ...patch };
      if (patch.preset !== undefined || patch.scheme !== undefined) {
        applyPreset(nextState.preset, nextState.scheme);
      }
      if (patch.density !== undefined) applyDensity(nextState.density);
      if (patch.motion !== undefined) applyMotion(nextState.motion);
      if (patch.fx !== undefined) applyFx(nextState.fx);
      return nextState;
    });
  };

  const onPrimaryAction = () => {
    if (view === 'team') {
      setInviteOpen(true);
      return;
    }
    if (view === 'events') {
      toast.success('告警规则已创建');
      return;
    }
    toast.success('报告生成中,完成后将发送到你的邮箱');
  };

  return (
    <div className="v-dash">
      <Sidebar view={view} onNavigate={onNavigate} />

      <div className="v-main">
        <Topbar
          title={meta.title}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenMobileNav={() => setMobileNav(true)}
        />

        <div className="v-content">
          <div className="v-page-head">
            <div>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 700 }}>
                {meta.title}
              </h1>
              <p
                style={{
                  margin: '0.35rem 0 0',
                  color: 'var(--ms-color-fg-muted)',
                  fontSize: '0.92rem',
                }}
              >
                {meta.sub}
              </p>
            </div>
            <Button onClick={onPrimaryAction} leftIcon={view === 'team' ? <IconPlus /> : undefined}>
              {meta.action}
            </Button>
          </div>

          {view === 'overview' && <Overview />}
          {view === 'events' && (
            <div className="v-content__cols">
              <EventsTable />
              <ActivityFeed />
            </div>
          )}
          {view === 'team' && <TeamPanel />}
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNavigate={onNavigate}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <SettingsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        theme={theme}
        onPatch={patchTheme}
      />
      <Drawer open={mobileNav} onOpenChange={setMobileNav} side="start" size="sm">
        <div style={{ marginInlineStart: '-0.35rem' }}>
          <SidebarContent view={view} onNavigate={onNavigate} />
        </div>
      </Drawer>
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <Toaster />
    </div>
  );
}
