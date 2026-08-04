import {
  AlertDialogHost,
  Avatar,
  AvatarGroup,
  Button,
  Code,
  Collapsible,
  CopyButton,
  confirm,
  Dialog,
  Form,
  Input,
  Label,
  Select,
  type SelectOption,
  Slider,
  Switch,
  Table,
  type TableColumn,
  Tabs,
  Tag,
  Tree,
  type TreeNode,
  toast,
  useForm,
  useWatch,
  Watermark,
} from '@magic-scope/react';
import { useState } from 'react';
import { formatDate, money } from '../lib/format';
import './Settings.css';

/* ============================================================================
 * Settings —— 控制台设置页(Chromatic Grid 方言)。
 *
 * 版面骨架:页头 → 工作区拼贴条(满色块 + 密集事实清单)→ 一张 .ad-card 装四个 Tab。
 * 每个 Tab 内部都是「不等分双栏 + 一侧超大数字 / 一侧密集清单」的密度反差,
 * 分节靠大号索引数字 + 发丝线,不靠标题堆叠;色彩全部承担信息编码:
 *   品类色 = 目录分类;角色色条 = 权限;danger 窄色条 = 危险操作;满色块 = 未保存状态。
 * 后台不做滚动编排,只保留 hover / 表单态过渡。
 * ========================================================================== */

/* ------------------------------ 通用小件 ---------------------------------- */

interface SectionBandProps {
  index: string;
  name: string;
  hint?: string;
}

/** 分节带:大号索引数字 + 极小名称 + 发丝线,尺度对比就在这一行里。 */
function SectionBand({ index, name, hint }: SectionBandProps) {
  return (
    <header className="stg-sec">
      <span className="stg-sec-no">{index}</span>
      <span className="stg-sec-name">{name}</span>
      <hr className="sf-hairline stg-sec-rule" />
      {hint != null && <span className="stg-sec-hint">{hint}</span>}
    </header>
  );
}

/* ------------------------------ General ---------------------------------- */

/** 表单初值:也是 Discard(store.reset)与「未保存」比对的回退基准。 */
const GENERAL_DEFAULTS = {
  storeName: 'Arden Studio',
  supportEmail: 'care@arden.studio',
  currency: 'USD',
  timezone: 'et',
  lowStockThreshold: 15,
  orderNotifications: true,
  weeklyDigest: false,
  publicReviews: true,
};

type GeneralKey = keyof typeof GENERAL_DEFAULTS;

/** 字段展示名:未保存清单直接列它们,比列 path 可读。 */
const FIELD_LABELS: Record<GeneralKey, string> = {
  storeName: 'Store name',
  supportEmail: 'Support email',
  currency: 'Currency',
  timezone: 'Timezone',
  lowStockThreshold: 'Low-stock threshold',
  orderNotifications: 'Order notifications',
  weeklyDigest: 'Weekly digest',
  publicReviews: 'Public reviews',
};

const GENERAL_KEYS = Object.keys(FIELD_LABELS) as GeneralKey[];
const GENERAL_BASELINE: Record<GeneralKey, unknown> = GENERAL_DEFAULTS;

const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'USD', label: 'USD — US dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British pound' },
];

const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'et', label: 'Eastern Time (New York)' },
  { value: 'gmt', label: 'GMT (London)' },
  { value: 'cet', label: 'Central European (Paris)' },
  { value: 'jst', label: 'Japan (Tokyo)' },
];

/**
 * 未保存摘要:逐字段订阅表单 store(useWatch),与初值比对。
 * 有改动 → 整块转为墨色满块(色彩编码状态);无改动 → 安静的表面块。
 */
function ChangeSummary() {
  // hooks 顺序固定(非条件、非循环),与 GENERAL_KEYS 一一对应
  const current: Record<GeneralKey, unknown> = {
    storeName: useWatch('storeName'),
    supportEmail: useWatch('supportEmail'),
    currency: useWatch('currency'),
    timezone: useWatch('timezone'),
    lowStockThreshold: useWatch('lowStockThreshold'),
    orderNotifications: useWatch('orderNotifications'),
    weeklyDigest: useWatch('weeklyDigest'),
    publicReviews: useWatch('publicReviews'),
  };
  const changed = GENERAL_KEYS.filter((key) => current[key] !== GENERAL_BASELINE[key]);
  const pending = changed.length > 0;

  return (
    <aside
      className={pending ? 'sf-tile sf-tile-ink stg-pending' : 'sf-tile stg-pending'}
      aria-live="polite"
    >
      <span className="sf-kicker sf-kicker-dot">{pending ? 'Unsaved' : 'In sync'}</span>
      <span className="stg-pending-num">{changed.length}</span>
      <span className="stg-pending-unit">
        {changed.length === 1 ? 'field edited' : 'fields edited'}
      </span>
      {pending ? (
        <ol className="stg-pending-list">
          {changed.map((key, i) => (
            <li key={key}>
              <span className="sf-index">{String(i + 1).padStart(2, '0')}</span>
              {FIELD_LABELS[key]}
            </li>
          ))}
        </ol>
      ) : (
        <p className="stg-pending-empty">Everything matches the saved store profile.</p>
      )}
    </aside>
  );
}

function GeneralTab() {
  const form = useForm({ defaultValues: GENERAL_DEFAULTS });

  return (
    <Form
      form={form}
      layout="horizontal"
      labelWidth={200}
      className="stg-form"
      onSubmit={() => {
        toast.success('Settings saved', {
          description: 'Store profile, inventory and notification preferences updated.',
        });
      }}
    >
      <div className="stg-general">
        <div className="stg-general-main">
          <section className="stg-form-section">
            <SectionBand index="01" name="Store profile" hint="Public on the storefront" />
            <Form.Field
              name="storeName"
              label="Store name"
              required
              rule={{ required: 'Store name is required.' }}
            >
              <Input placeholder="Arden Studio" />
            </Form.Field>
            <Form.Field
              name="supportEmail"
              label="Support email"
              required
              rule={{
                required: 'Support email is required.',
                email: 'Enter a valid email address.',
              }}
              help="Shown on receipts and order updates."
            >
              <Input type="email" placeholder="care@arden.studio" />
            </Form.Field>
            <Form.Field name="currency" label="Currency">
              <Select options={CURRENCY_OPTIONS} />
            </Form.Field>
            <Form.Field
              name="timezone"
              label="Timezone"
              help="Used for reports and the weekly digest."
            >
              <Select options={TIMEZONE_OPTIONS} />
            </Form.Field>
          </section>

          <section className="stg-form-section">
            <SectionBand index="02" name="Inventory" hint="Console-wide flag" />
            <Form.Field
              name="lowStockThreshold"
              label="Low-stock alert threshold"
              help="Pieces at or below this quantity get flagged across the console."
            >
              <Slider
                min={5}
                max={50}
                step={1}
                showValue
                formatValue={(v) => `${v} units`}
                className="stg-slider"
              />
            </Form.Field>
          </section>

          <section className="stg-form-section">
            <SectionBand index="03" name="Notifications" hint="Studio inbox" />
            <Form.Field
              name="orderNotifications"
              label="Order notifications"
              help="Email the studio inbox as each order comes in."
            >
              <Switch />
            </Form.Field>
            <Form.Field
              name="weeklyDigest"
              label="Weekly digest"
              help="A Monday summary of sales, traffic and low stock."
            >
              <Switch />
            </Form.Field>
            <Form.Field
              name="publicReviews"
              label="Public reviews"
              help="Show verified customer reviews on product pages."
            >
              <Switch />
            </Form.Field>
          </section>

          <footer className="stg-form-footer">
            <p className="stg-form-note">Saved changes reach the storefront right away.</p>
            <Form.Reset
              variant="ghost"
              onClick={() => toast('Changes discarded', { id: 'settings-discard' })}
            >
              Discard
            </Form.Reset>
            <Form.Submit>Save changes</Form.Submit>
          </footer>
        </div>

        <ChangeSummary />
      </div>
    </Form>
  );
}

/* ------------------------------ Catalog ---------------------------------- */

interface CatalogCategory {
  key: string;
  label: string;
  lines: { key: string; title: string }[];
}

/** 店面目录:四大分类 × 各自子线(与 data/products 的分类一致)。 */
const CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    key: 'ceramics',
    label: 'Ceramics',
    lines: [
      { key: 'ceramics-tableware', title: 'Tableware' },
      { key: 'ceramics-vases', title: 'Vases' },
      { key: 'ceramics-serveware', title: 'Serveware' },
    ],
  },
  {
    key: 'lighting',
    label: 'Lighting',
    lines: [
      { key: 'lighting-table', title: 'Table lamps' },
      { key: 'lighting-floor', title: 'Floor lamps' },
      { key: 'lighting-wall', title: 'Wall sconces' },
    ],
  },
  {
    key: 'textiles',
    label: 'Textiles',
    lines: [
      { key: 'textiles-throws', title: 'Throws' },
      { key: 'textiles-cushions', title: 'Cushions' },
    ],
  },
  {
    key: 'objects',
    label: 'Objects',
    lines: [
      { key: 'objects-desk', title: 'Desk objects' },
      { key: 'objects-decor', title: 'Decor' },
    ],
  },
];

/** 分类节点标题挂 data-cat:内部的色块直接吃 var(--cat),色 = 品类识别。 */
const CATALOG_TREE: TreeNode[] = CATALOG_CATEGORIES.map((cat) => ({
  key: cat.key,
  title: (
    <span className="stg-node" data-cat={cat.key}>
      <i className="sf-dot sf-cat-dot stg-node-dot" aria-hidden="true" />
      {cat.label}
    </span>
  ),
  children: cat.lines.map((line) => ({ key: line.key, title: line.title })),
}));

function collectKeys(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => [n.key, ...(n.children ? collectKeys(n.children) : [])]);
}

const ALL_CATALOG_KEYS = collectKeys(CATALOG_TREE);
const LEAF_KEYS = new Set(CATALOG_CATEGORIES.flatMap((c) => c.lines.map((l) => l.key)));

function CatalogTab() {
  const [visibleKeys, setVisibleKeys] = useState<string[]>(ALL_CATALOG_KEYS);
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [newBadge, setNewBadge] = useState(true);

  const visibleLines = visibleKeys.filter((k) => LEAF_KEYS.has(k)).length;

  return (
    <div className="stg-tab">
      <SectionBand index="01" name="Storefront visibility" hint="Navigation and search" />

      <div className="stg-catalog">
        <div className="stg-catalog-main">
          <p className="stg-hint">
            Untick a category or line to hide it from storefront navigation and search. Nothing is
            deleted — pieces stay reachable from order history.
          </p>
          <Tree
            data={CATALOG_TREE}
            checkable
            selectable={false}
            defaultExpandAll
            size="sm"
            checkedKeys={visibleKeys}
            onCheck={(keys) => {
              setVisibleKeys(keys);
              toast('Catalog visibility updated', { id: 'catalog-visibility' });
            }}
          />
        </div>

        <aside className="stg-catalog-side">
          {/* 超大数字 vs 极小注脚:一侧极简、一侧密集的密度反差 */}
          <div className="sf-tile sf-tile-ink stg-count">
            <span className="sf-kicker sf-kicker-dot">Live lines</span>
            <span className="stg-count-num">{visibleLines}</span>
            <span className="stg-count-unit">of {LEAF_KEYS.size} on the storefront</span>
            <div className="stg-count-bars">
              {CATALOG_CATEGORIES.map((cat) => {
                const shown = cat.lines.filter((l) => visibleKeys.includes(l.key)).length;
                return (
                  <span
                    key={cat.key}
                    className="stg-count-bar"
                    data-cat={cat.key}
                    data-off={shown === 0 || undefined}
                  >
                    <i aria-hidden="true" />
                    <span className="sf-index">
                      {shown}/{cat.lines.length}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          <Collapsible tone="neutral" className="stg-adv-rules">
            <Collapsible.Trigger className="stg-adv-trigger">
              Advanced catalog rules
            </Collapsible.Trigger>
            <Collapsible.Content>
              <div className="stg-rule-row">
                <span className="stg-rule-copy">
                  <span className="stg-rule-title">Hide sold-out pieces</span>
                  <span className="stg-rule-sub">They stay reachable by direct link.</span>
                </span>
                <Switch
                  checked={hideSoldOut}
                  onChange={(e) => setHideSoldOut(e.target.checked)}
                  aria-label="Hide sold-out pieces"
                />
              </div>
              <div className="stg-rule-row">
                <span className="stg-rule-copy">
                  <span className="stg-rule-title">“New” badge for 30 days</span>
                  <span className="stg-rule-sub">Applied automatically after publishing.</span>
                </span>
                <Switch
                  checked={newBadge}
                  onChange={(e) => setNewBadge(e.target.checked)}
                  aria-label="Show new badge for 30 days"
                />
              </div>
            </Collapsible.Content>
          </Collapsible>
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------- Team ----------------------------------- */

type TeamRole = 'owner' | 'manager' | 'support';

interface Teammate {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: 'active' | 'invited';
}

const ROLE_OPTIONS: SelectOption[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'support', label: 'Support' },
];

/** 角色说明:配色条一起构成表格里 Role 列的图例。 */
const ROLE_ORDER: TeamRole[] = ['owner', 'manager', 'support'];

const ROLE_BLURB: Record<TeamRole, string> = {
  owner: 'Billing, team and every setting.',
  manager: 'Catalog, orders and marketing.',
  support: 'Orders and customers only.',
};

const INITIAL_TEAM: Teammate[] = [
  { id: 'ava', name: 'Ava Martin', email: 'ava@arden.studio', role: 'owner', status: 'active' },
  { id: 'noah', name: 'Noah Reyes', email: 'noah@arden.studio', role: 'manager', status: 'active' },
  {
    id: 'ines',
    name: 'Inés Duarte',
    email: 'ines@arden.studio',
    role: 'support',
    status: 'invited',
  },
];

const SEAT_LIMIT = 5;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function roleLabel(role: TeamRole): string {
  return ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;
}

/** 从邮箱局部名推一个展示名(邀请后的占位成员用)。 */
function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  const cleaned = local.replace(/[._-]+/g, ' ').trim();
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase()) || email;
}

function TeamTab() {
  const [team, setTeam] = useState<Teammate[]>(INITIAL_TEAM);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('support');
  const [inviteError, setInviteError] = useState<string | null>(null);

  const closeInvite = () => {
    setInviteOpen(false);
    setInviteEmail('');
    setInviteRole('support');
    setInviteError(null);
  };

  const updateRole = (member: Teammate, role: TeamRole) => {
    setTeam((prev) => prev.map((m) => (m.id === member.id ? { ...m, role } : m)));
    toast('Role updated', {
      id: 'team-role',
      description: `${member.name} is now ${roleLabel(role)}.`,
    });
  };

  const sendInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setInviteError('Enter a valid email address, like mia@arden.studio.');
      return;
    }
    if (team.some((m) => m.email.toLowerCase() === email)) {
      setInviteError('That address is already on the team.');
      return;
    }
    setTeam((prev) => [
      ...prev,
      { id: email, name: displayNameFromEmail(email), email, role: inviteRole, status: 'invited' },
    ]);
    toast.success('Invite sent', { description: `${email} joins as ${roleLabel(inviteRole)}.` });
    closeInvite();
  };

  const columns: TableColumn<Teammate>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (row) => (
        <span className="stg-member">
          <Avatar name={row.name} size="sm" />
          <span className="stg-member-meta">
            <span className="stg-member-name">{row.name}</span>
            <span className="stg-member-email">{row.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      width: 210,
      // 角色 = 一根窄色条 + 可改的 Select,颜色与上方图例同一套编码
      render: (row) => (
        <span className="stg-role-cell" data-role={row.role}>
          <i className="stg-role-bar" aria-hidden="true" />
          <Select
            options={ROLE_OPTIONS}
            value={row.role}
            size="sm"
            disabled={row.role === 'owner'}
            aria-label={`Role for ${row.name}`}
            onChange={(next) => updateRole(row, next as TeamRole)}
          />
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 110,
      align: 'end',
      render: (row) => (
        <span className="ad-status stg-status" data-status={row.status}>
          {row.status === 'active' ? 'Active' : 'Invited'}
        </span>
      ),
    },
  ];

  return (
    <div className="stg-tab">
      <SectionBand index="01" name="Console access" hint="Roles decide what they can edit" />

      <div className="stg-team-head">
        {/* 极简:一个超大席位数 + 头像组 */}
        <div className="sf-tile stg-seats">
          <span className="sf-kicker sf-kicker-dot">Seats</span>
          <span className="stg-seats-num">{team.length}</span>
          <span className="stg-seats-unit">of {SEAT_LIMIT} on the Studio plan</span>
          <AvatarGroup max={4} size="sm" spacing="normal" className="stg-seats-avatars">
            {team.map((member) => (
              <Avatar key={member.id} name={member.name} />
            ))}
          </AvatarGroup>
        </div>

        {/* 密集:角色图例 —— 也是表格 Role 列色条的解释 */}
        <dl className="sf-tile stg-roles">
          {ROLE_ORDER.map((role) => (
            <div key={role} className="stg-role-row" data-role={role}>
              <i className="stg-role-bar" aria-hidden="true" />
              <dt>{roleLabel(role)}</dt>
              <dd>{ROLE_BLURB[role]}</dd>
              <span className="sf-index stg-role-count">
                {team.filter((m) => m.role === role).length}
              </span>
            </div>
          ))}
          <div className="stg-role-invite">
            <Button variant="ghost" size="sm" onClick={() => setInviteOpen(true)}>
              Invite teammate
            </Button>
          </div>
        </dl>
      </div>

      <Table<Teammate>
        columns={columns}
        data={team}
        getRowKey={(r) => r.id}
        hoverable
        className="stg-team-table"
      />

      <Dialog open={inviteOpen} onOpenChange={(open) => !open && closeInvite()} size="sm">
        <Dialog.Header>
          <Dialog.Title>Invite a teammate</Dialog.Title>
          <Dialog.Description>
            They will get an email with a link to join this console.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <div className="stg-invite-fields">
            <div className="stg-invite-field">
              <Label htmlFor="stg-invite-email" required>
                Email
              </Label>
              <Input
                id="stg-invite-email"
                type="email"
                placeholder="mia@arden.studio"
                value={inviteEmail}
                invalid={inviteError != null}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setInviteError(null);
                }}
              />
              {inviteError != null && (
                <p className="stg-invite-error" role="alert">
                  {inviteError}
                </p>
              )}
            </div>
            <div className="stg-invite-field">
              <Label htmlFor="stg-invite-role">Role</Label>
              <Select
                id="stg-invite-role"
                options={ROLE_OPTIONS}
                value={inviteRole}
                onChange={(next) => setInviteRole(next as TeamRole)}
              />
            </div>
          </div>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="ghost" onClick={closeInvite}>
            Cancel
          </Button>
          <Button onClick={sendInvite}>Send invite</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

/* ------------------------------ Advanced ---------------------------------- */

const API_KEY = 'ms_live_51H8fj2KpTr64QLdnV0aXCw9RmEuY3sB7gN1oZeAxTkI5cD2v';

/** 危险区:确认后清掉本浏览器里的演示数据(购物车 + 外观偏好)。 */
async function resetDemoData() {
  const ok = await confirm(
    'This clears the demo cart and your appearance preferences from this browser. Catalog and order data are static and stay untouched.',
    {
      title: 'Reset demo data?',
      variant: 'danger',
      confirmText: 'Reset data',
      onConfirm: () => {
        try {
          localStorage.removeItem('arden.cart');
          localStorage.removeItem('arden.appearance');
        } catch {
          /* 隐私模式下不可用,忽略即可 */
        }
      },
    },
  );
  if (ok) toast('Demo data cleared — reload to see defaults');
}

function AdvancedTab() {
  return (
    <div className="stg-advanced">
      <div className="stg-adv-main">
        <section className="stg-adv-section">
          <SectionBand index="01" name="API access" hint="Storefront API" />
          <div className="stg-api-head">
            <span className="stg-api-label">Secret key</span>
            <Tag size="sm" tone="warning" variant="outline">
              live
            </Tag>
            <span className="sf-index">rotated 42 days ago</span>
          </div>
          <div className="stg-api-row">
            <Code block size="sm" className="stg-api-code">
              {API_KEY}
            </Code>
            <CopyButton value={API_KEY} variant="ghost" size="sm" aria-label="Copy API key" />
          </div>
          <p className="stg-hint stg-hint-warn">
            This key can read and write every resource in the workspace. Rotate it immediately if it
            ever leaks.
          </p>
        </section>

        <section className="stg-adv-section">
          <SectionBand index="03" name="Danger zone" />
          {/* 窄 danger 色条 + 常规深色文字,不做整块红 */}
          <div className="stg-danger">
            <i className="stg-danger-bar" aria-hidden="true" />
            <div className="stg-danger-copy">
              <span className="stg-danger-title">Reset demo data</span>
              <p className="stg-hint">
                Clears the cart and appearance preferences stored in this browser. The static demo
                catalog is unaffected.
              </p>
            </div>
            <Button variant="ghost" tone="danger" size="sm" onClick={resetDemoData}>
              Reset data
            </Button>
          </div>
        </section>
      </div>

      <section className="stg-adv-section stg-adv-side">
        <SectionBand index="02" name="Invoice branding" />
        <Watermark
          content="Arden Demo"
          rotate={-22}
          opacity={0.1}
          gap={[110, 88]}
          fontSize={13}
          className="stg-invoice-frame"
        >
          {/* 发票 = 浅色拼贴块(无描边),四色条当信笺抬头 */}
          <article className="stg-invoice" aria-label="Sample invoice">
            <div className="sf-spectrum stg-invoice-rule" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            <header className="stg-invoice-head">
              <span className="stg-invoice-brand">Arden</span>
              <span className="stg-invoice-no">INV-1042</span>
            </header>
            <dl className="stg-invoice-meta">
              <div>
                <dt>Billed to</dt>
                <dd>Mara Ellison</dd>
              </div>
              <div>
                <dt>Issued</dt>
                <dd>{formatDate('2026-07-24')}</dd>
              </div>
            </dl>
            <ul className="stg-invoice-lines">
              <li>
                <span>Duna Vase × 1</span>
                <span>{money(148)}</span>
              </li>
              <li>
                <span>Halo Table Lamp × 1</span>
                <span>{money(320)}</span>
              </li>
              <li>
                <span>Field Throw × 2</span>
                <span>{money(336)}</span>
              </li>
              <li>
                <span>Shipping</span>
                <span>{money(18)}</span>
              </li>
            </ul>
            <footer className="stg-invoice-total">
              <span>Total</span>
              <span>{money(822)}</span>
            </footer>
          </article>
        </Watermark>
      </section>
    </div>
  );
}

/* ------------------------------ 页面本体 ---------------------------------- */

/** 工作区事实清单:全部从本页已有数据派生,不是凭空文案。 */
const WORKSPACE_FACTS: { label: string; value: string }[] = [
  { label: 'Plan', value: `Studio · ${SEAT_LIMIT} seats` },
  {
    label: 'Region',
    value: TIMEZONE_OPTIONS.find((o) => o.value === GENERAL_DEFAULTS.timezone)?.label ?? '—',
  },
  { label: 'Currency', value: GENERAL_DEFAULTS.currency },
  { label: 'Catalog lines', value: `${LEAF_KEYS.size} across 4 families` },
  { label: 'Last saved', value: formatDate('2026-08-02') },
];

export function Settings() {
  const [tab, setTab] = useState('general');

  return (
    <div className="ad-content stg-root">
      <header className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Settings</h1>
          <p className="ad-page-sub">Store profile, catalog visibility, team access and API.</p>
        </div>
      </header>

      {/* 工作区拼贴条:满色块承载店名,右侧是密集事实清单 —— 页面的结构件 */}
      <div className="stg-masthead">
        <section className="sf-tile sf-tile-solid stg-workspace">
          <span className="sf-kicker sf-kicker-dot">Workspace</span>
          <h2 className="sf-display sf-display-lg stg-workspace-name">
            {GENERAL_DEFAULTS.storeName}
          </h2>
          <p className="stg-workspace-meta">
            <span>arden.studio</span>
            <span>Owner · Ava Martin</span>
          </p>
        </section>

        <dl className="sf-tile stg-facts">
          {WORKSPACE_FACTS.map((fact) => (
            <div key={fact.label} className="stg-fact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section className="ad-card stg-tabs-card">
        <Tabs
          value={tab}
          onChange={setTab}
          variant="underline"
          keepMounted
          classNames={{ panel: 'stg-panel' }}
          items={[
            { value: 'general', label: 'General', content: <GeneralTab /> },
            { value: 'catalog', label: 'Catalog', content: <CatalogTab /> },
            { value: 'team', label: 'Team', content: <TeamTab /> },
            { value: 'advanced', label: 'Advanced', content: <AdvancedTab /> },
          ]}
        />
      </section>

      {/* confirm()/alert() 的渲染容器:全应用目前只有本页用命令式对话框 */}
      <AlertDialogHost />
    </div>
  );
}
