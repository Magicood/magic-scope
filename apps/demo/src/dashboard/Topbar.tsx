import { Avatar, Dropdown, Kbd, Tooltip } from '@magic-scope/react';
import { IconBell, IconSearch, IconSettings } from '../components/icons';
import { navigate } from '../lib/router';

interface TopbarProps {
  title: string;
  onOpenPalette: () => void;
  onOpenSettings: () => void;
  onOpenMobileNav: () => void;
}

const notifications = [
  { label: '支付失败率超过阈值 2%', danger: true },
  { label: 'Maya 创建了看板「Q3 北极星指标」' },
  { label: '「注册漏斗」日报已生成' },
];

export function Topbar({ title, onOpenPalette, onOpenSettings, onOpenMobileNav }: TopbarProps) {
  return (
    <header className="v-topbar">
      <button
        type="button"
        className="v-icon-btn v-dash__burger"
        aria-label="打开导航"
        onClick={onOpenMobileNav}
      >
        <span style={{ display: 'grid', gap: 4, inlineSize: 18 }}>
          <span style={{ blockSize: 1.5, background: 'currentColor', borderRadius: 2 }} />
          <span style={{ blockSize: 1.5, background: 'currentColor', borderRadius: 2 }} />
          <span style={{ blockSize: 1.5, background: 'currentColor', borderRadius: 2 }} />
        </span>
      </button>

      <button type="button" className="v-topbar__search" onClick={onOpenPalette}>
        <span style={{ inlineSize: '1rem', blockSize: '1rem', flex: '0 0 auto' }}>
          <IconSearch />
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          搜索指标、事件、看板…
        </span>
        <span className="v-topbar__kbd">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className="v-topbar__actions">
        <span
          aria-hidden="true"
          style={{ color: 'var(--ms-color-fg-subtle)', fontSize: '0.85rem' }}
        >
          {title}
        </span>

        <Dropdown
          placement="bottom-end"
          trigger={
            <button
              type="button"
              className="v-icon-btn"
              aria-label="通知"
              style={{ position: 'relative' }}
            >
              <span style={{ inlineSize: '1.15rem', blockSize: '1.15rem' }}>
                <IconBell />
              </span>
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  insetBlockStart: 6,
                  insetInlineEnd: 6,
                  inlineSize: 7,
                  blockSize: 7,
                  borderRadius: '9999px',
                  background: 'var(--ms-color-danger)',
                  boxShadow: '0 0 0 2px var(--ms-color-bg)',
                }}
              />
            </button>
          }
          items={notifications}
        />

        <Tooltip content="外观设置">
          <button
            type="button"
            className="v-icon-btn"
            aria-label="外观设置"
            onClick={onOpenSettings}
          >
            <span style={{ inlineSize: '1.15rem', blockSize: '1.15rem' }}>
              <IconSettings />
            </span>
          </button>
        </Tooltip>

        <Dropdown
          placement="bottom-end"
          trigger={
            <button
              type="button"
              aria-label="账户菜单"
              style={{
                border: 0,
                background: 'transparent',
                padding: 2,
                cursor: 'pointer',
                borderRadius: '9999px',
              }}
            >
              <Avatar name="陈思远" size="sm" />
            </button>
          }
          items={[
            { label: '个人资料' },
            { label: '外观设置', onSelect: onOpenSettings },
            { label: '退出登录', danger: true, onSelect: () => navigate('/') },
          ]}
        />
      </div>
    </header>
  );
}
