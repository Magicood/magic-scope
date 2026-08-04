import {
  AlertDialogHost,
  Avatar,
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
  Watermark,
} from '@magic-scope/react';
import { useState } from 'react';
import { formatDate, money } from '../lib/format';
import './Settings.css';

/* ============================================================================
 * Settings —— 控制台设置页。一张大卡四个 Tab:
 * General(Form 两列表单)/ Catalog(Tree 可见性 + Collapsible 高级规则)/
 * Team(Table 成员 + Dialog 邀请)/ Advanced(Code API key + Watermark 发票
 * 预览 + AlertDialog 危险区)。后台动效极简,只保留 hover 过渡。
 * ========================================================================== */

/* ------------------------------ General ---------------------------------- */

/** 表单初值:也是 Discard(store.reset)的回退基准。 */
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

function GeneralTab() {
  const form = useForm({ defaultValues: GENERAL_DEFAULTS });

  return (
    <Form
      form={form}
      layout="horizontal"
      labelWidth={220}
      className="stg-form"
      onSubmit={() => {
        toast.success('Settings saved', {
          description: 'Store profile, inventory and notification preferences updated.',
        });
      }}
    >
      <section className="stg-form-section">
        <h3 className="stg-section-label">Store profile</h3>
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
          rule={{ required: 'Support email is required.', email: 'Enter a valid email address.' }}
          help="Shown on receipts and order updates."
        >
          <Input type="email" placeholder="care@arden.studio" />
        </Form.Field>
        <Form.Field name="currency" label="Currency">
          <Select options={CURRENCY_OPTIONS} />
        </Form.Field>
        <Form.Field name="timezone" label="Timezone" help="Used for reports and the weekly digest.">
          <Select options={TIMEZONE_OPTIONS} />
        </Form.Field>
      </section>

      <section className="stg-form-section">
        <h3 className="stg-section-label">Inventory</h3>
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
        <h3 className="stg-section-label">Notifications</h3>
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
        <Form.Reset
          variant="ghost"
          onClick={() => toast('Changes discarded', { id: 'settings-discard' })}
        >
          Discard
        </Form.Reset>
        <Form.Submit>Save changes</Form.Submit>
      </footer>
    </Form>
  );
}

/* ------------------------------ Catalog ---------------------------------- */

/** 店面目录树:四大分类 × 各自子线(与 data/products 的分类一致)。 */
const CATALOG_TREE: TreeNode[] = [
  {
    key: 'ceramics',
    title: 'Ceramics',
    children: [
      { key: 'ceramics-tableware', title: 'Tableware' },
      { key: 'ceramics-vases', title: 'Vases' },
      { key: 'ceramics-serveware', title: 'Serveware' },
    ],
  },
  {
    key: 'lighting',
    title: 'Lighting',
    children: [
      { key: 'lighting-table', title: 'Table lamps' },
      { key: 'lighting-floor', title: 'Floor lamps' },
      { key: 'lighting-wall', title: 'Wall sconces' },
    ],
  },
  {
    key: 'textiles',
    title: 'Textiles',
    children: [
      { key: 'textiles-throws', title: 'Throws' },
      { key: 'textiles-cushions', title: 'Cushions' },
    ],
  },
  {
    key: 'objects',
    title: 'Objects',
    children: [
      { key: 'objects-desk', title: 'Desk objects' },
      { key: 'objects-decor', title: 'Decor' },
    ],
  },
];

function collectKeys(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => [n.key, ...(n.children ? collectKeys(n.children) : [])]);
}

const ALL_CATALOG_KEYS = collectKeys(CATALOG_TREE);
const LEAF_KEYS = new Set(CATALOG_TREE.flatMap((n) => (n.children ?? []).map((c) => c.key)));

function CatalogTab() {
  const [visibleKeys, setVisibleKeys] = useState<string[]>(ALL_CATALOG_KEYS);
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [newBadge, setNewBadge] = useState(true);

  const visibleLines = visibleKeys.filter((k) => LEAF_KEYS.has(k)).length;

  return (
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
          checkedKeys={visibleKeys}
          onCheck={(keys) => {
            setVisibleKeys(keys);
            toast('Catalog visibility updated', { id: 'catalog-visibility' });
          }}
        />
        <p className="stg-catalog-count">
          {visibleLines} of {LEAF_KEYS.size} lines visible on the storefront
        </p>
      </div>

      <aside className="stg-catalog-side">
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
      width: 190,
      render: (row) => (
        <Select
          options={ROLE_OPTIONS}
          value={row.role}
          size="sm"
          disabled={row.role === 'owner'}
          aria-label={`Role for ${row.name}`}
          onChange={(next) => updateRole(row, next as TeamRole)}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 110,
      align: 'end',
      render: (row) =>
        row.status === 'active' ? (
          <Tag tone="success" size="sm">
            Active
          </Tag>
        ) : (
          <Tag size="sm">Invited</Tag>
        ),
    },
  ];

  return (
    <div className="stg-team">
      <div className="ad-toolbar">
        <p className="stg-hint">
          Everyone with access to the Arden console. Roles decide what they can edit.
        </p>
        <div className="ad-toolbar-spacer" />
        <Button variant="ghost" size="sm" onClick={() => setInviteOpen(true)}>
          Invite teammate
        </Button>
      </div>

      <Table<Teammate> columns={columns} data={team} getRowKey={(r) => r.id} hoverable />

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
      <section className="stg-adv-section">
        <h3 className="stg-section-label">API access</h3>
        <p className="stg-hint">Server-side key for the demo Storefront API.</p>
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
        <h3 className="stg-section-label">Invoice preview</h3>
        <p className="stg-hint">How receipts and PDF invoices are branded for customers.</p>
        <Watermark
          content="Arden Demo"
          rotate={-22}
          opacity={0.1}
          gap={[110, 88]}
          fontSize={13}
          className="stg-invoice-frame"
        >
          <article className="stg-invoice" aria-label="Sample invoice">
            <header className="stg-invoice-head">
              <span className="stg-invoice-brand">Arden</span>
              <span className="stg-invoice-no">Invoice · INV-1042</span>
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

      <section className="stg-adv-section stg-danger">
        <h3 className="stg-section-label">Danger zone</h3>
        <div className="stg-danger-row">
          <p className="stg-hint">
            Clears the cart and appearance preferences stored in this browser. The static demo
            catalog is unaffected.
          </p>
          <Button variant="ghost" tone="danger" onClick={resetDemoData}>
            Reset demo data
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------ 页面本体 ---------------------------------- */

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
