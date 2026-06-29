import { Avatar, Badge } from '@magic-scope/react';
import type { ComponentType, SVGProps } from 'react';
import {
  IconAlert,
  IconEvents,
  IconFunnel,
  IconOverview,
  IconSegment,
  IconTeam,
} from '../components/icons';
import { Logo } from '../components/Logo';
import { sidebarNav } from '../data/content';

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  overview: IconOverview,
  events: IconEvents,
  funnels: IconFunnel,
  segments: IconSegment,
  alerts: IconAlert,
  team: IconTeam,
};

interface SidebarProps {
  view: string;
  onNavigate: (view: string) => void;
}

export function SidebarContent({ view, onNavigate }: SidebarProps) {
  return (
    <>
      <div className="v-side__brand">
        <Logo />
      </div>

      <div className="v-side__group-label">工作区</div>
      {sidebarNav.map((item) => {
        const Icon = ICONS[item.id] ?? IconOverview;
        const active = item.view === view;
        return (
          <button
            key={item.id}
            type="button"
            className={`v-side__item${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onNavigate(item.view)}
          >
            <span className="v-side__icon">
              <Icon />
            </span>
            {item.label}
            {item.id === 'alerts' && (
              <Badge tone="danger" size="sm" variant="soft" style={{ marginInlineStart: 'auto' }}>
                3
              </Badge>
            )}
          </button>
        );
      })}

      <div className="v-side__spacer" />

      <div className="v-side__user">
        <Avatar name="陈思远" size="sm" />
        <div style={{ minInlineSize: 0 }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 'var(--ms-font-weight-medium, 500)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            陈思远
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--ms-color-fg-subtle)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Pro 工作区
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ view, onNavigate }: SidebarProps) {
  return (
    <aside className="v-side">
      <SidebarContent view={view} onNavigate={onNavigate} />
    </aside>
  );
}
