/**
 * 生成 VitePress 组件文档页 —— 文档站的「真相源化」:
 *   - 描述 / 分类:playground/showcase/registry/<id>.meta.ts(展示站 entry = 唯一真相源)
 *   - props 表:playground/showcase/generated/props.json(scripts/extract-props.ts 从真实 TS 抽取,禁止手抄)
 *   - 溯源 / 兼容性备注:registry/manifest.json(pnpm registry 生成,已提交入库)
 *   - 静态预览:docs/previews/<id>.md(手写精华部件,可手工维护,有则注入)
 *
 * 产物(全部提交入库,CI 用「pnpm gen:docs + git 无变更」守新鲜度):
 *   - docs/components/<id>.md(每组件一页)
 *   - docs/index.md(组件总览)
 *   - docs/.vitepress/sidebar.generated.json(侧栏,config.ts 引用)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEventParams } from '../playground/showcase/core/eventSig';

const ROOT = join(import.meta.dirname, '..');
const SHOWCASE = join(ROOT, 'playground', 'showcase');
const DOCS = join(ROOT, 'docs');
const OUT_DIR = join(DOCS, 'components');
const PREVIEWS = join(DOCS, 'previews');

// 展示站线上地址(与 pages.yml 的部署路径一致);组件页 hash 路由 = #/<id>
const SHOWCASE_URL = 'https://magicood.github.io/magic-scope/';

// —— 类型(与展示站 core/types.ts 的 ComponentMeta / PropRow 对齐,仅取生成所需子集)——
interface EventParamDoc {
  name: string;
  description: string;
}
interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
  required: boolean;
  native?: boolean;
  params?: EventParamDoc[];
}
interface ComponentMeta {
  id: string;
  name: string;
  propsName?: string;
  category: string;
  summary: string;
  description?: string;
  spread?: string;
  alsoProps?: string[];
}
interface ManifestEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  status: 'draft' | 'stable' | 'deprecated';
  version: string;
  source: {
    type: 'original' | 'inspired' | 'captured';
    url?: string;
    app?: string;
    screenshot?: string;
    capturedAt: string;
    requirements: string;
    notes?: string;
  };
}

// —— 输入①:展示站 meta(94 个 <id>.meta.ts,均为纯类型 import,可直接动态加载)——
async function loadMetas(): Promise<ComponentMeta[]> {
  const dir = join(SHOWCASE, 'registry');
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.meta.ts'))
    .sort();
  const metas: ComponentMeta[] = [];
  for (const f of files) {
    const mod = (await import(join(dir, f))) as { meta?: ComponentMeta };
    if (!mod.meta?.id) {
      throw new Error(`meta 缺失或无 id:${f}`);
    }
    metas.push(mod.meta);
  }
  return metas;
}

// —— 输入②③:props.json 与 manifest.json ——
const PROPS = JSON.parse(readFileSync(join(SHOWCASE, 'generated', 'props.json'), 'utf8')) as Record<
  string,
  PropRow[]
>;
const MANIFEST = JSON.parse(
  readFileSync(join(ROOT, 'registry', 'manifest.json'), 'utf8'),
) as ManifestEntry[];
const MANIFEST_BY_ID = new Map(MANIFEST.map((c) => [c.id, c]));

// —— 分类与排序:与展示站 core/catalog.ts 同源。catalog.ts 依赖 import.meta.glob(Vite 专属)
//    无法在 tsx 下 import,故从源码正则抽取;抽不到即报错,倒逼两侧同步。——
function loadCatalog(): {
  categories: { id: string; label: string; hint: string }[];
  order: string[];
} {
  const src = readFileSync(join(SHOWCASE, 'core', 'catalog.ts'), 'utf8');
  const categories = [
    ...src.matchAll(/\{ id: '([^']+)', label: '([^']+)', hint: '([^']+)' \}/g),
  ].map((m) => ({ id: m[1], label: m[2], hint: m[3] }));
  const orderBlock = src.match(/const ORDER: string\[\] = \[([\s\S]*?)\];/);
  const order = orderBlock ? [...orderBlock[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
  if (categories.length === 0 || order.length === 0) {
    throw new Error(
      '无法从 playground/showcase/core/catalog.ts 抽取 CATEGORIES / ORDER,请同步更新本脚本的解析逻辑',
    );
  }
  return { categories, order };
}

// —— props 组装:与展示站 core/props.ts 的 getProps 同口径(主键 → alsoProps 并入 → 去重 → spread 行)——
function getRows(meta: ComponentMeta): PropRow[] {
  const merged = [...(PROPS[meta.propsName ?? meta.name] ?? [])];
  for (const a of meta.alsoProps ?? []) {
    // 必填与否是对「所属组件」的断言:并进父表后就不成立了(Menu 甚至不接受 children,
    // 却会因为并入 Menu.Trigger 而显示 `children *`)。来源已写在说明里,这里只清掉必填标记。
    merged.push(...(PROPS[a] ?? []).map((r) => (r.required ? { ...r, required: false } : r)));
  }
  // 多接口合并会有重名(如 ConfirmOptions/PromptOptions 都有 title),按名去重保留首个。
  // 例外:原生透传行(native)不得顶掉子部件自己的同名 prop —— 原生行两张表都不渲染
  // (props 表滤掉事件、事件表滤掉 native),留着它等于让真有文档的那行凭空消失
  // (Form.Reset 的 onClick、Collapsible.Trigger 的 onClick / onKeyDown 都曾如此)。
  const at = new Map<string, number>();
  const rows: PropRow[] = [];
  for (const r of merged) {
    const i = at.get(r.name);
    if (i === undefined) {
      at.set(r.name, rows.length);
      rows.push(r);
    } else if (rows[i]?.native && !r.native) {
      rows[i] = r;
    }
  }
  if (meta.spread) {
    rows.push({
      name: '...props',
      type: `ComponentPropsWithoutRef<'${meta.spread}'>`,
      default: '—',
      description: `透传原生 ${meta.spread} 属性(className / style / aria-* / 事件等)。`,
      required: false,
    });
  }
  return rows;
}

// meta.spread 元素 → HTMLElement 类型(校正继承事件签名的元素泛型;与展示站 ComponentDocV2 的 NATIVE_EL 对齐)。
const NATIVE_EL: Record<string, string> = {
  button: 'HTMLButtonElement',
  input: 'HTMLInputElement',
  textarea: 'HTMLTextAreaElement',
  a: 'HTMLAnchorElement',
  select: 'HTMLSelectElement',
  label: 'HTMLLabelElement',
  span: 'HTMLSpanElement',
  hr: 'HTMLHRElement',
  ul: 'HTMLUListElement',
  ol: 'HTMLOListElement',
  table: 'HTMLTableElement',
  kbd: 'HTMLElement',
};

// —— 安全转义(分段感知)——
// 作者在描述里会写行内代码(`code`):code span 由 markdown-it 自带 HTML 转义且免 Vue 编译,
// 必须原样保留(在里面塞实体会被二次转义外显,如 `string[]` 曾变成 string&#91;])。
// 仅对 code span 之外的段落做压制:
//   & < >         → HTML 实体(防被当原生标签插进 DOM)
//   {{            → &#123;&#123;(防 Vue 插值;拆成「{ {」会把原文改样)
//   [             → &#91;(防「[x, y](像素)」被误解析成 markdown 链接)
//   * _           → &#42; &#95;(防 --ms-xxx-* 成对出现时被当强调符吞掉)
const escSegmented = (s: string, outside: (seg: string) => string, code: (seg: string) => string) =>
  s
    .split(/(`[^`]*`)/)
    .map((seg, i) => (i % 2 === 1 ? code(seg) : outside(seg)))
    .join('');
const escEntities = (seg: string): string =>
  seg
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{\{/g, '&#123;&#123;')
    .replace(/\[/g, '&#91;')
    .replace(/\*/g, '&#42;')
    .replace(/_/g, '&#95;');
// 表格单元:段外再转义管道符、换行转 <br>;code span 内只需转义管道符(表格切列先于 code 解析)。
const escText = (s: string): string =>
  escSegmented(
    s,
    (seg) => escEntities(seg).replace(/\|/g, '\\|').replace(/\n/g, '<br>'),
    (seg) => seg.replace(/\|/g, '\\|').replace(/\n/g, ' '),
  );
// 正文段落:同表格单元,但无需管道符/换行处理(换行由调用方按段落拆分)。
const escProse = (s: string): string => escSegmented(s, escEntities, (seg) => seg);
// 类型 / 默认值列:整体包进行内代码,仅需转义管道符。
// 内容自带反引号(模板字面量类型,如 `data-${string}`)会撕裂 code span:
// 用比内容最长反引号串更长的围栏 + 前后空格包裹(CommonMark 规则),保 span 完整。
const escCode = (s: string): string => {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t === '' || t === '—') return '—';
  const body = t.replace(/\|/g, '\\|');
  const runs = body.match(/`+/g);
  if (!runs) return `\`${body}\``;
  const fence = '`'.repeat(Math.max(...runs.map((m) => m.length)) + 1);
  return `${fence} ${body} ${fence}`;
};

const isEvent = (name: string): boolean => /^on[A-Z]/.test(name);

function propsTable(rows: PropRow[]): string {
  const lines = ['| 参数 | 类型 | 默认值 | 说明 |', '| --- | --- | --- | --- |'];
  for (const r of rows) {
    const name = `\`${r.name}\`${r.required ? ' *' : ''}`;
    lines.push(
      `| ${name} | ${escCode(r.type)} | ${escCode(r.default)} | ${escText(r.description)} |`,
    );
  }
  return lines.join('\n');
}

function eventsTable(rows: PropRow[], elType?: string): string {
  const lines = ['| 事件 | 签名 | 说明 |', '| --- | --- | --- |'];
  for (const r of rows) {
    // react-docgen 把继承事件的元素泛型统一抽成 HTMLDivElement;按组件真实根元素校正,并去掉外层括号。
    const sig = (elType ? r.type.replace(/HTMLDivElement/g, elType) : r.type).replace(
      /^\((.+)\)$/,
      '$1',
    );
    let desc = escText(r.description);
    // 与展示站 ComponentDocV2 同口径:@param 按真实签名的参数名回配,签名中不存在的参数不展示
    // (react-docgen 会把同文件其它接口的重名事件 @param 串写进来,全量拼接会张冠李戴)。
    const sigNames = new Set(parseEventParams(sig).map((p) => p.name));
    const shownParams = (r.params ?? []).filter((p) => sigNames.has(p.name));
    if (shownParams.length > 0) {
      desc += `<br>${shownParams.map((p) => `· \`${p.name}\` — ${escText(p.description)}`).join('<br>')}`;
    }
    lines.push(`| \`${r.name}\` | ${escCode(sig)} | ${desc} |`);
  }
  return lines.join('\n');
}

const SOURCE_TYPE_LABEL: Record<ManifestEntry['source']['type'], string> = {
  original: 'original · 自研原创',
  inspired: 'inspired · 受外部启发重做',
  captured: 'captured · 按截图 / 页面复刻',
};
const STATUS_BADGE: Record<ManifestEntry['status'], string> = {
  stable: '<Badge type="tip" text="stable" />',
  draft: '<Badge type="warning" text="draft" />',
  deprecated: '<Badge type="danger" text="deprecated" />',
};

function componentPage(meta: ComponentMeta, entry: ManifestEntry, hasPreview: boolean): string {
  const rows = getRows(meta);
  const ownEvents = rows.filter((r) => isEvent(r.name) && !r.native);
  const propRows = rows.filter((r) => !isEvent(r.name));
  const elType = meta.spread ? (NATIVE_EL[meta.spread] ?? 'HTMLElement') : undefined;

  const out: string[] = [];
  out.push(
    `# ${meta.name} ${STATUS_BADGE[entry.status]} <Badge type="info" text="v${entry.version}" />`,
  );
  out.push('');
  out.push(escProse(meta.summary));
  out.push('');
  out.push(
    `> **[在展示站中打开 ${meta.name}](${SHOWCASE_URL}#/${meta.id})** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。`,
  );

  if (meta.description) {
    out.push('', '## 说明', '');
    for (const para of meta.description.split('\n')) {
      if (para.trim()) out.push(escProse(para), '');
    }
  }

  if (hasPreview) {
    out.push('## 静态预览', '');
    out.push('静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。', '');
    out.push(`<!--@include: ../previews/${meta.id}.md-->`, '');
  }

  out.push('## 参数 Props', '');
  out.push('自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。', '');
  if (propRows.length > 0) {
    out.push(propsTable(propRows), '');
  } else {
    out.push('该组件无独立参数。', '');
  }

  if (ownEvents.length > 0 || meta.spread) {
    out.push('## 事件 Events', '');
    if (ownEvents.length > 0) {
      out.push(eventsTable(ownEvents, elType), '');
    }
    if (meta.spread) {
      out.push(
        `此外透传原生 \`<${meta.spread}>\` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。`,
        '',
      );
    }
  }

  if (entry.source.notes) {
    out.push('## 兼容性备注', '');
    out.push('透明披露的已知边界与契约(来自 `component.json` 的 `source.notes`):', '');
    out.push(escProse(entry.source.notes.replace(/\n/g, ' ')), '');
  }

  out.push('## 溯源', '');
  const srcRows = [
    '| 档案 | 值 |',
    '| --- | --- |',
    `| 来源类型 | ${SOURCE_TYPE_LABEL[entry.source.type]} |`,
    `| 收录日期 | ${entry.source.capturedAt} |`,
  ];
  if (entry.source.url) srcRows.push(`| 来源链接 | <${entry.source.url}> |`);
  if (entry.source.app) srcRows.push(`| 来源应用 | ${escText(entry.source.app)} |`);
  if (entry.source.screenshot) srcRows.push(`| 参考截图 | \`${entry.source.screenshot}\` |`);
  srcRows.push(`| 标签 | ${entry.tags.map((t) => `\`${t}\``).join(' ')} |`);
  out.push(srcRows.join('\n'), '');
  out.push('::: details 需求原文 / 设计意图');
  out.push(escProse(entry.source.requirements.replace(/\n/g, ' ')));
  out.push(':::', '');

  return `${out.join('\n').trimEnd()}\n`;
}

function overviewPage(
  metas: ComponentMeta[],
  categories: { id: string; label: string; hint: string }[],
  previewCount: number,
): string {
  const out: string[] = [];
  out.push('# magic-scope');
  out.push('');
  out.push(
    '可发布到 npm 的多框架 UI 组件库 + 自动化收录流水线。主题:**魔法**(深色奥术为默认预设)。',
  );
  out.push('');
  out.push('设计语言与地基蓝图见仓库 `DESIGN.md`,背景与路线图见 `FOUNDATION.md`。');
  out.push('');
  out.push(
    `库内已收录 **${metas.length}** 个组件,每个组件一页:描述、从真实 TS 类型抽取的 props 表、溯源档案${previewCount > 0 ? `,其中 ${previewCount} 个附静态预览` : ''}。**完整交互演示以 [展示站](${SHOWCASE_URL}) 为准**——参数旋钮实时改组件、逛主题画廊、一键切换主题 / 密度 / 动效 / 光影。`,
  );
  out.push('');
  for (const cat of categories) {
    const items = metas.filter((m) => m.category === cat.id);
    if (items.length === 0) continue;
    out.push(`## ${cat.label}`);
    out.push('');
    out.push(`${cat.hint} · ${items.length} 个`);
    out.push('');
    out.push('| 组件 | 简介 |');
    out.push('| --- | --- |');
    for (const m of items) {
      out.push(`| [${m.name}](/components/${m.id}) | ${escText(m.summary)} |`);
    }
    out.push('');
  }
  return `${out.join('\n').trimEnd()}\n`;
}

// —— 主流程 ——
const metas = await loadMetas();
const { categories, order } = loadCatalog();

// 与 catalog.ts 相同的排序:分类 → ORDER → 名称。
const catIndex = (c: string) => {
  const i = categories.findIndex((x) => x.id === c);
  return i < 0 ? categories.length : i;
};
const orderIndex = (id: string) => {
  const i = order.indexOf(id);
  return i < 0 ? order.length : i;
};
metas.sort((a, b) => {
  const byCat = catIndex(a.category) - catIndex(b.category);
  if (byCat !== 0) return byCat;
  const byOrder = orderIndex(a.id) - orderIndex(b.id);
  if (byOrder !== 0) return byOrder;
  // 码点序而非 localeCompare:产物已提交 + CI 逐字节比对,排序不能依赖宿主 ICU/locale。
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
});

// 分类必须落在 catalog 的合法集合里:拼错分类的组件会从总览与侧栏双双静默消失(页面成孤儿)。
const validCats = new Set(categories.map((c) => c.id));
const badCats = metas.filter((m) => !validCats.has(m.category));
if (badCats.length > 0) {
  throw new Error(
    `以下组件的 meta.category 不在 catalog.ts 的分类集合中:${badCats.map((m) => `${m.id}(${m.category})`).join(', ')}`,
  );
}

// previews/ 部件必须一一对应组件 id:孤儿部件(组件改名/删除、文件名拼错)会静默丢失预览。
const previewIdSet = new Set(metas.map((m) => m.id));
const orphanPreviews = readdirSync(PREVIEWS)
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace('.md', ''))
  .filter((id) => !previewIdSet.has(id));
if (orphanPreviews.length > 0) {
  throw new Error(
    `docs/previews/ 存在不对应任何组件 id 的孤儿部件:${orphanPreviews.join(', ')}(组件改名/删除请同步处理部件)`,
  );
}

// 三源对齐校验:meta 与 manifest 必须一一对应,缺谁都算真相源断裂。
const metaIds = new Set(metas.map((m) => m.id));
const missingInManifest = metas.filter((m) => !MANIFEST_BY_ID.has(m.id)).map((m) => m.id);
const missingInMeta = MANIFEST.filter((c) => !metaIds.has(c.id)).map((c) => c.id);
if (missingInManifest.length > 0 || missingInMeta.length > 0) {
  throw new Error(
    `meta 与 manifest 不对齐 —— manifest 缺:[${missingInManifest.join(', ')}];meta 缺:[${missingInMeta.join(', ')}]`,
  );
}
// 主接口缺失守卫:按主键(propsName ?? name)判断,不被合成的 spread 行 / alsoProps 子键掩盖
// (曾有 12 个主组件被 react-docgen 静默丢弃,页面只剩 ...props 行却零告警)。
const missingMainProps = metas
  .filter((m) => (PROPS[m.propsName ?? m.name] ?? []).length === 0)
  .map((m) => m.id);
if (missingMainProps.length > 0) {
  throw new Error(
    `${missingMainProps.length} 个组件在 props.json 中查不到主接口,参数表会失真:${missingMainProps.join(', ')}(先跑 pnpm gen:props;仍缺则是 extract-props 归属回归)`,
  );
}
// alsoProps 键缺失同样不许静默(如 Splitter.Panel 不在 props.json,Panel 全部参数无声消失)。
const missingAlso = metas.flatMap((m) =>
  (m.alsoProps ?? []).filter((a) => !PROPS[a]?.length).map((a) => `${m.id} → ${a}`),
);
if (missingAlso.length > 0) {
  throw new Error(
    `${missingAlso.length} 个 alsoProps 键在 props.json 中缺失:${missingAlso.join('; ')}(键名须与 props.json 的 displayName 完全一致)`,
  );
}

// 组件页(components/ 目录整体为生成物:先清后写,组件删除时旧页不残留)。
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
let previewCount = 0;
for (const meta of metas) {
  const entry = MANIFEST_BY_ID.get(meta.id) as ManifestEntry;
  const hasPreview = existsSync(join(PREVIEWS, `${meta.id}.md`));
  if (hasPreview) previewCount += 1;
  writeFileSync(join(OUT_DIR, `${meta.id}.md`), componentPage(meta, entry, hasPreview));
}

// 总览页。
writeFileSync(join(DOCS, 'index.md'), overviewPage(metas, categories, previewCount));

// 侧栏(config.ts 引用;biome 会检查 json,生成后即格式化保证字节级稳定)。
const sidebar = [
  {
    text: '指南',
    items: [
      { text: '组件总览', link: '/' },
      { text: '多端 / 设备适配', link: '/responsive' },
    ],
  },
  ...categories
    .map((cat) => ({
      text: cat.label,
      collapsed: false,
      items: metas
        .filter((m) => m.category === cat.id)
        .map((m) => ({ text: m.name, link: `/components/${m.id}` })),
    }))
    .filter((g) => g.items.length > 0),
];
const sidebarOut = join(DOCS, '.vitepress', 'sidebar.generated.json');
writeFileSync(sidebarOut, `${JSON.stringify(sidebar, null, 2)}\n`);
// stderr 直通:biome 失败时必须能看到诊断;Windows 下 execFile 不解析 pnpm 的 .cmd shim,需带扩展名。
execFileSync(
  process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
  ['exec', 'biome', 'format', '--write', sidebarOut],
  { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] },
);

console.log(
  `docs 已生成:${metas.length} 个组件页(${previewCount} 个含静态预览)+ 总览 + 侧栏 → docs/`,
);
