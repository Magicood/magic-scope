# @magic-scope/react

## 0.2.1

### Patch Changes

- 80e06ff: Menu.Trigger 补全文档化的 props 类型,并修 React 19 下的 ref 读取路径

  `Menu.Trigger` 原先用内联的 `{ children: ReactElement }` 作 props 类型,唯一的 `children` 又没有 JSDoc —— react-docgen 在自定义 propFilter 之前就会剔掉无文档的 `children`(`skipChildrenPropWithoutDoc` 默认开),导致该子组件抽出 0 行 props、整条被丢弃,`Menu.Trigger` 从未出现在参数表里。现改为导出的 `MenuTriggerProps` 接口并补齐注释,参数表恢复。

  同时 `Menu` 读取子元素自身 ref 的三处(`trigger` 主用法路径、`Menu.Item` 的 `asChild`、`Menu.Trigger`)统一改用 `child.props.ref ?? child.ref`(与 `Tooltip` 同口径),不再走 React 19 已废弃的 `element.ref` 通道 —— 该通道会打废弃告警,且 React 声明将来会移除,届时会静默丢掉子元素自身的 ref。

  `Menu.Item` / `Menu.Group` 的 prop 说明加上所属子组件前缀,便于在合并后的参数表里区分归属。

## 0.2.0

### Minor Changes

- 95cdb76: AlertDialog 新增 prompt():命令式输入弹窗

  `prompt(message, options)` 返回 `Promise<string | null>`(确认返回输入值 / 取消·Esc·遮罩返回 null),与 confirm/alert 共用同一 `<AlertDialogHost />` 队列与原生 `<dialog>`。内建输入框(复用 `ms-input`)、打开即聚焦并全选、Enter 提交;支持 `placeholder` / `defaultValue` / `title` / `confirmText` / `cancelText`。补齐 confirm / alert / prompt 三件套。

- d88b0fa: Checkbox 新增 `indeterminate` 半选态

  `indeterminate?: boolean` 经合并 ref 落到原生 input 的 `.indeterminate`(仅视觉、不改 checked 取值),方块染主色并以横杠替代对勾。常用于「全选」框的部分选中态(Table 行选择即用它)。

- 615dc4f: 新增 AlertDialog 命令式确认/提示弹窗(confirm + alert)

  `confirm(message, options)` 返回 `Promise<boolean>`(确认/取消·Esc·遮罩)、`alert(message, options)` 返回 `Promise<void>`,配 `<AlertDialogHost />` 渲染容器(模块级队列 + `useSyncExternalStore`,无需 Provider)。基于原生 `<dialog>` + `showModal()` 白嫖焦点陷阱/Esc/top-layer,`role=alertdialog` + `aria-labelledby/describedby`,danger 变体确认按钮染危险色且默认焦点落在取消(防误触销毁性操作),锁背景滚动、进出场动画、安全区、窄屏动作纵向排布、尊重 `prefers-reduced-motion`。与已有的声明式通用模态 Dialog 互补。含 7 个功能测试 + 文档 / playground 演示。

- c13a789: 新增 ContextMenu 右键菜单组件

  右键(contextmenu)在包裹区域内弹出,定位在光标处(越界自动夹回视口),portal 到 body;点选 / 点外 / Esc / 滚动关闭;↑↓ / Home / End / Enter 键盘可达,`role=menu/menuitem`,支持 `disabled` / `danger` 项。菜单项结构与 Menu 一致、复用 `.ms-menu__item` 视觉。区别于点击锚定展开的 Menu。含 4 个功能测试 + playground 演示。

- fd4c729: 新增 Drawer 侧边抽屉组件

  基于原生 `<dialog>` + `showModal()`(焦点陷阱、Esc、`::backdrop`、top-layer)。受控 `open` + `onClose`,四个方向滑入(`side`: start/end/top/bottom),可选 `title` 头部(`aria-labelledby` 关联)+ 内建关闭按钮(无标题时浮于右上角),点击遮罩关闭(`dismissable`)、锁背景滚动、安全区避让、进出场滑动动画、尊重 `prefers-reduced-motion`。含 6 个功能测试 + playground 演示。

- 61ef7b3: 新增 NumberInput 数字步进输入组件

  − / 原生 `input[type=number]`(spinbutton 语义、方向键步进) / ＋ 合为一个描边控件,隐藏原生 spinner。内部以「显示文本」管理,规避受控数字框打不出小数点 / 中间态的经典问题;步进与失焦时夹取到 `[min,max]`,到达边界自动禁用对应步进按钮。支持受控(`value`)与非受控(`defaultValue`)、`min/max/step`、`sm/md/lg`、清空回调 `null`;设备适配开箱即用(触控热区 `--ms-target-min` + 加宽步进按钮、`focus-within` 发光、hover 守卫、sm 字号 ≥16px 防 iOS 缩放、`prefers-reduced-motion`)。含 10 个功能测试 + 文档 / playground 演示。

- 18f841c: 新增 Popconfirm 气泡确认组件

  锚定在元素旁的轻量确认气泡(非全屏模态)。复用 Popover(原生 Popover API + CSS Anchor Positioning,点外 / Esc 关闭),内建确认 / 取消按钮流;支持 `title` / `description`、`confirmText` / `cancelText`、`danger` 变体(确认按钮染危险色)、`placement`。常用于列表内联删除确认;区别于全屏的 `confirm()` 与装任意内容的 Popover。含 4 个功能测试 + playground 演示。

- 55f5b93: 新增 Radio 单选组件(RadioGroup + Radio)

  补齐表单控件缺口(此前有 Checkbox/Switch 无单选):

  - **RadioGroup**:`role="radiogroup"`,context 下发 name / 选中值 / 尺寸 / 禁用,支持受控(`value`)与非受控(`defaultValue`),`onValueChange` 回调;`orientation` 映射 `aria-orientation`。
  - **Radio**:基于原生 `input[type=radio]`,同名自动获得方向键导航与 roving tabindex;圆点控件 checked 染主色显内点,与 Checkbox 视觉语言一致。
  - 设备适配开箱即用:触控热区(`--ms-target-min`)、hover 守卫(`@media (hover: hover)`)、`focus-visible` 发光环、`prefers-reduced-motion`;sm/md/lg 三档尺寸。
  - 10 个功能测试覆盖单选语义、受控/非受控、name 共享、disabled、尺寸、独立使用。

- 4ab3673: 新增 Slider 滑块组件

  基于原生 `input[type=range]` 的数值滑块,遵循「原生优先」:白嫖可访问的 slider 语义(`role=slider` + `aria-valuenow/min/max`、方向键 / Home / End),`appearance:none` + `::-webkit-slider-*` / `::-moz-range-*` 自绘轨道 / 填充 / 发光滑块(填充用 WebKit 渐变 + Firefox 原生 progress)。支持受控与非受控、`min/max/step`、`sm/md/lg` 三档、可选数值显示(`showValue` / `formatValue`);设备适配开箱即用(触控放大滑块 + `--ms-target-min` 行高、hover 守卫、`focus-visible` 发光环、`prefers-reduced-motion`)。含 7 个功能测试 + 文档 / playground 演示。

- a949854: 新增 Timeline 时间线 / 信息流组件(Timeline + TimelineItem)

  声明式组合:语义化 `<ol>` 的 `Timeline` + 若干 `TimelineItem`(`<li>`)。竖向轴 + 节点圆点(可用 `icon` 换图标)+ `::before` 连线(末项不画);节点按变体 `default/primary/success/warning/danger/info` 着色并带克制辉光。每条含 `title`、次级 `time`(渲染为 `<time>`)、正文。适合历史记录、进度、动态流;逻辑属性 RTL 友好、`overflow-wrap` 防长串溢出。含 6 个功能测试 + 文档 / playground 演示。

- e2db619: 新增 Toast 命令式通知(toast + Toaster)

  模块级 store + `toast()` 函数(可在组件外任意处调用,无需 Provider)+ `<Toaster />` 渲染容器(`useSyncExternalStore` 订阅、portal 到 body、6 向定位、安全区避让)。变体 `default/success/warning/danger/info`(快捷方法 `toast.success/error/warning/info`),自动消失 + 悬停/聚焦暂停、可手动关闭(`toast.dismiss(id)`)、可带描述与行动按钮;`danger/warning` 用 `role=alert`、其余 `role=status`;进出场动画(`@starting-style` + 退场标记)、尊重 `prefers-reduced-motion`、触控热区达标。对标 sonner 架构但自研、不 wrap 第三方。含 9 个功能测试 + 文档 / playground 演示。

- 8e2df7b: feat(react): 新增 DatePicker 日期选择器(v2 旗舰)+ 独立 Calendar

  - **零 React 日期内核** `logic.ts`:月历矩阵、加减月/年、范围判定、夹取、本地 ISO 解析,全部纯函数,可平移 `@magic-scope/core`;日期一律按本地时区年月日处理(toISO 用本地 Y-M-D,非 UTC,避免跨时区偏一天)。
  - **single / range 双模**,range 带悬停预览 + 预设(presets);**date / month / year 三视图**导航;完整键盘操作(方向键 / PageUp-Down / Home-End / Enter)。
  - **min / max / disabledDate** 约束(日格、月格、年格联动灰显);可清除、今天快捷。
  - **本地化**:月名 / 周名 / 显示格式经 `Intl.DateTimeFormat` 按 `locale` 取(不硬编码),UI 文案(今天 / 清除 / 上下月)走全库 i18n 字典;`weekStart` 可配。
  - 复用全库 **Popover** 做浮层(点外 / Esc / 12 向 placement);trigger 仿 Input,`tone` 聚焦发光 + `invalid`→danger(便于嵌进 Form);多态 `as`、细粒度 `classNames`、受控/非受控(value / rangeValue / open)。
  - 日历用语义 `<table>`(thead 周名 `th[scope=col]` + tbody 日格 button),日格带完整日期 aria-label、aria-current(今天)、aria-pressed(选中)。
  - 独立导出 `Calendar` 供内联日历使用。新增 11 个 `datePicker.*` i18n 文案。

  logic 14 + 组件 12 测试。lint / tsc / build / size 全绿。

- 156ac92: 事件基建:composeEventHandlers / composeRefs 工具 + 修 Button asChild 事件与 ref 合并

  针对「组件覆盖用户事件处理器、asChild 丢 ref」的系统性问题,落地共享基建:

  - 新增 `composeEventHandlers(theirs, ours, { checkDefaultPrevented })`:先调用户处理器,未 `preventDefault` 再调组件内部处理器(Radix 范式),用于组件根/子元素既挂自己处理器又保留用户处理器。
  - 新增 `composeRefs` / `setRef`:合并多个 ref(asChild 把外部 ref 与子元素自身 ref 都接上)。
  - 新增 `mergeAsChildProps`:asChild 合并组件与子元素 props——`on*` 事件 compose、`className` 拼接、`style` 合并、其它子元素优先。
  - **修复 Button `asChild`**:此前 `{...props, ...child.props}` 让子元素同名事件覆盖、Button 收到的 onClick 被静默丢弃,且 ref 未传给子元素。改用 `mergeAsChildProps` + `composeRefs`:两边 onClick 都触发、外部 ref 正确拿到渲染出的 `<a>`/Link DOM。
  - 工具从包入口导出,消费者构建自定义组件可复用。

  这套是后续给全部组件补齐事件(语义回调 + 原生透传 + compose)的地基。

- e1984fc: feat(react): 新增 Form 表单子系统 + 校验引擎(v2 旗舰)

  一套对标 react-hook-form 性能 + antd Form 声明式 + 端到端类型安全三者之长的表单子系统:

  - **零 React 校验内核**(`logic.ts`):`createFormStore` 细粒度 path 切片订阅(打字只重渲单字段、表单根与兄弟字段零 re-render)、校验引擎 `validateField`/`validateForm`、内建规则 + 纯函数路径读写,全部零 React、可平移 `@magic-scope/core`。
  - **双轨校验可叠加**:per-field rules(required/min/max/minLength/maxLength/pattern/email/url/自定义,零依赖、可 i18n)+ Standard Schema v1(zod≥3.24 / valibot / arktype 经 `~standard.validate`,核心零运行时依赖)。异步校验自带 AbortController 竞态取消 + 防抖。
  - **10 个异形控件显式适配器表**(`adapters.ts`):Input/Textarea/NumberInput/Checkbox/CheckboxGroup/RadioGroup/Switch/Slider/Rate/Segmented/Select,吸收 value/onChange/checked 形态差异,事件经 `composeEventHandlers` 合并不覆盖用户处理器。
  - **公开 API**:`useForm` / `useField` / `useWatch` / `useFormContext`;`Form` / `Form.Field`(别名 `Form.Item`)/ `Form.Submit` / `Form.Reset` / `Form.List` / `Form.ErrorSummary`;`FieldPath<T>` / `PathValue<T,P>` 端到端类型安全的命令式 api(setValue/trigger/getValues)。
  - **a11y**:label↔control 关联、aria-invalid/describedby/required、错误 role=alert、提交聚焦首个错误字段。多态 `as` / `asChild`、整表 `disabled` 下发、细粒度 `classNames`。
  - **魔法差异化**:校验失败态复用全库 tone resolver 发光、错误文案滑入不抖布局、validating 旋转符文;density/motion/fx/tone 在 Form 根一处切、整表派生。

  新增 11 个 `form.*` i18n 默认校验文案 key(可覆盖)。

- 283183e: 新增 6 个功能组件:Segmented / Empty / Result / Rate / Descriptions / Steps

  高频功能件,接 tone/光影/动效降级/密度/留口/事件:

  - **Segmented**:分段控制器(options 数据驱动 + 滑块 indicator 平滑跨段 + 受控 value/onChange + 键盘导航 + tone + size + block);logic.ts。
  - **Empty**:空状态(内置极简插画 SVG / 预设 / 自定义 / 关闭 + i18n 默认文案 + tone 着色 + size + asChild + 操作区槽);logic.ts。
  - **Result**:结果页(7 态 success/error/info/warning/404/403/500,各派生默认图标+配色 + title/subtitle/extra 槽 + tone + asChild);logic.ts。
  - **Rate**:评分(受控 + count + allowHalf 半星 + allowClear + 自定义 character + 键盘步进 + hover 预览 + readOnly/disabled + tone 金色 + tooltips + role=slider a11y);logic.ts。
  - **Descriptions**:描述列表(items/Descriptions.Item 双入口 + 响应式 columns + span 跨列 + bordered + layout horizontal/vertical + tone + size);logic.ts。
  - **Steps**:步骤条向导(items/Steps.Step + 受控 current + onChange 跳步 + status 派生 tone + direction + progressDot + size);logic.ts。

  全部:forwardRef、`...rest` 透传、composeEventHandlers、classNames 部件映射、内容边界、动效双降级、strict TS、纯逻辑 logic.ts。i18n 字典补 `empty.description`。+63 测试,全量 **705 无回归**,registry **54 组件**,dts strict 通过。

- 618a26c: 新增 i18n 文案字典(框架无关化地基第一块)

  为多框架/可换 locale 铺路:面向用户的文案不再焊死在 JSX 里,集中成可替换字典。

  - `messages.ts`(**纯数据 + 纯函数,零框架依赖,将来可原样平移进 `packages/core`**):`defaultMessages`(zh-CN 全集,纯数据、可 JSON、译者可改)、`formatMessage`(`{var}` 插值)、`resolveMessage`(覆盖 → 默认 →fallback,缺 key 时 dev 警告而非把内部点分串泄漏到 UI)、`PartialMessages` 类型(索引含 `undefined`,使 strict `noUncheckedIndexedAccess` 下的合并不报 TS2322)、`translate`/`getActiveMessages`/`setActiveMessages` 模块单例通道(供 React 树之外的命令式 API 如 confirm/alert/toast 取文案)。
  - React 绑定(极薄):`MessagesProvider`(合并父级 + 覆盖,并同步写入模块单例)、`useMessages()` 返回稳定的 `t(key, vars?, fallback?)`。
  - 首个接入:`Input` 的清除/密码切换 `aria-label` 改走字典(默认行为不变)。其余 ~30 处既有硬编码文案为存量债,随各组件迭代逐步迁移。
  - v1 仅简单插值;复数(plural/ICU)延后。

  设计经对抗式校验(修掉了 strict 合并报错、命令式 API 取值通道缺失、缺 key 裸泄漏等真实坑)。

- 704cf64: Input 深度化:旗舰输入框接入 tone 系统 + 完整框内/框外能力

  继 Button 之后第二个深度旗舰,对齐「生产可用、非最小版」标准:

  - **框内 affix**:`prefix` / `suffix` 放图标或文字(货币符、单位、状态点)。
  - **框外拼接**:`addonBefore` / `addonAfter` 连续控件段(如 `https://` … `.com`、协议选择器),自动合并圆角与边界、消除重复描边。
  - **clearable**:有值时显示清除钮,一键清空并聚焦;受控(经原生 setter 派发 input 事件通知父级)/ 非受控皆可。
  - **type=password**:自动加明文切换钮(👁 / 🙈),`aria-label` 随状态变化。
  - **showCount**:配合 `maxLength` 显示 `当前/上限`,随输入实时更新。
  - **tone 聚焦发光环**:读全库 tone 槽位(`--ms-c` / `--ms-c-glow`),`invalid` 自动切 danger;三档 `size` 随 `data-ms-density` 缩放(把密度管线接活)。
  - DOM 重构为「容器框 `.ms-input` + 裸输入 `.ms-input__field`」:**React 组件 API 向后兼容**(`size`/`invalid` 用法零改动),仅静态 class 用法的内部结构有变。原 2 测试更新 + 共 9 个测试全过。

- f0a5f84: 新增 layout 布局分类:Stack / Flex / Grid / Container / Center / AspectRatio

  补齐第二个结构性分类(layout),全部多态 + **响应式断点对象** + 间距 token 化 + RTL 逻辑属性:

  - **Stack**:一维堆叠(direction/gap/align/justify/wrap 均响应式)+ `divider` 子项间插 + inline;as/asChild;logic.ts。
  - **Flex**:通用 flexbox(direction/align/justify/wrap/gap 响应式,行列 gap 可分)+ **Flex.Item**(grow/shrink/basis/order);logic.ts。
  - **Grid**:CSS Grid(`columns` number/模板/响应式 + `minChildWidth` 自适应列 auto-fit + gap/align/autoFlow,均响应式)+ **Grid.Item**(colSpan/rowSpan/start,响应式)+ 容器查询模式;logic.ts。
  - **Container**:定宽居中(size 档对齐断点 + fluid + 响应式 padding clamp + 安全区避让 + centered 动态视口高);logic.ts。
  - **Center**:居中盒(axis/inline/gap/padding/minBlockSize,响应式);logic.ts。
  - **AspectRatio**:宽高比盒(CSS aspect-ratio + 旧引擎 padding-top 兜底 + 子媒体铺满/object-fit,ratio 响应式);logic.ts。

  **响应式机制**:断点对象(`{ base, sm, md, lg, xl, 2xl }`)由 logic.ts 纯函数解析成带断点后缀的 CSS 变量,CSS 用静态 `@media`/`@container` 级联回退链消费(对齐 device.css 断点常量)——体现「按能力适配、不枚举机型」的多端语义。全部 forwardRef、`...rest` 透传、asChild、内容边界、strict TS;纯解析逻辑 logic.ts 零 React(可平移 core)。+83 测试,全量 **642 无回归**,registry **48 组件**,dts strict 通过。

- 36f49d6: P1 设备适配:窄屏内容重排 —— Table 卡片化 + Breadcrumb 折叠(容器查询驱动)

  - **Table**:窄容器(≤ 容器断点 `rune` 28rem)转卡片式重排——每行一张卡、单元格以列名(`data-label`,取自字符串表头)就地前缀、表头视觉隐藏但保留无障碍语义;选择列 / 展开行 / 汇总行 / 斑马纹 / 固定列(sticky 复位)均已适配。优先于 P0 的 coarse 横滚兜底,窄触屏读表更友好。
  - **Breadcrumb**:层级 >3 时注入仅窄容器(≤ `rune` 28rem)显形的折叠占位,把中间层级折叠为**可点击展开**的省略号(复用 `maxItems` 折叠的省略号按钮样式与 `expanded` 状态,disclosure 语义完整);与 `maxItems` JS 折叠协同,不出现双省略号。
  - 两者均为 `@container` 容器查询驱动(对父容器而非视口自适应),桌面 / 宽容器渲染逐像素不变。
  - 窄容器折叠省略号的 `aria-label` 走字典 key `breadcrumb.expand`(带 `{count}` 插值),与 `maxItems` 折叠省略号一致。
  - 已知约束:容器查询组件需要来自上下文的确定宽度,置于 fit-content 包装中时折叠不生效(容器化已限定到 `--collapsible` 变体收窄影响面,详见 `docs/responsive.md`)。

- 0d22eac: P1 设备适配:浮层窄触屏底部抽屉(bottom sheet)形态

  Dialog / Select / Menu 在窄触屏(`max-width: 30rem` 且 `pointer: coarse`)转为底部抽屉:贴底、满宽、仅上圆角、自底滑入(`@starting-style` 首帧过渡),根治窄屏锚定浮层的出界、密集误点与居中卡片的局促。

  - **Dialog**:非 `full` 变体转 sheet,面板限高露出遮罩;`full` 变体照旧铺满。
  - **Select / Menu**:覆盖 CSS Anchor Positioning 与降级定位为贴底 sheet,长列表限高内滚(`60svh` 封顶),底部安全区(`--ms-safe-bottom`)已避让;Menu 的 placement 方位间距在 sheet 形态归零。
  - 触发条件带 `pointer: coarse`:桌面窄窗口(精确指针)与宽屏维持原居中卡片 / 锚定下拉,逐像素不变;`prefers-reduced-motion` / `data-ms-motion="off"` 下滑入退化为瞬时切换。

- d42689a: 溯源随包:`@magic-scope/react` 构建时把组件的 `component.json` 溯源汇总成 `dist/registry.json` 一并发布,并新增导出 `@magic-scope/react/registry.json`。消费端可直接读取每个组件的来源、收录日期与需求,「可追溯」从 git 仓库延伸到安装后的包内。
- db2df9a: 新增**进场 / 滚动特效系统**(对标现代 web 动效编排):

  - **`<Reveal>` / `<RevealGroup>` / `useReveal()`** 三层 API —— 18 种特效:fade、四向飞入(up/down/left/right)、双轴复合、zoom-in/out、flip-x/y 翻转、rotate、blur 聚焦、clip 四向幕布、mask 四向遮罩、text 逐行/逐词/逐字、shine 扫光、parallax 视差、progress 滚动进度。三种触发:`view`(滚动进视口)/ `mount`(挂载即播)/ `scrub`(滚动驱动)。
  - **框架无关 CSS 契约** `reveal.css`(`data-ms-reveal` 声明 + `data-ms-inview` 状态机,transition 跑、无 FOUC),Vue / WC 可直接复用。
  - **受三轴自动调制**:位移 / 缩放 / 模糊乘 `--ms-motion-scale`、时长引 `--ms-dur-*`、扫光乘 `--ms-fx-glow`;"动效 全/弱/关" + `prefers-reduced-motion` 零改动一键管住,关档瞬时直显、无障碍兜底。
  - **性能**:单例 IntersectionObserver(按参数分桶,全站 1–3 实例);stagger 用 CSS `--i` 零 JS timer;只动 transform/opacity/filter/clip-path;scrub 走原生 `animation-timeline` 不上 scroll 监听。
  - **搭配**:包裹任意组件,或 `asChild` 零额外 DOM 层。

- d88b0fa: Table 增强(P1):排序 / 行选择 / 空态·加载态 / 粘性表头

  Table 从基础表升级为数据表格,新能力默认关闭、旧 `columns/data` 用法零改动(`TableProps<T>` 泛型默认 `Record<string, ReactNode>`):

  - **排序**:`column.sortable` + `sortState`/`defaultSortState`/`onSortChange`,受控(只回调、外部排好)与非受控(内置 `sorter`/默认比较器)双轨;三态 asc→desc→ 无序;表头原生 `<button>` + `aria-sort`,键盘可达。
  - **行选择**:`rowSelection`(受控 `selectedKeys`/`onChange`),全选三态(复用 Checkbox `indeterminate`),选中行高亮 `data-ms-selected`;每个选择框带 `aria-label`。
  - **空态 / 加载态**:`empty`(默认「暂无数据」)、`loading`(Spinner 遮罩 + `aria-busy`)、`skeletonRows`(骨架行)。
  - **粘性表头**:`stickyHeader` + `maxHeight`,限高可滚、表头吸顶(`border-collapse` 下用 inset 阴影画底线规避边框丢失)。
  - **列**:`render` 自定义单元格、`headerClassName`/`cellClassName`;斑马纹迁到 `.ms-table__row--data`(为后续展开行让路)。
  - 新增 `.ms-sr-only` 工具类(`device.css`,统一隐藏-但-可读出口)。

  分页不内建(组合现有 `<Pagination>`);展开行 / 列固定 / 列宽调整 / 虚拟滚动属后续阶段。

- aa26502: 修复 Timeline 连线:短条目下整条轴不可见,alternate 模式节点错位、reverse 模式连线归属反了

  同一族的连接件几何缺陷,真浏览器实测确认四处:

  - **连线断在条目间距处,短条目时高度直接为 0。** 条目间距原本写在 `.ms-timeline__item`(li)的 `padding-block-end` 上,而连线所在的节点列作为 flex 子项只 stretch 到 li 的**内容盒**,穿不过 padding。只有 `title` + `time`(无正文)时,连线算出来是 0 高 —— 整条时间线一条线都看不见;有正文时也只画到内容盒底,每两个节点之间缺 24px。现把间距移到 `.ms-timeline__content` 的 `padding-block-end`,节点列被拉满整条。
  - **`mode="alternate"` 在 ≥32rem 容器下中轴完全不可见,且圆点/图标被推到最右缘。** 绝对定位的节点列只锚了内联轴、块轴放任 auto → 高度塌成圆点高度(20px),连线算出 -2px 被钳成 0;同时 `justify-content: center` 已经把节点居中,却又叠了一层 `inset-inline-start: 50%`,净效果是节点贴右边。现补 `inset-block: 0` 撑满整条、删掉多余的位移;该装饰层现在盖住整条,一并加 `pointer-events: none`,不再吞掉正文的点击与拖选。
  - **`mode="alternate"` 的内容列没被锁在中轴一侧。** 基础规则的 `flex-grow: 1` 把内容撑满整行,`inline-size: calc(50% - 1.5rem)` 形同虚设 —— 左右分居只是靠 `text-align` 装出来的,长正文会直接横过中轴(轴线画出来后会被文字压住)。现连 `flex` 一起改写,内容列实打实锁在一侧、离中轴 1.5rem。
  - **`reverse` 的连线归属整体反了。** `column-reverse` 下 DOM 末项才是视觉首项,而画不画由 `:not(:last-child)` 决定 —— 视觉最顶那条没有线、视觉最底那条挂一条悬空线。现按 reverse 镜像成对;虚线与 pending 的相邻规则同步镜像,pending 节点补上连线元素(reverse 时它是视觉首项,连线归它自己画)。

  连带改进:

  - 连线改为节点列(竖向 flex)里的伸缩子项,不再用「绝对定位 + 魔法偏移量」。高度自适应节点尺寸(圆点 18px / 图标 24px 都不用改数,原先图标会被连线压进圆底 4px),也不会再出现负高度被钳成 0 的整段消失。
  - 新增 `--ms-tl-line-w` 控制线宽,取 `max(1px, var(--ms-hairline, 1px))`(与 Anchor 的竖向导轨同写法):跟随发丝线 token 但不低于 1px —— retina 上直接用 0.5px 会让连线在节点列里居中到 11.75px、正好跨在设备像素中缝被反锯齿摊淡,反而比修复前更看不清。虚线的瓦片宽度同步跟随该变量。
  - **修掉一处一直失效的触屏最小热区**:`min-block-size: max(0, var(--ms-target-min))` 里的裸 `0` 在 math function 内部是 `<number>` 不是 `<length>`,类型不一致 → 整条声明在计算期作废。真浏览器实测计算值是 `0px`、元素实际高度 0,等同于没写过。改成 `max(0px, …)` 后实测 48px 生效。全库仅此一处,已加进 CSS 静态红线。
  - 新增 `--ms-tl-gap` 定制口:改一个变量即可调整全线疏密。
  - 连线 / 内容 / 虚线 / `mode=right` / `mode=alternate` 的规则统一改用子组合器,嵌套 Timeline(把一个 Timeline 放进 `TimelineItem` 的 children)时外层规则不再串味到内层。实测:外层 alternate 宽容器下,内层 Timeline 的节点列仍是 `position: relative` / 1.5rem 宽、内容仍是 `flex: 1 1 auto`,不再被外层打成绝对定位半宽。

  行为变更提示:

  - 条目间距不再由 `.ms-timeline__item` 的 `padding-block-end` 产生 —— 若你按旧结构覆写过该 padding,请改为直接设 `--ms-tl-gap`。
  - 反过来,**若你覆写过 `.ms-timeline__content` 的 padding**(尤其是 `padding` 简写、或给 content 加卡片式 background / border),间距现在寄生在这一层:简写会把间距连带抹掉,卡片会把间距吃进自己的盒子里。改用 `--ms-tl-gap` 调间距,或在覆写里显式补回 `padding-block-end`。
  - `.ms-timeline__item` 的边框盒高度**没有变**(间距只是从 li 的 padding 搬进了 content 的 padding),给条目加 background / border / 圆角、以及 interactive 的 hover 高亮块,视觉盒子与原来一致。
  - 触屏下可交互条目的最小热区**现在才真正生效**(此前那条 `min-block-size` 因裸 `0` 一直是死的,见上)。若你把 `--ms-tl-gap` 调到很小做紧凑时间线,热区仍由 `--ms-target-min` 托底。
  - 条目 `<li>` 必须是 `<ol>` 的直接子节点:显隐规则改成子组合器后,在 `Timeline` 和 `TimelineItem` 之间包一层普通元素会让**整条时间线一根线都不画**(且不会报错)。要包装请用零 DOM 层的写法,如 `<Reveal asChild>`。
  - `reverse` 与 `alternate` 的视觉输出会发生可见变化(补上原本缺失的线、去掉悬空线、节点回到中轴)。

- 13122c6: 差异化地基:全库 tone 系统 + 教科书级 Button(深度化第一刀)

  针对「组件停在最小版、无差异化优势」的反馈,落地深度化样板:

  - **tone resolver(支点)**:新增 `tone.css`,`.ms-tone-{primary|accent|success|warning|danger|info|neutral}` 把当前语义色统一映射到 6 个槽位(`--ms-c` / `--ms-c-hover` / `--ms-c-active` / `--ms-on-c` / `--ms-c-soft` / `--ms-c-glow`),全部 `color-mix` 派生自已有角色、零硬编码色。组件只读槽位,换肤改一处全库联动——这是别人(各组件各写语义色)结构上学不来的护城河。
  - **Button 重构为旗舰深度组件**:`tone`(6 色)× `variant`(solid/soft/outline/ghost/link)× `size`(**随 `data-ms-density` 缩放,把此前 0 引用的密度管线接活**)+ `loading`(旋转环 + `aria-busy` + 保持宽度防抖动 + 禁用)、`leftIcon`/`rightIcon`/`iconOnly`、`fullWidth`、`shape`(pill/square)、实例级 `glow`(off/hover/always)、`asChild`(渲染为 `<a>`/路由 Link 保留样式)。
  - **新增 `ButtonGroup`**:吸附相邻按钮(共享边界、圆角只留两端)。
  - 向后兼容:旧 `variant`/`size` 用法零改动,原 3 个测试 + 6 个新深度测试全过。

- 522e49a: feat(react): 新增 Tree 树形控件(v2 旗舰)

  - **零 React 树内核** `logic.ts`:可见节点扁平化、后代/祖先收集、勾选级联上下传播、半选派生,全部纯函数,可平移 `@magic-scope/core`。
  - **级联勾选模型**(非 checkStrictly):checkedKeys 仅存「完全勾选」,半选由 `deriveHalfChecked` 派生;toggle 向下传后代、向上重算祖先;disabled 子树不参与级联。
  - **扁平 ARIA tree**:`li` 经 aria-level/posinset/setsize 表达层级(非 DOM 嵌套),role=tree/treeitem、aria-expanded/selected/checked(mixed 半选)/disabled。
  - **完整键盘导航**:↑↓ 移焦、→ 展开或进子、← 折叠或回父、Home/End、Enter 选中、Space 勾选,roving tabindex + 焦点落格。
  - **受控/非受控三态**(expanded / selected / checked)独立;单选/多选、节点图标、引导线、blockNode 整行可点、密度缩放、tone 选中高亮。

  logic 11 + 组件 13 测试。lint / tsc / build / size 全绿。

- b1f63de: 新增 6 个 typography 组件:Heading / Paragraph / Code / Link / Blockquote / List

  补全文字排版分类(此前仅 Text),全部站在 Text 底座、复用 tone/魔法/typography token,带留口/事件/i18n:

  - **Heading**:`level`(1–6)定语义标签 + `variant` 视觉档(display/title/subtitle/overline/caption,视觉与语义解耦)+ family display 魔法标题 + gradient/glow + wrap=balance + **anchor permalink**(hover 浮出 # 锚点,文档/Prose 必备,slug/CJK/显式 id)+ as/asChild;logic.ts 纯函数。
  - **Paragraph**:size/leading/tone/dimmed + **ellipsis 多行省略可展开**(AntD 式,onExpandChange)+ **copyable**(剪贴板 + 复制成功魔法 glow 一闪)+ classNames + as/asChild;logic.ts。
  - **Code**:行内 `<code>` / `block` 块级 `<pre>`(tabSize/lineNumbers/横向滚动)+ 4 variant(solid/soft/outline/ghost)× tone + size + 块级 copyable;logic.ts(剪贴板三级兜底 + 抽纯文本)。
  - **Link**:underline 四态(auto/hover/always/none)+ tone + `:visited` + **external 一键安全化**(target/rel + 外链图标 + sr-only i18n)+ disabled + asChild 路由 + glow;logic.ts(rel 合并/external/disabled)。
  - **Blockquote**:4 variant(bordered/filled/card/plain)+ tone(强调条/柔底/辉光读槽位)+ cite/citeUrl + icon/quoteMark + gradient 强调条 + accentSide RTL;logic.ts。
  - **List**:variant(unordered/ordered/description → ul/ol/dl)+ marker 自定义 + tone(::marker 着色)+ spacing(随密度)+ List.Item 子部件 + 嵌套。

  全部:forwardRef、`...rest` 透传、className/style + classNames 部件映射、内容边界、动效双降级、strict TS。i18n 字典补 `typography.copy/copied/expand/collapse/permalink`、`link.newWindow`。+65 测试,全量 **559 无回归**,registry 42 组件,dts strict 通过。

  至此 **typography 分类 7 个组件**(Text + 这 6 个)。

- 6dfdbc3: 新增 typography 文字排版分类 + Text 旗舰核心

  文字排版作为独立结构性分类(`category: "typography"`,与 layout 并列)启动,Text 为旗舰核心:

  - **Text 多态文字原语**:`as`(多态标签)+ `asChild`(Slot 合并到子),把可控文字属性收成 props——字族(sans/serif/mono/display)、流式字号档、字重(语义档 + 数值可变字体)、斜体、tone 着色、对齐、行高、字距、transform、下划线/删除线、单行 `truncate`(头/尾)+ 多行 `lineClamp`、折行 `wrap`(balance/pretty)、`whitespace`、`breakWord`、`hyphens`、`dir`、数字变体(`numeric` tabular 等宽)、`smallCaps`、`selectable`、`writingMode`(竖排),以及**魔法文字**:`gradient`(tone 渐变 / aurora 流光)、`glow`(辉光)、`stroke`(描边),与**魔法动效** `animate`:`reveal`/`blur-in`(入场)+ `shimmer`/`pulse`/`flow`(持续)——全复用 tone/fx/动效档,受 `data-ms-motion` 与 `prefers-reduced-motion` 调制、一键降级且入场态降级后直接呈现不卡隐藏。
  - **留口充分**:`...rest` 透传所有原生属性与事件;`className`/`style` 与计算值合并(用户优先);`forwardRef` 到渲染元素;冷门属性走 `style`/`className` 逃生舱。
  - **透明备注**:`text-wrap`/`-webkit-line-clamp`/`background-clip:text`/`hyphens`/`-webkit-text-stroke` 等兼容性逐条标在 prop TSDoc,渐变文字 `@supports` 回退实色不裸奔。
  - **共享尺度 `typography.css`**:`--ms-type-step-*`(流式 clamp 字阶)/`--ms-leading-*`(补 snug=1.4)/`--ms-tracking-*`(新增字距轴)/`--ms-font-serif`(系统 serif 栈),挂 `ms.tokens` 层,组件内兜底——待架构线接入正式 type scale 后改引用即可,组件不破。
  - `::selection` 接通契约现成的 selection/onSelection 角色。9 个测试,全量 187 无回归,dts strict 通过。

  设计经穷尽属性目录(85 项)+ 主流库调研 + 完整性对抗校验。Kbd/Label 维持现 category 不折叠。

- b9ff9b8: 组件补强 Wave 1:Switch / Avatar / Kbd / Alert / Progress / Badge 从最小版到生产级

  对标旗舰 Button/Input/Text,把 6 个最「最小版」的组件按已立标准(深度 / 光影+动效 / 留口 / i18n / a11y)补厚:

  - **Switch**:size(sm/md/lg,随密度)+ tone(7 色,读槽位)+ children 文字 + checkedIcon/uncheckedIcon + loading;修 reduced-motion 合规与 motion-scale 误用;trackClassName/thumbClassName 留口。
  - **Avatar**:接 tone 系统 + name 哈希确定性配色 + status 状态点(可呼吸)+ 加载失败兜底 + asChild + shape(circle/rounded/square)+ ring/bordered + 实例级 glow;**新增 AvatarGroup**(重叠堆叠 +N 占位);抽出 logic.ts 纯函数。
  - **Kbd**:**keys 自动拆键帽** + 平台符号映射(⌘⌃⌥⇧,mac/win)+ tone + lg 档 + separator 槽;logic.ts 纯解析。
  - **Alert**:4 变体重写为读 tone 槽位 + icon/title/action/dismissible 子部件 + classNames 细粒度 + asChild + @starting-style 进场 + role 语义分流(alert/status)+ 关闭文案走 i18n。
  - **Progress**:size/tone + 环形进度 + 条纹 + 不确定态动效降级 + label 槽。
  - **Badge**:tone 解析器(per-tone CSS 压成 per-variant)+ dot 圆点 + count 数字角标(max/showZero/overlap)+ size。

  全部:发光受 `--ms-fx-glow` + `data-ms-fx=off` 总闸,动效受 `prefers-reduced-motion` + `data-ms-motion=off` 双降级,尺寸随 `--ms-density-scale`。i18n 字典补 alert.close + avatar.status.\*。+61 测试,全量 248 无回归,dts strict 通过。向后兼容。

- f95072e: 组件补强 Wave 2:Dialog / Drawer / Popover / Tabs / Accordion / Breadcrumb(深度 + 光影动效 + 事件齐全)

  浮层/导航类补厚,并把**事件覆盖**做透(原生 `...rest` 透传、内部处理器一律 `composeEventHandlers` 合并用户的、补齐语义回调):

  - **Dialog**:复合子组件 Dialog.Header/Title/Description/Body/Footer(自动 aria-labelledby/describedby)+ size(sm/md/lg/full)+ placement + tone + classNames/panelProps/asChild;事件 `onOpenChange`/`onEscapeKeyDown`/`onPointerDownOutside`(可 preventDefault 拦截关闭)。
  - **Drawer**:size 档 + Drawer.Footer 固定底栏 + header 整块槽 + tone;同套浮层事件 + 点遮罩 pointerdown+click 双判定防误关。
  - **Popover**:placement 扩 12 向 + `arrow` 箭头 + `triggerAction`(click/hover/focus/manual)+ openDelay/closeDelay + tone;trigger 全事件 compose + ref 合并;`onEscapeKeyDown`/`onPointerDownOutside`;浮层 `...rest` 透传;logic.ts 纯函数。
  - **Tabs**:tone + orientation(horizontal/vertical)+ size(随密度)+ 单滑块 indicator 平滑位移 + keepMounted + classNames;`onTabClick`/`onKeyDown`/`onClose`(可关闭标签)+ 根 `...rest`。
  - **Accordion**:受控 value/`onValueChange`(single/multiple)+ collapsible + tone + 修 grid 过渡可达性;`onItemToggle`/根 `...rest`。
  - **Breadcrumb**:i18n nav 文案 + `renderItem` render-prop(路由库集成)+ `onItemClick`(SPA 拦截)+ 折叠省略 + tone + 根 `...rest`。

  接全库 tone 槽位、发光受 `--ms-fx-glow`、动效受 `prefers-reduced-motion`+`data-ms-motion` 降级。+47 测试(含事件 compose 验证),全量 295 无回归,dts strict 通过。向后兼容。

- 852d10f: 组件补强 Wave 3:Select / Popconfirm / Tooltip / Pagination(复杂组件深度 + 事件齐全)

  复杂浮层/数据组件补厚,事件契约做到生产级:

  - **Select**:接 tone + i18n;**clearable / loading / 空态 / searchable(内联搜索过滤)/ multiple(多选 tag)**;renderOption/renderValue 槽 + option icon/description + classNames 部件定制;事件 `onOpenChange`(受控/非受控)/`onClose`(带关闭原因)/`onEscapeKeyDown`/`onPointerDownOutside`(可拦截)/`onHighlightChange`/`onSelect`/`onClear`/`onSearch`/`onFocus`/`onBlur`;`...rest` 透传 trigger;logic.ts 纯函数。
  - **Popconfirm**:i18n 文案 + tone + icon 槽;**异步 `onConfirm`(返回 Promise → 按钮 loading、resolve 才关、reject 保持打开)**;受控 open/`onOpenChange`;`onEscapeKeyDown`/`onPointerDownOutside` 可拦截;confirmButtonProps/cancelButtonProps 透传;改用内部 Button 组件。
  - **Tooltip**:placement 扩 12 向 + `arrow` 箭头 + offset + tone + disabled;受控 open/`onOpenChange`/defaultOpen;openDelay/closeDelay 拆分;trigger 全事件 compose;气泡 `...rest` 透传;logic.ts。
  - **Pagination**:i18n + tone + size(随密度)+ simple 变体 + showTotal + 跳页输入 + 每页条数;`renderItem` 槽;事件 `onPageSizeChange`/`onChange(page,pageSize)`/`onQuickJump`/`onItemClick`;页码按钮 onClick 经 composeEventHandlers 合并用户的;logic.ts。

  接 tone 槽位、发光受 `--ms-fx-glow`、动效 `prefers-reduced-motion`+`data-ms-motion` 双降级。+36 测试,全量 331 无回归,dts strict 通过。向后兼容(Select onChange 改 `(value, option)` 双参,原测试相应更新)。

- 5ee599d: 组件补强 Wave 4:Menu / Checkbox / Radio / Slider / NumberInput / Textarea(深度 + 事件 + 修 onBlur/aria 回归)

  菜单 + 表单控件补厚,事件全量 compose:

  - **Menu**:MenuItem 联合扩展(separator/group/icon/shortcut/checked 选中态/href 链接)+ 组合式 API(Menu.Item/Separator/Group/Trigger)+ renderItem + tone + placement/offset + typeahead;事件 `onOpenChange`(受控/非受控)/`onSelect`/项级 `onClick`/`onEscapeKeyDown`/`onPointerDownOutside`;trigger 全事件+ref compose;浮层 `...rest`;logic.ts 纯函数。
  - **Checkbox**:tone + size + **CheckboxGroup**(多选组)+ description 槽 + 密度;`onCheckedChange` + onChange compose + 根 label `...rest` + inputProps 通道。
  - **Radio**:tone(RadioGroup 下发)+ 密度 + **card 卡片变体** + RadioGroup options 数据驱动;`onValueChange(value, event)` + 根 label 事件透传 + onChange compose。
  - **Slider**:tone + **marks 刻度** + **showTooltip 跟随气泡** + 密度;**`onChangeEnd`/`onValueCommit`**(松手落定值)+ `onDragStart`/`onDragEnd`。
  - **NumberInput**:i18n 步进 aria + invalid/tone + prefix/suffix + 密度 + long-press 连续步进;`onStep`/`onPressEnter` + **修复 onBlur 被 ...props 覆盖夹取逻辑的 bug**(改 composeEventHandlers 合并)。
  - **Textarea**:tone + showCount + **autosize** + 降级;`onPressEnter`。

  附带修复:Checkbox 改 extends label 后 `aria-label` 同时落在 label 与 input 上导致可访问名重复(破坏 Table 全选查询)——已 destructure 剔除,只留 input。接 tone 槽位、发光/动效双降级。+72 测试,全量 403 无回归,dts strict 通过。向后兼容(Select/Radio onChange 等签名增强,原测试相应更新)。

- 8d09e3e: 组件补强 Wave 5:ContextMenu / Tag / Timeline / Card / Divider / Label

  右键菜单 + 展示/结构类补厚:

  - **ContextMenu**:复用 Menu 的 MenuItem 类型与 logic + tone + typeahead;受控 `onOpenChange` + `onSelect` + `onContextMenu`(可拦截)+ `onOpen(e,{x,y})`(右键坐标)+ `onEscapeKeyDown`/`onPointerDownOutside`;包裹/浮层 `...rest`;clampToViewport 纯函数。
  - **Tag**:tone 解析器 + variant(soft/solid/outline)+ size + icon/closeIcon 槽 + **checkable filter chip**;`onRemove(e)`(带事件)+ **关闭按钮事件隔离 stopPropagation** + 可点击键盘语义 + asChild;closeButtonProps 透传。
  - **Timeline**:variant 接 tone + **mode(left/right/alternate)/reverse** + **pending 末节点**(虚线+呼吸点)+ 圆点 pulse + lineStyle;TimelineItem 交互式 `onSelect`/active/键盘;i18n `timeline.pending`。
  - **Card**:**CardHeader/Title/Body/Footer/Media 子组件** + tone + padding 档 + **interactive 键盘激活**(Enter/Space→onClick)+ asChild。
  - **Divider**:**带文字分隔**(children+textAlign,role=separator)+ tone + variant(solid/dashed/dotted)+ thickness/spacing。
  - **Label**:size + tone + `optional` 标记(i18n)+ requiredMark 可替换。

  接 tone 槽位、发光受 `--ms-fx-glow`、动效双降级。i18n 字典补 `label.optional`/`label.required`/`timeline.pending`。+49 测试,全量 452 无回归,dts strict 通过。向后兼容(Tag onRemove、Timeline variant 类名等签名增强,原测试更新)。

- 7b9a29a: 组件补强 Wave 6(收官):Spinner / Skeleton / Table / Toast / AlertDialog —— 全 33 组件生产级

  末批 + 命令式/数据组件补厚:

  - **Spinner**:variant(ring/dots/bars)+ tone(currentColor 跟随)+ 可见 label(labelPlacement)+ 动效全局降级 + i18n。
  - **Skeleton**:animation 四档(shimmer/pulse/wave/none)+ lines 多行 + width/height 便捷 + **内容感知 loading+children** + SkeletonText/SkeletonGroup + asChild + logic.ts。
  - **Table**:i18n + tone + 魔法动效(行 stagger 进场 / 排序脉冲 / loading 遮罩模糊 / 选中行 inset glow)+ **可展开行**(expandable 受控)+ **列固定 fixed left/right** + size 三档 + summary/footer 汇总行 + 密度;留口 `...rest`/classNames/tableProps;事件 **`onRowClick`/`onRow`(事件工厂)/`onRowDoubleClick`/`onRowContextMenu`/`onExpandedChange`/`onSelect`/`onSelectAll`**(全经 composeEventHandlers 合并、选择/展开按钮 stopPropagation 防误触);useTableExpand 纯逻辑。
  - **Toast**:变体读 tone 槽位 + i18n + ToastOptions(icon/closeIcon/classNames/**onDismiss/onAutoClose/onClick**)+ **`toast.promise`**(loading→success/danger 同 id 替换)+ Toaster max/duration/expand props。
  - **AlertDialog**:命令式默认文案走 `translate` 单例(i18n)+ variant 扩成完整 tone + ConfirmOptions icon/confirmLoading + PromptOptions inputType/validate + 选项级 `onConfirm`/`onCancel`/`onValueChange`/`onEscapeKeyDown`/`onPointerDownOutside`。

  i18n 字典补 `table.expandRow`/`collapseRow`/`expandColumn`。+42 测试,全量 **494 无回归**,dts strict 通过。

  **至此 33 个现存组件 + 旗舰 Button/Input/Text 全部达生产级深度**:统一 tone 槽位、光影(`--ms-fx-glow`)/动效(`data-ms-motion`+`prefers-reduced-motion`)双降级、密度(`--ms-density-scale`)、i18n 字典、留口(插槽/asChild/render-prop/classNames)、事件齐全(`...rest` 透传 + composeEventHandlers 合并 + 领域回调)、内容边界。

- 48be590: feat(react): 新增 5 个组件 —— Statistic / PinInput / Anchor / Watermark / BackTop

  - **Statistic**(data-display):数值统计展示。千分位 + precision 格式化(纯 logic)、prefix/suffix、trend 升降染色、loading 骨架、animateOnMount 入场滚动(尊重 reduced-motion)、role=img + 完整 aria-label。
  - **PinInput**(forms):OTP/验证码分段输入。自动跳格、Backspace 回退、粘贴整串分填、←→/Home/End 导航、numeric/alphanumeric 过滤(纯 logic)、mask 密码点、invalid 染 danger、受控/非受控。
  - **Anchor**(navigation):滚动锚点 scroll-spy。rAF 节流算 active(纯 logic resolveActiveLink)、墨条指示、平滑滚动(reduced-motion 瞬时)、嵌套锚点、active 链接 aria-current、受控/非受控。
  - **Watermark**(layout):水印覆盖层。离屏 canvas(devicePixelRatio 清晰)绘制单元平铺、pointer-events:none 不挡交互、getContext null 降级安全、aria-hidden。
  - **BackTop**(navigation):回到顶部浮钮。滚动超阈值淡入、rAF 缓动归顶(纯 logic 缓动)、reduced-motion 瞬时、隐藏态 aria-hidden + 不可聚焦。

  每个组件纯算法进 logic.ts(可平移 core),配 logic 测试 + 组件测试(共 +120 用例)。lint / tsc / build / size 全绿。

- 070e876: feat(react): 新增 5 个组件 —— ColorPicker / Upload / Cascader / Splitter / Affix

  - **ColorPicker**(forms):颜色选择器。色彩数学纯函数(hsv/rgb/hex/hsl 互转 + parseColor/formatColor,可平移 core)、饱和度-明度 2D 面板(拖拽+键盘)、hue/alpha 滑条、hex/rgb/hsl 格式切换、预设色板、EyeDropper 取色(特性检测)、复用 Popover。
  - **Upload**(forms):文件上传。拖拽区 + 点击选择、fileList 受控/非受控、accept 双重过滤、beforeUpload、customRequest 可插拔(传输与编排分离)、进度/状态/重试/预览、listType text/picture。
  - **Cascader**(forms):级联选择。级联多列菜单、findPath/路径标签纯逻辑、changeOnSelect、键盘列间导航、复用 Popover、复用 select.\* i18n。
  - **Splitter**(layout):可拖拽分栏。复合 Splitter + Splitter.Panel、ResizeObserver 测量、resizePanels 约束求解纯逻辑、gutter role=separator + 键盘 + 双击折叠、命令式 handle。
  - **Affix**(navigation):滚动吸附。computeAffix 纯逻辑、占位防跳动、吸顶/吸底、ResizeObserver 宽度跟随、rAF 节流。

  每组件纯算法进 logic.ts(可平移 core)+ logic/组件测试(共 +161 用例)。lint / tsc / build / size 全绿。

- 4ed8ae7: feat(react): 新增 5 个组件 —— Transfer / TimePicker / Mentions / Carousel / FloatButton

  - **Transfer**(data-display):双列穿梭框。按 targetKeys 切分两侧、搜索过滤、选中移动纯逻辑(可平移 core);两栏标题/搜索/全选/每项 Checkbox + 中间方向按钮;targetKeys 受控/非受控、oneWay、禁用项不计入全选。
  - **TimePicker**(forms):时间选择。时/分/秒(+12h AM/PM)可滚动列、step、disabledHours/Minutes/Seconds、此刻/确定、parse/format/clamp 纯逻辑;复用浮层 + Anchor 定位;invalid 供 Form。
  - **Mentions**(forms):@ 提及输入。基于 textarea + 光标前触发段检测(detectMention)、过滤、插入计算纯逻辑;前缀可配、异步 onSearch、键盘选择;v1 浮层锚控件下方。
  - **Carousel**(data-display):轮播。autoplay(pauseOnHover)、dots、箭头、slide/fade、loop、拖拽切换、受控 activeIndex;非活动 slide inert+aria-hidden;reduced-motion 停自动播。
  - **FloatButton**(navigation):悬浮按钮。单钮 + Group 可展开堆叠;icon/description/tooltip/badge/href、circle/square、primary、固定定位;Group aria-expanded + inert 收起。

  每组件纯算法进 logic.ts(可平移 core)+ logic/组件测试(共 +155 用例)。

- 088a94b: feat(react): 新增 5 个组件 —— Tour / AutoComplete / Image / Mark / VisuallyHidden

  - **Tour**(feedback):引导漫游。spotlight 镂空高亮(box-shadow spread 挖洞,目标可点透)+ 引导卡(上一步/下一步/跳过/完成 + 步数 i18n)、惰性目标 rAF 跟随、Esc/←→ 键盘、焦点管理、受控 open/current、命令式 TourHandle(goTo/next/prev/close)。
  - **AutoComplete**(forms):自动完成。自由文本输入 + 建议补全(filterOptions 纯逻辑)、filterOption 关内置过滤接远程、onSearch/onSelect、allowClear、invalid 供 Form、combobox a11y、键盘选择;值即输入串。
  - **Image**(data-display):图片。懒加载、skeleton 占位、fallback 链兜底、错误态 i18n;点击灯箱预览(缩放/旋转/还原工具栏 + 键盘 +/-/r/Esc、锁滚动 + 焦点管理)、object-fit、rounded;预览变换状态机纯逻辑。
  - **Mark**(typography):文本高亮。splitByMatches 纯逻辑(多词/重叠区间合并、正则元字符转义、保留原文大小写)、命中包 `<mark>` + tone 软底高亮、多态 as。
  - **VisuallyHidden**(utility):无障碍隐藏。标准 sr-only(clip 而非 display:none,保留无障碍树)、focusable 变体(skip-link 模式聚焦还原)、多态 as / asChild。

  含 logic 的纯算法可平移 core;共 +150 测试。lint / tsc / build / size 全绿。

- 36fd5d5: feat(react): 新增 3 个组件 —— ConfigProvider / Prose / Spin(v2 收尾批)

  - **ConfigProvider**(utility):全局配置上下文。density/motion/fx/tone/size 在一处统一设置,经 data-ms-\* 属性沿 CSS 级联下发(CSS-first,组件读祖先属性即生效);可选 messages 内部套 MessagesProvider 下发 i18n 文案;display:contents 透明根不破坏布局;useConfig hook 供需 JS 默认值的场景;多态 as / asChild。
  - **Prose**(typography):富文本/HTML 内容容器排版。给 markdown/CMS 渲染内容套全库排版(h1-h6/p/ul/ol/blockquote/code/pre/a/table/kbd/hr/figure…),:where() 零特异度便于覆写、消费 --ms-\* token、随密度缩放、tone 着色;超长 code/表格横向滚动不撑破。
  - **Spin**(feedback):加载遮罩。包裹内容,spinning 时盖半透明遮罩 + 居中符文(内容不卸载、保留布局);delay 防闪烁(shouldShow 纯逻辑)、tip/size/indicator/fullscreen/bare;遮罩 role=status + aria-live、内容 inert 防交互;reduced-motion 降级。

  含 logic 的纯算法可平移 core;共 +52 测试。lint / tsc / build / size 全绿。**至此组件库达 80 个组件。**

- 4eb8ce4: feat(react): 新增 5 个组件 —— Command / ScrollArea / Toolbar / CopyButton / Marquee

  - **Command**(navigation):命令面板(⌘K)。filterItems(子串/模糊 + 命中高亮区间)/ groupAndFlatten / nextEnabledIndex 纯逻辑;复合 Command + Input/List/Group/Item/Empty/Separator + Command.Dialog(复用 Dialog 成 ⌘K 模态);键盘跳过禁用/组头、aria-activedescendant combobox/listbox。
  - **ScrollArea**(layout):自定义滚动区。原生滚动 + 自绘 thumb(computeThumb/scrollPosFromThumb 纯逻辑),type auto/always/hover/scroll、可拖拽、ResizeObserver 测量、scrollbar role + aria-valuenow。
  - **Toolbar**(actions):工具栏。role=toolbar + roving tabindex(←→/↑↓ 移焦),Button/Separator/Group/ToggleGroup/ToggleItem/Link;ToggleGroup single/multiple 受控。
  - **CopyButton**(actions):复制按钮。clipboard 写入(execCommand 降级)+ 复制/已复制反馈态(typography.copy/copied)、aria-live 播报;复用 Button + Tooltip、render-prop。
  - **Marquee**(data-display):无限跑马灯。children 克隆首尾相接 + CSS transform 无缝循环,四方向、speed/duration、pauseOnHover、gradient 两端淡出(mask)、reduced-motion 静止。

  每组件纯算法进 logic.ts（可平移 core）+ logic/组件测试（共 +161 用例）。lint / tsc / build / size 全绿。

- c837121: feat(react): 新增 5 个组件 —— Editable / TagInput / Dropdown / Collapsible / Toggle(90 组件)

  - **Editable**(forms):行内编辑。点击/聚焦展示态切换成输入态,Enter / 失焦提交、Esc 取消;受控值 + 受控编辑态双通道,multiline 走 textarea,selectAllOnFocus / submitOnBlur / submitOnEnter 可调,renderPreview / renderEdit 留口(下放 ref + invalid)。commitValue / shouldSubmit 纯逻辑进 logic.ts。
  - **TagInput**(forms):标签/令牌输入。回车 / 单字符或多字符分隔符成 tag、空输入 Backspace 删尾、← 进标签键盘导航、粘贴多 tag 切分;maxTags / allowDuplicates / validate / addOnBlur / editable,renderTag 留口(下放 ref + 注入 key)。normalizeTag / splitByDelimiters / canAdd 纯逻辑。IME 组合态 Enter 不误提交(复用 Textarea 范式)。
  - **Dropdown**(navigation):下拉菜单。trigger + 自持 popover(CSS Anchor 定位)+ 复用 Menu 纯逻辑(flatten / typeahead / roving),items 数据驱动或 children 复合;checkbox/radio 项连续切换保持打开,click/hover 触发,submenu 一层,Tab 关闭交还 trigger 焦点。
  - **Collapsible**(data-display):单项折叠原语(区别于 Accordion 的互斥分组)。Root + Trigger + Content,**常驻挂载 + inert 切换**(对齐 Accordion):收起不销毁子树(state / 输入 / 滚动 / 焦点保活)、展开收起两向动画都播,reduced-motion / [data-ms-motion=off] 降级。`forceMount` 因常驻挂载已成 no-op,标 `@deprecated` 保留以不破坏 API。
  - **Toggle**(actions):双态切换按钮。单 pressed / unpressed 按钮(区别于 Switch / Segmented),aria-pressed 语义,复用 Button 的 variant × tone × size × shape,工具栏图标按钮场景;受控 / 非受控双通道。

  每组件经对抗性评审 + 复现验证,确认并修复 16 个真实 bug(Editable 4 / TagInput 5 / Dropdown 4 / Collapsible 3,均补回归测试):含受控编辑虚假 onChange(HIGH)、IME 选词 Enter 误提交(HIGH)、收起销毁子树 / 动画不播(HIGH)等。lint / tsc / build / size / registry(90 校验通过)/ 全量测试 1892 全绿。

- 4358081: feat(react): 新增 4 个组件 —— Menubar / NavigationMenu / HoverCard / Calendar(94 组件)

  - **Menubar**(navigation):应用菜单栏。横向顶级菜单触发器(文件/编辑/视图),复用 Menu 逻辑;完整 ARIA APG menubar 键盘(顶层 ←→ roving、↓/Enter 开、菜单内 ↑↓/Home/End/typeahead/Esc、子菜单 → 展开并落焦首项 + 独立 ↑↓/Enter/←/Esc 焦点环);受控 value=打开的菜单 id;disabled 顶级菜单 roving 正确跳过。
  - **NavigationMenu**(navigation):网站导航 + mega-panel。横向触发器各带下拉 panel,共享 Viewport、hover-intent(openDelay/closeDelay/移入宽限)、键盘可达;复合(List/Item/Trigger/Content/Link/Viewport)或 items 数据驱动;Space 不被合成 click 关回、panel 内 Esc 可被 onEscapeKeyDown 拦截、Esc 单路径。
  - **HoverCard**(overlay):悬停富预览卡。openDelay/closeDelay 延迟开关 + 指针移入卡内不关 + 焦点也触发(a11y);区别于 Tooltip(纯文字)/Popover(点击);触屏不暴露悬空 aria-describedby、无 Popover API 兜底关闭态主动 inert、非原生可聚焦 trigger 自动注入 tabindex。
  - **Calendar**(data-display):独立月历(区别于 DatePicker 的输入+弹层)。6×7 月网格 + 翻月/翻年,单选/范围/多选三模式、disabledDate/min/max、weekStartsOn、Intl 本地化、renderCell/dateCellRender 留口;role=grid 键盘网格导航(←→↑↓/PageUp/Down/Home/End/Enter),翻页后焦点夹回可见月保持唯一 tabIndex=0。logic.ts 纯日期数学(零外库,覆盖闰年/跨月跨年/周起始等黄金边界)。

  **破坏性提示**:`Calendar` / `CalendarProps` / `CalendarClassNames` 现由新的独立 Calendar 组件导出;DatePicker 内嵌的同名私有面板**不再从库根 barrel 导出**(它本是 DatePicker 内部实现,误对外导出会与新独立 Calendar 在库根撞名 TS2308)。如此前从 `@magic-scope/react` 取 `Calendar` 实为 DatePicker 内嵌面板,现等价取到功能更完整的独立 Calendar。

  每组件纯算法进 logic.ts(可平移 core)+ 完整 a11y/键盘/受控/事件合并/classNames/内容边界。经对抗性评审确认并修复 16 个真实 bug(Menubar 5 / NavigationMenu 4 / HoverCard 3 / Calendar 4),均补回归测试。lint / tsc / build / size(react 上限随 4 个复杂组件增长 170→195KB)/ registry(94 校验通过)/ 全量测试 2117 全绿。

### Patch Changes

- 758dc99: 修复 Button 内容边界:超长文案不再撑破按钮/容器

  `.ms-button` 原本 `white-space: nowrap` 却无宽度上限、label 也无溢出处理,粘入超长无空格字符串时会把按钮无限撑宽、漫出容器甚至破坏整页布局。现加 `max-inline-size: 100%` 封顶到容器宽,`.ms-button__content` / `.ms-button__label` 加 `min-inline-size: 0` 使其在 flex 中可收缩,label 单行 `text-overflow: ellipsis` 截断。任意对抗性内容都被收在组件边界内。

- 1513fc0: 全库内容边界健壮性加固:对抗性超长内容不再撑破任何组件

  继 Button 之后,对全库做了一轮「内容边界」审计(逐组件设想粘入超长无空格字符串/巨量文本/超宽子节点),修复 12 个组件的溢出隐患,策略按内容性质区分:

  - **单行省略号**(紧凑标识):`Tag`(label 改 block 才能真出省略号 + 关闭钮 `flex:none` 防挤压)、`Badge`、`Drawer` 标题、`Input` 的 addon 段(封顶 40% + 省略)。
  - **换行不丢内容**(多行正文):`Alert`、`Card`、`Tooltip`、`Label`、`Breadcrumb`、`AlertDialog` 标题、`Checkbox`/`Radio` 标签(`overflow-wrap: anywhere`)。
  - **容器封顶 + flex 可收缩**:`Input` / `InputGroup`(`max-inline-size:100%` + 字段列 `min-inline-size:0`)。

  均不裁剪焦点发光环(`box-shadow` 不受 `overflow:hidden` 影响),不改变正常内容排版。

- b7fb02a: chore(react): 去中二文案 —— 组件库面向用户中文改为克制专业措辞

  按 `DE-CHUUNI.md` 对照规则,清理 49 个组件里 component.json description/requirements、
  _.tsx JSDoc/注释/默认文案、_.css 注释中的中二法术词:辉光 → 发光、符文 → 图标、
  奥术(修饰)删去、施法 → 操作/加载、流光 → 渐变/高亮 等。仅改面向用户的中文文案,
  保留英文标识符(prop 名 `glow`、variant `aurora`、`shimmer`、主题 key `arcane`)与
  变量/类名/keyframe 名不动(改了会 breaking),需求原意未改。

  呼应视觉方向「魔法=精致克制的效果,不是中二法术文字」。复查 grep 中二词清零。

- 0033c72: 去除组件 prop/event JSDoc 中的中二措辞,改为专业克制的描述(不改行为),重抽 props.json。
- 070e876: docs(react): 事件回调 prop 全量补 `@param` JSDoc

  为全库组件的**自有事件回调**(onChange / onSelect / onCheck / onValueChange / onOpenChange / customRequest 等)逐个补 `@param <name> <说明>`,文档化每个回调参数的语义。配合展示站的 `extract-props.ts` 扩展,事件卡可逐参数渲染「name: type — 说明」。消费方在 IDE 悬停 / .d.ts 也能看到每个参数说明。

  覆盖 ~34 个组件(Form/DatePicker/Tree/Select/Table/Tabs/Menu/ContextMenu/Pagination/Popover/Dialog/Drawer/AlertDialog/Slider/NumberInput/Cascader/ColorPicker/Upload/Splitter/Affix … 含命令式 \*Options 接口里的回调)。纯 JSDoc 注释,不改任何类型/逻辑/签名。

- 6d93d8c: 用户实测暴露的三个组件 bug 修复:

  - **Affix 容器内吸附后"跟着屏幕滚"**:吸附态是 position:fixed(视口坐标),旧实现只监听 getTarget 容器自身的 scroll,页面(window)一滚 fixed 坐标全部过期,内容钉在屏幕上跟着视口走。现改为在 window 捕获段统一监听 scroll(捕获段能收到 window 与任意嵌套容器的所有滚动),任何祖先滚动都会重测、fixed 坐标始终新鲜。
  - **NavigationMenu 悬停持续闪烁**:panel 浮层(Viewport)此前经 CSS Anchor Positioning 锚定自己的祖先 <nav>——锚定位对祖先锚点不生效,浮层落回静态位置、盖住触发器下半段,与 hover 热区形成「开 → 盖住光标 → pointerleave → 延时关 → 光标落回触发器 → 再开」的持续振荡。移除锚定实验、回归「相对 nav 根 absolute 贴底」定位(所有浏览器一致);并给 Viewport 补上缺失的 hover 热区保护(指针移入 panel 取消关闭计时,离开才走宽限关闭)——修复悬停 panel 超过 closeDelay 被误关的隐藏缺陷。
  - **Statistic count-up 动画小数尾巴乱跳**:插值帧是原始 float,未显式给 precision 时按自身位数全量渲染。现动画帧显示精度对齐终值自身的小数位数(整数终值逐帧取整、一位小数终值逐帧一位),收尾仍落真实终值。

- 1ae6c91: fix(react): 修复浮层组件用户传 style 时锚点定位丢失(弹层跑到左上角)

  浮层组件(Select/AutoComplete/TimePicker/Menubar 等)把 CSS Anchor Positioning 的
  `anchor-name`/`position-anchor` 经组件 `style` 设到触发器/面板上,但随后 `{...rest}`
  (含用户 `style`)在其后展开,把 `anchor-name` 覆盖掉 —— 一旦使用方给组件传 `style`
  (如 `style={{ maxInlineSize: '16rem' }}`),锚点丢失,popover 退化到 top-layer 左上角。

  改为把用户 `style` 与锚点样式合并且锚点放最后(`{ ...style, anchorName }`),并从
  `{...rest}` 中解构出 `style` 避免二次覆盖。已在真实浏览器(Chrome 148,全支持 anchor)
  复现并验证修复:trigger 同时带 `max-inline-size` 与 `anchor-name`,弹层正确贴回触发器下方。

- 0ceff29: 线上展示站暴露的四个真实浏览器 bug 修复(jsdom 测不出的一批,已补 CSS 静态契约红线):

  - **Tooltip / Popover / HoverCard 恒落 (0,0) 左上角**:position-area 写了语法外的裸 `span-inline` / `span-block`(整跨轴的合法关键字是 `span-all`),浏览器把整条声明作废、浮层失去锚定。JS 侧 placementToArea 与 CSS 兜底值一并修正。
  - **Flex 桌面端(≥48rem)direction / gap / align / justify 全部失效**:响应式解析变量在 @media 块里自引用(`--_x: var(--src-md, var(--_x))`),循环依赖令变量 guaranteed-invalid。改为每断点完整「本档 → 逐级低档 → 基线」源变量回退链;顺带修复 sm 档丢失基线 rowGap / columnGap 的次生缺陷。
  - **Tour 引导卡钉死在视口顶端**:定位 clamp 的 `100%` 在 inset 属性里解析为容器(视口)尺寸而非卡片尺寸,上限恒为负、clamp 退化到最小值。改为 JS 实测卡片尺寸注入 `--ms-tour-card-w/h` 供 CSS clamp 使用。
  - **多个 Toaster 并存时每条 toast 重复弹出**:store 是广播,现约定「最后挂载的容器生效」,先挂载者静默让位、后者卸载自动接回;dev 下并存告警。

  新增全库 CSS 静态契约测试:禁止裸 span-inline/span-block、禁止自定义属性同名自引用。

- 67b2caf: 修复 Reveal 的 parallax / progress(trigger="scrub")变体恒 opacity:0 隐身:scrub 路径不写 data-ms-inview,而 CSS 初态选择器把所有变体都设为隐藏、keyframes 又不动 opacity,导致这两个滚动驱动变体在所有浏览器上永不可见。现已将 scrub 族排除出隐藏初态(它们本就不是进场特效,无隐藏态),并补 CSS 契约回归测试。
- ec9e8a6: 修复 Descriptions / Grid / Splitter 的 `displayName` 挂载位置(挂到导出名而非局部变量名)。运行时对象与 `displayName` 取值均不变,无行为差异;此前挂在局部名上会让 props 抽取工具静默丢弃主组件文档,导致展示站与文档站的参数表整体失真。
- 21f7fc4: 修复:组件不再依赖宿主页的 CSS reset(Button ghost/outline/link 在裸页面渲染成灰色药丸)

  `.ms-button` 基座只重置了 `border`,没重置 `<button>` 的 UA 默认背景;`solid` / `soft` 各自设了 background,而 `ghost` / `outline` / `link` 只设 `color`。结果在**没有全局 reset 的宿主页**(未接 Tailwind preflight / normalize)里,这三个变体拿到 Chrome 的 ButtonFace 底色(浅色模式 `rgb(239,239,239)`、深色模式 `rgb(107,107,107)`),看起来像灰色药丸而非透明底。已在真浏览器复现并验证修复。

  本次把「不依赖宿主 reset」拉成全库不变量:

  - `.ms-button` 基座补 `background-color: transparent`(solid / soft 变体照常覆盖),一处根治三个变体。
  - 全库审计 100 个原生控件渲染点,补齐另外 27 处 UA 默认值泄漏:
    - `.ms-tabs__close`(可关闭标签页的关闭钮)此前连 UA 的灰底、2px outset 边框、内边距一起漏出,补 `padding` / `border` / `background` / `font` / `color`;
    - 25 个原生控件基座补 `font: inherit`(原生 `button` / `input` **不继承**页面字体,裸宿主页会退回系统字体 13.33px):Alert / Carousel / Code / ColorPicker / Dialog / Drawer / Image / Input / NumberInput / Paragraph / PinInput / Slider / Steps / Table / Tabs / TagInput / Toast / Tour / Tree / Upload 的关闭·步进·工具钮等;
    - 5 个无文字内容的控件补 `color: inherit`,使「可见原生控件必须自带 background / border / font / color」成为零豁免的统一契约(a11y 用的视觉隐藏 input 自动豁免)。
  - 新增 CI 红线 `css-contract.test.ts`:静态解析每个组件 TSX 里直接渲染的原生控件及其类名,回查 CSS 基态规则是否显式重置了这四项,漏一个就红。
  - `@layer ms.reset` 明确定位为**故意留空**的使用方扩展点(组件库不该替宿主页 reset 别人的 `button`),README / 多端适配文档同步补上宿主 reset 兼容性说明。

- 6788e4e: P1 设备适配:装饰性 :hover 全量包进 @media (hover: hover),消触屏 sticky-hover

  - 全库排查 65 个含 `:hover` 的组件 CSS,把所有**装饰性** hover 规则(约 75 条,涉及 40+ 组件)统一包进 `@media (hover: hover)` 守卫:触屏(`hover: none`)不再出现「点完保持 hover 态」的粘滞高亮;桌面具备 hover 能力,逐像素不变。
  - `:hover` 与 `:focus-visible` / `:focus-within` / `--active` 合写的规则(Menu / Dropdown / Menubar / NavigationMenu / Cascader / Toolbar / Button 组 / Heading 等)一律**拆分**:hover 进守卫,焦点 / 程序高亮留守卫外,键盘与触屏可达性不丢。
  - 功能性 hover 有意不守卫:Marquee 悬停暂停(触屏 tap 粘滞暂停是可接受替代交互,已注释);Heading 锚点与 Code 复制钮的悬停浮现由既有 `@media (hover: none)` 常驻可见规则兜底。
  - `[data-ms-fx="off"]` / `[data-ms-motion="off"]` / `prefers-reduced-motion` 的中和规则保持原位(基础规则被守卫后触屏自然 no-op)。

- 06de3cf: i18n 存量债清理:硬编码文案全部接入字典,消除绕过字典的类型逃逸

  **新增 20 个 key。** 此前散落在组件里的用户可见中文全部收进字典:`anchor.nav`、`navigationMenu.nav`、`breadcrumb.expand`(`{count}` 插值)、`image.zoomIn / zoomOut / rotate / reset / close`、`pinInput.cell`(`{label}` / `{index}` 插值)、`progress.label`、`tabs.add`、`statistic.trendUp / trendDown`、`timePicker.hour / minute / second / meridiem`、`pagination.sizeLabel / pageSize / jump`。**默认文案与改动前逐字一致,行为不变**,新增的是可被 `MessagesProvider` 覆盖的能力。

  其中 `Anchor` 的 `ariaLabel` 与 `NavigationMenu` 的 `aria-label` 原先在解构处写死中文默认值,现改为不传时回落字典;显式传入仍然优先。`Image` 的 `toolbarLabels` 同理:不传走字典,传了以 prop 为准。

  **`form.validating` 接上真实消费。** `Form.css` 早已备好 `.ms-form__validating-rune` 旋转指示器(含 reduced-motion 降级),store 也一直在维护 per-path 的 validating 态,唯独没有任何地方渲染它。`Form.Field` 现在会在异步校验进行中、且该字段尚无错误时,渲染一行 `role="status"` 的状态行。**这是新增的可见输出**:用了异步 `validate` 的表单会在校验期间多出一行「校验中…」提示。

  **删除 3 个无场景的 key(破坏性,`patch` 内的类型收窄)。** `select.create`(全仓没有 creatable / 新建选项能力)、`select.selected`(Select 多选逐条渲染 tag,没有折叠/摘要形态)、`form.submitError`(表单级错误由 `Form.ErrorSummary` 经 `form.errorSummary` 承担)。`MessageKey` 是导出类型,**覆盖过这三条的用户会拿到类型错误,需删掉对应覆盖项**;默认字典行为不受影响。

  **消除两处绕过字典的类型逃逸。** `Avatar` 的 `as MessageKey` 断言(`avatar.status.*` 早已登记,模板串本就被 TS 收窄到合法 key,断言从来没必要)与 `Pagination` 的 `t as unknown as (key: string, …)` 强转(三个 key 未登记,现已补齐)。这两处让拼错 key 只会在运行时静默回退,现在由 `tsc` 编译期把关。

  **其它:**`Image.tsx` 里以裸 NUL 字节写死的 `fallbackKey` 分隔符改为转义写法(运行时等价;裸字节会让 grep / ripgrep 判定整个文件为二进制而静默跳过);清掉 4 处已失效的 `biome-ignore`;`Upload` 的迟到 `onProgress` 守卫改可选链写法(语义等价)。至此 `biome check` 全仓零错误零警告。

- f7dfa87: Tree 修复 `showLine` 完全失效,并改为「每层一条」的层级引导线

  `showLine` 此前是个 100% 无效的公开 prop —— 一条引导线都画不出来。真浏览器实测 `.ms-tree__indent` 尺寸是 `22x0` / `44x0`,**高度全是 0**。根因两层叠加:

  1. 引导线画在 `.ms-tree__indent` 的 `border-inline-start` 上,但这是个空元素、只声明了 `inline-size`;父级 `.ms-tree__node` 是 `align-items: center`,flex 子项默认不拉伸,空盒块高因此为 0 —— 0 高度的边框一个像素都不绘制。
  2. 就算撑起高度,单条 border 也只有一条边,画不出「每个祖先层级一条」,深层节点拿不到自己父级那条导轨;而且该规则对 `level=0` 同样生效,根节点行会冒出一条本不该有的竖线。

  现在改为 `align-self: stretch` 撑起块轴 + 平铺背景渐变绘制导轨:平铺周期 = 一级缩进,相位 = 行内 flex gap + 箭头半宽,于是每条导轨正好落在对应祖先展开箭头的中心;缩进盒宽 = `level × 缩进`,根节点宽 0 天然被裁成不画,不必再写 `level=0` 排除规则。相位额外夹了 `min(…, 缩进 − 线宽)`,保证「每层恰好一条」在任意缩进与密度下都成立(缩进窄到装不下相位时,导轨退化为贴紧该层左沿)。

  行为变化,升级请注意:

  - 引导线由**虚线改为实线**(此前从未渲染出任何像素,所以没有实际视觉回归)。
  - 去掉了 `margin-inline-start`,**开关 `showLine` 不再把整棵树推 12px**(11px margin + 1px 边框),布局不再抖动。
  - 新增可覆写自定义属性:`--ms-tree-line`(导轨颜色)、`--ms-tree-toggle`(箭头边长)、`--ms-tree-gap`(行内间距)。后两者同时被箭头与行内 gap 消费,导轨对齐与真实几何共用同一真相源,改一处不会错位。

  RTL:平铺背景与长度型 `background-position` 都是物理轴(不像原来的 `border-inline-start` 自带方向感知),故补了一条 `:dir(rtl)` 规则从右边缘起算、渐变同时反向;不补的话每条会偏 `|2×相位 − 缩进|`(默认 md 即 6px)。

  **兼容性备注(透明写明,勿藏)**:这是本库**首次**使用 `:dir()` 选择器 —— 此前的 RTL 写法只用 `direction` 属性。`:dir()` 的基线是 **Chrome 120+ / Edge 120+ / Safari 16.4+ / Firefox 49+**,符合本项目的 evergreen 策略;低于该基线的浏览器只是 RTL 下导轨相位不翻(每条偏 `|2×相位 − 缩进|`,默认 md 即 6px),LTR 与其余功能不受影响,属可接受的优雅降级。需要覆盖更老浏览器的使用方,可自行加一条 `[dir="rtl"] .ms-tree--line .ms-tree__indent { … }` 兜底。

  同时新增全库 CSS 静态契约的**第 6 条**红线(`css-contract.test.ts`):**靠内联轴边框画竖线的盒子必须有块轴高度**。它跨规则合并同一目标元素的声明后判定 —— 逐条规则看永远看不出这个 bug(`.ms-tree__indent` 只写宽、`.ms-tree--line .ms-tree__indent` 只写边框,单看都合法)。判据与其余红线一致,走真实 CSS 解析(`./testing/cssRules` 的 `parseCssRules` / `targetCompound`),不用正则切块。实测全库 100 个 CSS 命中 0 条;把修复前的 `Tree.css` 放回去则精确报出 `components/Tree/Tree.css:59 .ms-tree__indent`,而不做跨规则合并的朴素版一条都抓不到。

  验收:Playwright 真浏览器 + 逐像素解码截图,确认导轨落在 `x=14` / `x=36`(正是 level0 / level1 展开箭头中心)、根节点行只有箭头字形无导轨、导轨整行等高且跨行连续;RTL 下同样逐像素确认落在 `x=385.5 / 363.5 / 341.5`,与镜像后的箭头中心逐条对齐。并参数化扫过 md/sm/lg、密度 0.5/0.8/1.25、缩进 0.5rem/3rem、根字号 20px,每层条数与对齐均正确。

- 5d2607a: 发布瘦身:构建关闭 sourcemap,不再把 `.map` 打进 tarball。包体显著减小(react ~135KB → 47KB、tokens ~50KB → 23KB),并去掉悬空的 `sourceMappingURL`。本仓库开发调试走 src(vitest / playground),不依赖 dist sourcemap。
- da625d9: 视觉调淡:发光与浮层投影更克制

  - 全局发光默认强度 `--ms-fx-glow` 由 `1` 降到 `0.6`(此前偏重);新增 `data-ms-fx="full"` 恢复满强度、`data-ms-fx="subtle"`(0.3)更淡,与 `off` 一并构成四档。
  - 7 个浮层组件(Dialog/AlertDialog/Menu/Select/Popover/Toast/Tooltip)的立体黑投影降不透明度(0.7→0.45、0.6→0.4),几何不变,质感更轻。

  聚焦环不受影响(保可达性)。注:暗主题底色深浅属 `@magic-scope/tokens` 主题层,不在本次范围。

- Updated dependencies [a1dd83b]
- Updated dependencies [2abcdf8]
- Updated dependencies [2b29db9]
- Updated dependencies [82b3f1c]
- Updated dependencies [b6bf500]
- Updated dependencies [5d2607a]
- Updated dependencies [4d2d694]
  - @magic-scope/tokens@0.2.0

## 0.1.1

### Patch Changes

- 设备适配收尾:触屏字号修复门控到 coarse 指针,桌面零变更

  iOS 聚焦自动放大的字号修复(sm 输入框 ≥16px)统一收进 `@media (pointer: coarse)`,使桌面精确指针下 Input / Textarea 的 sm 字号维持原 `0.833rem` 不变,仅触屏抬到 16px。配合 P0 设备适配落地(触控热区 `--ms-target-min`、浮层 `--ms-viewport-h` 限高滚动、Tabs/Pagination/Table 防溢出、Tooltip 触屏 tap-to-toggle 等)。

- 补齐首发质量缺口:

  - 新增 MIT `LICENSE` 文件(根目录与两个发布包各一份),与已声明的 `license: MIT` 对齐
  - 修正 `exports` 的 `require` 分支类型导出:为 CJS 增加独立的 `.d.cts` types 指向,解决 CJS 消费者类型被当作 ESM 解析(arethetypeswrong 的 "Masquerading as ESM")的问题;publint 现全绿
  - 各包补 `engines.node >=20`、`keywords`、`homepage`、`bugs` 元数据
  - 各发布包新增 `README.md`,让 npm 包详情页有安装与用法说明

- Updated dependencies
  - @magic-scope/tokens@0.1.1

## 0.1.0

### Minor Changes

- e54458d: 地基:多端 / 设备适配基础(P0 第一刀)

  落实设计哲学第 8 条「响应式跨设备」的地基,把 DESIGN.md §5 的设备适配规范从纸面落到代码,零视觉变更:

  - **tokens**:新增 `breakpoints` 断点刻度(视口 `sm/md/lg/xl/2xl` + 容器 `sigil/rune/ward/glyph`),作为响应式唯一真相源。
  - **react**:
    - 新增 `device.css` 横向地基 —— 触控热区 `--ms-target-min`(桌面 44px / 触屏 48px)、安全区 `--ms-safe-*`、动态视口 `--ms-viewport-h`(`dvh`/`svh`)、高 DPI `--ms-hairline`,以及 `.ms-hit-area` 隐形热区工具类。
    - 补齐密度闭环:`data-ms-density` 三档(`comfortable`/`compact`/`spacious`)→ `--ms-density-scale` / `--ms-control-h`(此前 `setDensity` 写 dataset 却无 CSS 消费的空壳)。
    - `styles.css` 启用 8 层 cascade layers(`ms.reset…ms.overrides`),组件归入 `ms.components`,使响应式覆盖与使用方应用层样式优先级可控。
    - Tag 关闭钮接入触屏热区(`pointer: coarse` 下命中区扩到 48px,视觉不变),作为后续组件复用范式。

- 首发 0.1.0:可配置主题系统 + 26 个组件

  magic-scope 首个发布版本(主题:魔法 / 深色奥术)。

  **@magic-scope/tokens** —— 设计 token 与主题引擎:

  - ThemeContract 核心契约(31 语义角色)+ 三层 token 架构
  - 主题引擎:compile / applyTheme / setTheme / setDensity / setMotion / setFx / withViewTransition / getNoFlashScript(SSR 无闪烁)
  - OKLCH 派生器:单 seed 色生成可访问色阶与完整主题;深色奥术默认预设 + 明暗双模
  - @property 可补间;子路径导出(./contract /engine /themes /derive)+ 静态 CSS 产物

  **@magic-scope/react** —— 26 个自研组件(消费 --ms-\* 变量,完整状态 / 键盘 / 可访问):

  - Actions: Button;Forms: Input/Textarea/Checkbox/Switch/Select/Label
  - Data Display: Badge/Tag/Avatar/Kbd/Table;Layout: Card/Divider/Accordion
  - Feedback: Alert/Progress/Spinner/Skeleton;Navigation: Tabs/Breadcrumb/Pagination
  - Overlay: Dialog/Tooltip/Popover/Menu(平台原生 Popover API + CSS Anchor Positioning)
  - 动效 / 光影可参数化(data-ms-motion / data-ms-fx 全局开关);84 个单测

### Patch Changes

- Updated dependencies [e54458d]
- Updated dependencies
  - @magic-scope/tokens@0.1.0
