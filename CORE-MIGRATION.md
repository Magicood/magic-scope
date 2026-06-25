# 抽 headless 内核 —— 迁移打样图

> 多框架架构(**路线 C**:框架无关 headless 逻辑内核 `packages/core` + 各框架薄壳 + 共享 CSS)的落地蓝图。
> 本文是一次**只读源码体检**(2026-06)的产出,作为将来"抽内核试点"的直接参照。
> **现在不抽**(react 组件仍在铺、API 未稳,过早抽象会反复改契约);等组件稳了,照本文做。
> 架构总决策见记忆 `magic-scope-architecture`;归类/深度遵 `component-categorization-rule` / `component-depth-mandate`。

---

## 0. 一句话结论

库离 `core` 比预想近 —— 难抽的只有 2 个(且"不进 core"才对),真正的拦路虎不是"能不能抽",而是 **i18n 接入率**(35 个 key 仅 1 个组件在用、11 个还硬编码),这债必须在 core 化前还清。

**全库一条天然分界线**:**「焦点算在哪」= 纯逻辑 → 进 core;「焦点移过去」= DOM 副作用 → 留薄壳。** 这刀在 35 个组件里都成立,就是 core / 壳的切口。

---

## 1. 可抽取性体检(35 组件)

| 桶 | 组件 | 性质 |
| --- | --- | --- |
| **轻壳(~18)** | Button · Switch · Kbd · Label · Card · Badge · Tag · Alert · Progress · Spinner · Skeleton · Divider · Timeline · Avatar · Checkbox · Textarea · Slider · Breadcrumb | 零/极薄逻辑,core 顶多收一两个 class/纯函数工具,差异全在模板语法 —— **路线 C 最佳样板** |
| **教科书级状态机(~9,主战场)** | Tabs · Menu · ContextMenu · Pagination · Accordion · Select · Radio · NumberInput · Input | 纯逻辑(键盘 / roving / 受控解析 / 步进 / 折叠)与"施加部分"(`focus()` / `showPopover` / ref 合并)边界清晰 |
| **store 型(~5,可平移)** | Toast · AlertDialog (及命令式族) | 模块级纯 store 已现成,几乎原样进 core,只单条计时器 / portal 缠 React |
| **难抽(2,但不进 core 才对)** | Dialog · Drawer | 状态机全外包原生 `<dialog>`,本体 = `open ↔ 命令式 DOM` 薄胶水。**只抽 `syncNativeDialog` / `lockBodyScroll` / `nextId` 三个纯 DOM 工具,组件本体不进 core** |

**三个共性信号(抽取的指南针):**
- **(a) 受控/非受控解析**(`resolveControlled` / `createDisclosure`)在 Tabs / Popover / Popconfirm / Radio / Slider / Input / NumberInput / Table **八处**重复 → 第一优先级公共原语。
- **(b) roving + 跳 disabled 的索引计算**(`nextEnabled` / `moveFocus` / `firstEnabled`)在 Tabs / Menu / ContextMenu / Accordion 几乎逐行重复 → 合并为单一 `createRovingFocus`。
- **(c)** 上面那条「算焦点(纯)/ 移焦点(DOM)」切割线,全库一致。

---

## 2. 改造优先级(8 条)

1. **[公共原语先行]** 抽 `resolveControlled()` / `createDisclosure()` 进 core —— 八处重复的受控解析模式,所有抽取的地基,**优先级最高**。
2. **[消重]** 合并 Menu 与 ContextMenu 的键盘内核为单一 `createMenuKeyboard` / `createRovingFocus`(两组件逐行重复),Accordion/Tabs 的 `nextEnabled/edgeEnabled` 并入同一 roving 原语。
3. **[i18n 存量债,阻断项]** 11 个组件硬编码中文须批量改 `t()` / `translate()`(见 §3);命令式三件套必须走 `translate()` 单例而非 hook。**不还清就 core 化 = 把硬编码复制进 vue/angular 三套。**
4. **[i18n 核心加固]** 平移 `messages.ts` 前,先把裸模块单例 `activeMessages` 升级为 scope 安全 store,补 locale 概念与 dir/RTL 元数据(见 §3 的 P1–P4)。
5. **[最值得压契约的内核]** Select 的 listbox 键盘状态机是教科书级纯 reducer,但与 Popover API / rAF 聚焦 / anchorName 深缠 —— 抽取时把命令式副作用干净留壳,只让 core 出"状态 + 动作意图"。
6. **[store 型平移]** Toast / AlertDialog 的模块级 store 几乎原样进 core,唯需把 message 的 `ReactNode` 类型参数化脱 React,单条计时器做成 `createToastTimer(duration,onExpire) → {pause,resume,dispose}` 纯原语。
7. **[纯函数即抽]** `Pagination.buildRange` / `Avatar.getInitials` / `Progress.clamp` / `ContextMenu.clampToViewport` / `Breadcrumb.buildBreadcrumbModel` 已是零依赖纯函数,可立即下沉 `core/util` 作"零风险首批",顺带验证 core 的打包/导出/测试链路。
8. **[Dialog/Drawer 反模式确认]** 明确这俩本体不进 core,只抽 3 个纯 DOM 工具 —— 避免有人把"open ↔ showModal 胶水"硬塞进 core 状态机。

---

## 3. i18n 外置规范

> 对齐组件会话已起步的 `messages.ts`(commit 618a26c)两层分离,补齐 SSR/locale/dir 三处加固。目标:**一次外置,三框架共享。**

**已做对、保留不动:**
- 数据层 `messages.ts` 零 import、`defaultMessages` 纯 JSON 可序列化、`formatMessage`/`resolveMessage` 纯函数 → 原样平移 core。
- key 命名 `domain.action` 点分制(`input.clear`)规整,沿用。
- `t(key, vars?, fallback?)` 签名定为**三框架统一契约**。
- 命令式单例通道(`setActiveMessages`/`translate`)方向正确,保留但要升级(见下)。
- `resolveMessage` 的"覆盖→默认→fallback,缺 key dev warn"策略保留。

**core 目录结构(语言包注册表,取代裸单例):**
```
packages/core/src/i18n/
  keys.ts      MessageKey 联合(唯一真源,三框架共享)
  locales/zh-CN.ts、en.ts …(每个 = Messages 纯数据 + 元数据 { dir:'ltr'|'rtl' })
  registry.ts  registerLocale(locale, messages) / getLocale,内置包按需懒注册
  format.ts    formatMessage + 预留可插拔 ICU/plural formatter 接口
  resolve.ts   resolveMessage(覆盖→当前 locale→默认 locale→fallback)
  store.ts     createI18nStore({ locale, overrides }) → 订阅式 store,取代 let activeMessages
```

**四处必须加固(平移前解决):**
- **P1 单例串台**:`let activeMessages` 是模块级可变全局,SSR 并发 / 一页多 locale 子树下,命令式 API 只反映最后挂载者,卸载 reset 误伤兄弟 Provider。→ 升级为 **scope 安全 store**(显式 owner 栈或按 host 隔离),命令式 `translate` 读 store 当前快照。
- **P2 dev 探测**:`isDev()` 读 `process.env.NODE_ENV`,Vite/浏览器 ESM 下 `process` 常缺(已 try-catch 安全但 dev warn 失效)。→ core 暴露 `setDevMode()`,各框架构建期常量(`import.meta.env.DEV` / NG 环境)注入。
- **P3 无 locale 概念**:当前切语言 = 换整份 `PartialMessages`,无 locale 标识、无内置语言包注册表。→ 补 `registerLocale` / `setLocale`,三框架共享同一份语言包。
- **P4 插值仅 `{var}`**:无复数 / ICU(`select.selected「已选 {count} 项」`英文需复数)。→ `format.ts` 预留可换 formatter,v1 仍走简单插值。

**dir/RTL 接入点(全库当前 0 处理,新增):** 语言包元数据带 `dir`;core 的 `setLocale` 暴露当前 `dir`,薄壳写到根 `dir` 属性 + `data-ms-dir`;组件 CSS 用逻辑属性(`margin-inline-start`/`inset-inline`)。库已大量用 `--ms-*` + 逻辑布局,RTL 增量小,只差"读 `locale.dir` 写 dom"一根接线。

**各框架适配(数据+纯函数+store 全进 core,每框架仅 30–60 行绑定):**
- React:`useMessages() → t`(现状即薄壳)。
- Vue:`provide/inject` 暴露 `t`(或 computed),Provider 挂载时 `store.setLocale/overrides`。
- Angular:`MessagesService`(DI) + `TranslatePipe`(`{{ 'input.clear' | t }}`)。
- 命令式(三框架共用):`translate(key, vars?)` 直接读 core store。

**存量债清单(core 化前必还,11 组件,key 字典已备齐、仅未消费):**
`Pagination`(prev/next/page `{page}`) · `Drawer`×2 / `Dialog` / `Toast`(close + region) · `Table`(empty/selectAll/selectRow `{index}`/selectionColumn) · `NumberInput`(increment/decrement) · `Tag`(remove) · `Select`(placeholder) · `Spinner`(label) · `Popconfirm`(confirm/cancel) · `AlertDialog`(confirm/cancel,走 `translate()` 单例)。

**落地顺序:** `messages.ts` 抽 core 并升级 store(补 locale/dir,解 P1–P4)→ 批量还 11 组件硬编码 → 再起 vue/angular 薄壳。

---

## 4. 内核契约草案

`packages/core` 两类形态:
1. **store** —— 有内部状态 / 订阅的有状态内核(disclosure / listbox / toast)。
2. **getXxxProps()** —— 把"状态 → 各元素该绑的属性"派生成**框架无关纯对象**,薄壳取来摊到模板。

**切割铁律:core 只产出「状态 + 动作意图 + props 描述」,绝不碰 DOM。** `focus()` / `scrollIntoView()` / `showPopover()` / ref 合并 全部留薄壳。

### 公共原语(第一优先,八处复用)
```ts
function resolveControlled<T>(controlled: T | undefined, internal: T): { value: T; isControlled: boolean };

interface Disclosure { open: boolean; setOpen(next: boolean): void }
function createDisclosure(opts: {
  open?: boolean; defaultOpen?: boolean; onOpenChange?(o: boolean): void;
}): Store<Disclosure>;

// Store<S> = { getState(): S; subscribe(fn: () => void): () => void; ...actions }
// React 用 useSyncExternalStore 订阅;Vue shallowRef + onScopeDispose;Angular signal + DI。
```

### 具体内核示例:Tabs(状态机最干净,首个打样)
```ts
// ---- 输入 ----
interface TabsItem { value: string; disabled?: boolean }
interface TabsConfig {
  items: TabsItem[];
  value?: string; defaultValue?: string;
  onChange?(value: string): void;
  idBase: string;            // 壳层注入(React useId 清洗 / Vue useId / Angular 自增),core 不生成 id
}

// ---- store 状态 ----
interface TabsState { selected: string | undefined; activeItem: TabsItem | undefined }

// ---- 动作:产出『意图』,焦点落地由壳层执行 ----
interface TabsActions {
  select(value: string): void;                       // 受控则只回调 onChange,非受控改内部
  onKeyDown(currentIndex: number, key: string): { activateIndex: number } | null; // 纯计算,跳 disabled、循环
}
function createTabsStore(config: TabsConfig): Store<TabsState> & TabsActions;

// ---- getXxxProps():状态 → 各元素属性(框架无关纯对象)----
function getTabListProps(): { role: 'tablist' };
function getTabProps(item: TabsItem, index: number): {
  role: 'tab'; id: string;                           // `${idBase}-tab-${value}`
  'aria-selected': boolean; 'aria-controls': string;
  'aria-disabled': true | undefined; disabled: boolean | undefined;
  tabIndex: 0 | -1;                                  // roving:仅选中且未禁用 = 0
  onActivate(): void;                                // = select(value) + 焦点意图
  onKey(key: string): { activateIndex: number } | null;
};
function getTabPanelProps(): { role: 'tabpanel'; id: string; 'aria-labelledby': string; tabIndex: 0 } | null;
```
**薄壳职责(对照现 `Tabs.tsx`):** `useSyncExternalStore(store)` 取 state;map 时把 `getTabProps` 摊到 `<button>`;`onClick=()=>{ p.onActivate(); tabRefs[i].focus(); tabRefs[i].scrollIntoView?.() }`;`onKeyDown=e=>{ const r=p.onKey(e.key); if(r){ e.preventDefault(); focus/scroll(r.activateIndex) } }`。**idBase / tabRefs / focus() / scrollIntoView() 全留壳,core 只回 `activateIndex` 与 props 描述。**

### Select 内核示意(更重的 listbox 如何切)
`createSelectStore(config)` 产出 `{ open, activeIndex, selectedIndex, value }` + actions:
- `onTriggerKeyDown(key)` / `onListKeyDown(key)` → 返回 `{ open?, activeIndex?, commit? }` **意图对象**;
- `getTriggerProps()` / `getListboxProps()` / `getOptionProps(item, i)`(含 `aria-activedescendant`/id/role/`aria-selected`);
- placeholder 经 `translate('select.placeholder')` 取,不再硬编码。

壳层据意图执行 `showPopover()`/`hidePopover()`(命令式带降级)、rAF 聚焦 listbox、anchorName 绑定 —— **平台能力 / 副作用一律不进 core**。

**契约验收点:** 同一个 core store + `getXxxProps()`,三框架壳除模板语法与 `focus/showPopover/ref` 命令式落地外,**不应再写任何键盘 / 受控 / roving / aria 派生逻辑**。

---

## 5. 试点:压契约的 5 个组件

刻意覆盖**五种"缠 React 方式"**,把契约边界一次性逼出来(而非挑 5 个相似的轻组件):

| # | 组件 | 压的难点轴 |
| --- | --- | --- |
| 1 | **Tabs** | roving + 受控解析 + 派生 tabIndex —— 状态机最干净,先立标杆,验证"算焦点/移焦点"核心切割线 |
| 2 | **Select** | listbox 键盘 + Popover 平台能力 + 命令式副作用 —— 最难也最有示范价值,决定整个浮层族(Popover/Menu/Tooltip)契约可行性 |
| 3 | **NumberInput** | 受控数字中间态 + 步进 —— 压"受控 `value→text` 同步如何脱离 React `useEffect` 重述",是 Input/Table 等受控协调类的通用难点 |
| 4 | **Pagination** | 纯数据驱动 + 零状态 + 插值 i18n —— 验证"纯函数即抽"零风险路径 + `t('pagination.page',{page})` 首个真实插值消费 |
| 5 | **Toast** | 模块级 store + 命令式 API + 计时器原语 + 命令式取词 —— 代表"全局 store"最难脱 React 的形态,连带验证 AlertDialog/命令式族 |

**为什么是这 5 个:** 分别压住「原子 roving / listbox+平台能力 / 受控同步 / 纯数据驱动 / 全局 store+命令式」五条独立难点轴。任一条契约站不住都会在这 5 个里暴露;反过来,这 5 个跑通,剩下 30 个组件基本是这五类的同构或更轻版本,**契约即可定稿推广**。

---

## 6. 落地顺序(将来执行)

1. **公共原语**:`resolveControlled` / `createDisclosure` / `createRovingFocus` 下沉 `packages/core`,顺带跑通 core 的打包/导出/测试链路(可拿 §2.7 的纯函数当首批)。
2. **i18n 还债 + 加固**:`messages.ts` 抽 core 升级为带 locale/dir 的 store(解 P1–P4),批量还清 11 组件硬编码。**这步是抽内核的前置阻断项,必须先做。**
3. **5 个试点压契约**:Tabs → Select → NumberInput → Pagination → Toast,确认 `store + getXxxProps()` 契约对五条难点轴都成立。
4. **契约定稿**后横向铺其余 30 个组件(多为这五类的同构/更轻版本)。
5. **起薄壳**:react(等价重构、对外 API 不变、有测试兜底)→ vue → 单独攻 angular(最重,别当"照抄 vue")。
6. **Dialog/Drawer** 全程只抽 3 个纯 DOM 工具,本体留各框架壳。
