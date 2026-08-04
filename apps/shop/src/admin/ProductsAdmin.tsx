import {
  Button,
  Cascader,
  type CascaderOption,
  ColorPicker,
  Divider,
  Drawer,
  Dropdown,
  Editable,
  Form,
  Input,
  NumberInput,
  Popconfirm,
  Select,
  type SelectOption,
  Switch,
  Table,
  type TableColumn,
  Tag,
  TagInput,
  Textarea,
  toast,
  Upload,
  type UploadFile,
  useForm,
  useWatch,
} from '@magic-scope/react';
import { type CSSProperties, useState } from 'react';
import { categories, products } from '../data/products';
import type { CategoryId, ProductBadge, ProductVisualSpec } from '../data/types';
import './ProductsAdmin.css';

/* ============================================================================
 * ProductsAdmin —— 后台商品页:目录总表(行内改价 / 上下架 / 归档)+ 新建商品抽屉。
 * 表格持有 products 的本地副本,所有改动只落在组件 state(demo 语义,不回写数据源);
 * 新建走库的 Form 子系统(rule 校验),提交同样只是 toast,列表不变。
 *
 * 版式(Chromatic Grid 控制台方言):
 *   页头 → 不等分双块「超大计数(极简)/ 品类账本(密集)」→ 工具条 → 主表。
 * 品类色是这一页的信息骨架:账本条形、缩略色块、分类列色点全部由 data-cat 派生,
 * 选中某一品类时该行直接翻成满色块(.sf-cat-fill),色块即当前筛选态。
 * ========================================================================== */

/** 低库存阈值:低于该值追加 warning 色条,工具条可只看低库存。 */
const LOW_STOCK = 15;

/** 新建表单的原生 form id:提交按钮在 Drawer footer(表单外),靠 form 属性关联。 */
const NEW_PRODUCT_FORM_ID = 'pa-new-product-form';

/* ------------------------------ 表格行模型 -------------------------------- */

interface ProductRow {
  id: string;
  name: string;
  tagline: string;
  category: CategoryId;
  price: number;
  stock: number;
  rating: number;
  visual: ProductVisualSpec;
  /** 首个营销标(new / bestseller / limited);无则 null。 */
  badge: ProductBadge | null;
  /** 上架开关(本地态);关闭时该行内容退隐。 */
  active: boolean;
}

function buildRows(): ProductRow[] {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    price: p.price,
    stock: p.stock,
    rating: p.rating,
    visual: p.visual,
    badge: p.badges?.[0] ?? null,
    active: true,
  }));
}

/* ------------------------------ 静态配置 ---------------------------------- */

const categoryLabelOf = (id: CategoryId): string =>
  categories.find((c) => c.id === id)?.label ?? id;

const categoryOptions: SelectOption[] = [
  { value: 'all', label: 'All categories' },
  ...categories.map((c) => ({ value: c.id, label: c.label })),
];

const BADGE_LABEL: Record<ProductBadge, string> = {
  new: 'New',
  bestseller: 'Best',
  limited: 'Limited',
};

/** 新建抽屉的两级分类树(静态;顶层与目录四大类一致)。 */
const CATEGORY_TREE: CascaderOption[] = [
  {
    value: 'ceramics',
    label: 'Ceramics',
    children: [
      { value: 'vases', label: 'Vases' },
      { value: 'tableware', label: 'Tableware' },
      { value: 'serveware', label: 'Serveware' },
    ],
  },
  {
    value: 'lighting',
    label: 'Lighting',
    children: [
      { value: 'table-lamps', label: 'Table lamps' },
      { value: 'floor-lamps', label: 'Floor lamps' },
      { value: 'wall-lights', label: 'Wall lights' },
    ],
  },
  {
    value: 'textiles',
    label: 'Textiles',
    children: [
      { value: 'throws', label: 'Throws' },
      { value: 'cushions', label: 'Cushions' },
      { value: 'table-linen', label: 'Table linen' },
    ],
  },
  {
    value: 'objects',
    label: 'Objects',
    children: [
      { value: 'desk', label: 'Desk' },
      { value: 'candlelight', label: 'Candlelight' },
    ],
  },
];

/** colorway 预设色板:直接取目录在售色板(数据即真相,不另造颜色)。 */
const SWATCH_PRESETS: string[] = [
  ...new Set(products.flatMap((p) => p.colorways.map((c) => c.swatch))),
].slice(0, 10);

const DEFAULT_SWATCH = SWATCH_PRESETS[0] ?? '#D8C6AB';

/* ------------------------------ 线性小图标 -------------------------------- */

const iconPlus = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M7.5 2.5v10M2.5 7.5h10"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const iconSearch = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="6.7" cy="6.7" r="4.2" stroke="currentColor" strokeWidth="1.2" />
    <path d="m10.1 10.1 2.9 2.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const iconDots = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true">
    <circle cx="3.2" cy="7.5" r="1.05" />
    <circle cx="7.5" cy="7.5" r="1.05" />
    <circle cx="11.8" cy="7.5" r="1.05" />
  </svg>
);

const iconStar = (
  <svg width="11" height="11" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true">
    <path d="M7.5 1.6l1.8 3.83 4.05.52-2.98 2.8.78 4-3.65-1.98-3.65 1.98.78-4-2.98-2.8 4.05-.52L7.5 1.6Z" />
  </svg>
);

/* ------------------------------- 页面本体 --------------------------------- */

export function ProductsAdmin() {
  const [rows, setRows] = useState<ProductRow[]>(buildRows);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowOnly, setLowOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  /** 待归档行 id:由行尾菜单的 Archive 项设置,驱动该行的受控 Popconfirm。 */
  const [archiveId, setArchiveId] = useState<string | null>(null);

  const keyword = query.trim().toLowerCase();
  const visible = rows.filter((row) => {
    if (keyword && !row.name.toLowerCase().includes(keyword)) return false;
    if (categoryFilter !== 'all' && row.category !== categoryFilter) return false;
    if (lowOnly && row.stock >= LOW_STOCK) return false;
    return true;
  });

  /** 品类账本:SKU 数 / 均价 / 在库件数(件数决定条形宽度,四类天然不等长)。 */
  const ledger = categories.map((c) => {
    const list = rows.filter((r) => r.category === c.id);
    const total = list.reduce((sum, r) => sum + r.price, 0);
    return {
      id: c.id,
      label: c.label,
      count: list.length,
      avg: list.length ? Math.round(total / list.length) : 0,
      units: list.reduce((sum, r) => sum + r.stock, 0),
    };
  });
  const maxUnits = ledger.reduce((max, item) => Math.max(max, item.units), 0) || 1;
  const lowCount = rows.filter((row) => row.stock < LOW_STOCK).length;

  const patchRow = (id: string, patch: Partial<ProductRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  /** 行内改价:提交时校验数字,合法才落本地并 toast(非法则受控值自动还原)。 */
  const commitPrice = (row: ProductRow, next: string) => {
    const value = Number(next);
    if (!Number.isFinite(value) || value < 1) {
      toast.warning('Enter a price of $1 or more.');
      return;
    }
    patchRow(row.id, { price: Math.round(value * 100) / 100 });
    toast.success('Price updated');
  };

  const archiveRow = (row: ProductRow) => {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    setArchiveId(null);
    toast.success(`${row.name} archived`);
  };

  /** 下架行的内容列退隐(Active 开关与行尾操作保持全亮,便于恢复)。 */
  const dimIfOff = (row: ProductRow) => (row.active ? '' : 'pa-cell-off');

  const columns: TableColumn<ProductRow>[] = [
    {
      key: 'visual',
      header: <span className="pa-sr-only">Preview</span>,
      width: 68,
      cellClassName: dimIfOff,
      render: (row) => (
        // 缩略块:底色 = 品类色,内部剪影 = 该商品自己的形体色,呼应买家端 ProductVisual
        <span
          className="pa-thumb"
          data-cat={row.category}
          style={{ '--pa-body': row.visual.body } as CSSProperties}
          aria-hidden="true"
        >
          <i className="pa-thumb-form" data-shape={row.visual.shape} />
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      cellClassName: dimIfOff,
      render: (row) => (
        <span className="pa-product">
          <span className="pa-product-line">
            <span className="pa-product-name">{row.name}</span>
            {row.badge && (
              <Tag size="sm" tone="neutral" className="pa-badge">
                {BADGE_LABEL[row.badge]}
              </Tag>
            )}
          </span>
          <span className="pa-product-tagline">{row.tagline}</span>
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: 130,
      cellClassName: dimIfOff,
      render: (row) => (
        <span className="pa-cat" data-cat={row.category}>
          <i className="sf-dot sf-cat-dot" />
          {categoryLabelOf(row.category)}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'end',
      width: 122,
      sortable: true,
      cellClassName: dimIfOff,
      render: (row) => (
        <span className="pa-price">
          <span aria-hidden="true">$</span>
          <Editable
            value={String(row.price)}
            onChange={(next) => commitPrice(row, next)}
            size="sm"
            selectAllOnFocus
            inputAriaLabel={`Price of ${row.name}, dollars`}
            classNames={{ preview: 'pa-price-preview', input: 'pa-price-input' }}
          />
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'end',
      width: 104,
      sortable: true,
      cellClassName: dimIfOff,
      render: (row) => {
        const low = row.stock < LOW_STOCK;
        return (
          // 色条槽位常驻:低库存才着 warning 色,数字列因此始终对齐
          <span className="pa-stock">
            <span className="pa-num">{row.stock}</span>
            <span className="pa-low" data-on={low || undefined}>
              {low && <span className="pa-sr-only">Low stock</span>}
            </span>
          </span>
        );
      },
    },
    {
      key: 'rating',
      header: 'Rating',
      align: 'end',
      width: 96,
      cellClassName: dimIfOff,
      render: (row) => (
        <span className="pa-rating">
          <span className="pa-num">{row.rating.toFixed(1)}</span>
          {iconStar}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Active',
      align: 'center',
      width: 84,
      render: (row) => (
        <Switch
          size="sm"
          checked={row.active}
          onChange={(event) => patchRow(row.id, { active: event.target.checked })}
          aria-label={`${row.name} is listed in the store`}
        />
      ),
    },
    {
      key: 'actions',
      header: <span className="pa-sr-only">Actions</span>,
      align: 'end',
      width: 56,
      render: (row) => (
        // 受控 Popconfirm 锚在整个操作位上:菜单选 Archive 后弹出,确认才真正移除
        <Popconfirm
          open={archiveId === row.id}
          onOpenChange={(open) => {
            if (!open) setArchiveId(null);
          }}
          placement="top-end"
          tone="danger"
          title="Archive this product?"
          description="It leaves this list — demo only, nothing is saved."
          confirmText="Archive"
          onConfirm={() => archiveRow(row)}
          onCancel={() => setArchiveId(null)}
          trigger={
            <span className="pa-row-actions">
              <Dropdown
                placement="bottom-end"
                trigger={
                  <Button variant="ghost" size="sm" iconOnly aria-label={`Actions for ${row.name}`}>
                    {iconDots}
                  </Button>
                }
                items={[
                  {
                    label: 'Duplicate',
                    onSelect: () => toast('Product duplicated — demo only, list unchanged'),
                  },
                  { type: 'separator' },
                  { label: 'Archive…', danger: true, onSelect: () => setArchiveId(row.id) },
                ]}
              />
            </span>
          }
        />
      ),
    },
  ];

  return (
    <div className="ad-content pa-page">
      <header className="ad-page-header">
        <div>
          <span className="sf-kicker pa-eyebrow">Catalog</span>
          <h1 className="ad-page-title">Products</h1>
          <p className="ad-page-sub">Prices, stock and shopfront visibility.</p>
        </div>
        <div className="ad-page-actions">
          <Button size="sm" leftIcon={iconPlus} onClick={() => setDrawerOpen(true)}>
            New product
          </Button>
        </div>
      </header>

      {/* 不等分双块:左边一个超大数字(极简),右边一份密集账本(密度反差) */}
      <section className="pa-masthead">
        <div className="sf-tile sf-tile-ink pa-count">
          <span className="sf-kicker">In view</span>
          <p className="sf-numeral pa-count-n">{visible.length}</p>
          <p className="pa-count-note">of {rows.length} published</p>
          <span className="ad-status pa-count-low">
            {lowCount} under {LOW_STOCK} units
          </span>
          <span className="sf-spectrum pa-count-edge">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className="sf-tile pa-ledger">
          <div className="pa-ledger-head">
            <span className="sf-kicker">By category</span>
            <span className="sf-index">SKU / AVG PRICE / UNITS IN STOCK</span>
          </div>
          <div className="pa-ledger-rows">
            {ledger.map((item, index) => {
              const on = categoryFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-cat={item.id}
                  aria-pressed={on}
                  className={on ? 'pa-led sf-cat-fill' : 'pa-led'}
                  onClick={() => setCategoryFilter(on ? 'all' : item.id)}
                >
                  <span className="sf-index pa-led-i">{String(index + 1).padStart(2, '0')}</span>
                  <span className="pa-led-name">{item.label}</span>
                  <span className="pa-led-track">
                    <span
                      className="pa-led-bar"
                      style={{ inlineSize: `${Math.round((item.units / maxUnits) * 100)}%` }}
                    />
                  </span>
                  <span className="pa-led-sku">{item.count} SKU</span>
                  <span className="pa-led-avg">${item.avg} avg</span>
                  <span className="pa-led-units">{item.units}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="ad-card ad-toolbar pa-toolbar">
        <Input
          className="pa-search"
          size="sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products…"
          prefix={iconSearch}
          clearable
          aria-label="Search products by name"
        />
        <Select
          size="sm"
          options={categoryOptions}
          value={categoryFilter}
          onChange={(next) => setCategoryFilter(next as string)}
          classNames={{ trigger: 'pa-cat-trigger' }}
          aria-label="Filter by category"
        />
        <Switch size="sm" checked={lowOnly} onChange={(event) => setLowOnly(event.target.checked)}>
          Low stock only
        </Switch>
        <div className="ad-toolbar-spacer" />
        <span className="pa-local-hint">Inline edits are local to this demo.</span>
      </div>

      <div className="ad-card pa-table-card">
        <Table<ProductRow>
          columns={columns}
          data={visible}
          size="sm"
          hoverable
          getRowKey={(row) => row.id}
          classNames={{ wrap: 'pa-table', th: 'pa-th', row: 'pa-tr', td: 'pa-td' }}
          empty={<p className="pa-empty">No products match the current filters.</p>}
        />
      </div>

      <NewProductDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

/* ------------------------------ 新建商品抽屉 ------------------------------- */

type NewProductValues = {
  name: string;
  description: string;
  /** Cascader 路径(大类 / 子类)。 */
  category: string[];
  price: number | null;
  tags: string[];
  colorway: string;
};

const NEW_PRODUCT_DEFAULTS: NewProductValues = {
  name: '',
  description: '',
  category: [],
  price: null,
  tags: [],
  colorway: DEFAULT_SWATCH,
};

const CATEGORY_IDS: readonly string[] = categories.map((c) => c.id);

/** 表单节标题:小号眉标坐在发丝线上,给密集表单分段。 */
const FormSection = ({ index, label }: { index: string; label: string }) => (
  <Divider spacing="none" textAlign="start" className="pa-form-rule">
    <span className="sf-kicker">
      <span className="sf-index">{index}</span>
      {label}
    </span>
  </Divider>
);

/** 草稿预览:订阅名称 / 分类 / 色板,把「品类色 + 色板色」当场画出来。 */
const DraftPreview = () => {
  const name = useWatch('name');
  const path = useWatch('category');
  const swatch = useWatch('colorway');

  const head = Array.isArray(path) && typeof path[0] === 'string' ? path[0] : '';
  const cat = CATEGORY_IDS.includes(head) ? head : undefined;
  const leaf = Array.isArray(path) && typeof path[1] === 'string' ? path[1] : '';
  const color = typeof swatch === 'string' ? swatch : DEFAULT_SWATCH;
  const title = typeof name === 'string' && name.trim() ? name.trim() : 'Untitled product';

  return (
    <div className="pa-draft" data-cat={cat}>
      <span className="pa-thumb pa-draft-thumb" style={{ '--pa-body': color } as CSSProperties}>
        <i className="pa-thumb-form" data-shape="arch" />
      </span>
      <span className="pa-draft-text">
        <span className="pa-draft-name">{title}</span>
        <span className="pa-draft-path">{leaf ? `${head} / ${leaf}` : 'No category yet'}</span>
      </span>
    </div>
  );
};

function NewProductDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const form = useForm<NewProductValues>({ defaultValues: NEW_PRODUCT_DEFAULTS });
  // Upload 不入表单值:demo 只在本地列出文件名,不发起任何请求
  const [files, setFiles] = useState<UploadFile[]>([]);

  const handleFiles = (next: UploadFile[]) => {
    if (next.length > files.length) toast('Upload is mocked in this demo');
    setFiles(next);
  };

  /** 校验全过才会走到这里:关抽屉、清草稿,列表按 demo 语义保持不变。 */
  const handleCreate = () => {
    onClose();
    form.reset();
    setFiles([]);
    toast.success('Product created — demo only, list unchanged');
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title="New product"
      classNames={{ panel: 'pa-drawer-panel', footer: 'pa-drawer-footer' }}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={NEW_PRODUCT_FORM_ID}>
            Create product
          </Button>
        </>
      }
    >
      <Form form={form} id={NEW_PRODUCT_FORM_ID} onSubmit={handleCreate} className="pa-form">
        <DraftPreview />

        <FormSection index="01" label="Identity" />

        <Form.Field
          name="name"
          label="Name"
          required
          rule={{ required: 'Give the product a name.' }}
        >
          <Input placeholder="e.g. Duna Vase" maxLength={60} />
        </Form.Field>

        <Form.Field
          name="description"
          label="Description"
          help="Two or three quiet sentences, in the house voice."
        >
          <Textarea
            placeholder="What it is, how it is made, why it stays."
            autosize={{ minRows: 3, maxRows: 6 }}
            maxLength={280}
            showCount
          />
        </Form.Field>

        <FormSection index="02" label="Placement" />

        {/* Cascader 未登记 Form 适配器,按契约走 render-prop 接 field */}
        <Form.Field
          name="category"
          label="Category"
          required
          rule={{ required: 'Choose a category.' }}
        >
          {(field) => (
            <Cascader
              id={field.fieldId}
              options={CATEGORY_TREE}
              value={Array.isArray(field.value) ? (field.value as string[]) : []}
              onChange={(next) => field.setValue(next)}
              placeholder="Category / subcategory"
              fullWidth
            />
          )}
        </Form.Field>

        <div className="pa-form-row">
          <Form.Field
            name="price"
            label="Price"
            required
            rule={{ required: 'Set a price.', min: { value: 1, message: 'Price starts at $1.' } }}
          >
            <NumberInput min={1} prefix="$" />
          </Form.Field>

          <Form.Field name="colorway" label="Colorway">
            {(field) => (
              <ColorPicker
                id={field.fieldId}
                value={typeof field.value === 'string' ? field.value : DEFAULT_SWATCH}
                onChange={(next) => field.setValue(next)}
                format="hex"
                alpha={false}
                presets={SWATCH_PRESETS}
                aria-label="Colorway swatch"
              />
            )}
          </Form.Field>
        </div>

        <Form.Field name="tags" label="Tags" help="Press Enter or comma to add a tag.">
          {(field) => (
            <TagInput
              value={Array.isArray(field.value) ? (field.value as string[]) : []}
              onChange={(next) => field.setValue(next)}
              placeholder="e.g. stoneware, small batch"
              addOnBlur
              inputProps={{ id: field.fieldId }}
            />
          )}
        </Form.Field>

        <FormSection index="03" label="Imagery" />

        <div className="pa-upload-block">
          <span className="pa-upload-label">Images</span>
          <Upload
            multiple
            accept="image/*"
            fileList={files}
            onChange={handleFiles}
            triggerText="Drop images here, or click to browse"
            hint="Files are only listed locally in this demo."
          />
        </div>
      </Form>
    </Drawer>
  );
}
