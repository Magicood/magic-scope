# @magic-scope/tokens

## 0.2.0

### Minor Changes

- 2b29db9: 新增内置预设主题 **frost(霜蓝)**:青蓝主色 + 品红点缀、冷调中性,由 `deriveTheme` 从少量 seed 派生,与默认的 arcane(奥术紫)并列。导出 `frostDark` / `frostLight`,并加入 `presetThemes`(可被 `registerThemes` 一次注册)。示范主题引擎「给几个 seed 即生一套协调明暗主题」的能力。
- b6bf500: 新增 4 套派生预设主题 **ember(余烬) / verdant(苍翠) / solar(曦光) / mono(墨白)**,与 arcane / frost 并列共 **6 套配色**(各明暗双模,`deriveTheme` 从 seed 派生、零硬编码)。新增 `presetFamilies` 清单(name + label),作为主题画廊 / 选择器的数据源 —— 把「配色多重选择」落到一个可动态渲染的列表上(新增预设自动出现在画廊,无需改 UI)。

### Patch Changes

- a1dd83b: 修复 `tsup.config.ts`:`onSuccess` 改用运行时解析的绝对 file URL 动态 import 构建产物,避免 esbuild 在编译 config 时就静态解析尚不存在的 `./dist/index.js`,使**干净环境 / CI 首次构建**不再失败(此前依赖 `dist` 已存在,只有增量构建侥幸成功)。dist 产物内容不变。
- 2abcdf8: fix(tokens): 补全间距标尺缺档 —— 修复全库 padding/gap 塌成 0

  间距标尺主题层只 emit 了 `--ms-space-1/2/3/4/6/8`,但组件按连续 `1..10`(+ 0/12/16)取值,导致用到 `--ms-space-5`(全库 19 处)、`-7`、`-0`、`-10`、`-12`、`-16` 的地方 `var()` 解析为空 → padding/gap 静默塌成 0(如 Drawer 内容贴边)。

  现把标尺补成完整连续(N×0.25rem):scale 增 7/9,主题与契约同步 emit `0/1..10/12/16`。修复 Drawer 等 25 处间距,且让组件可放心按 `1..10` 取档。

- 5d2607a: 发布瘦身:构建关闭 sourcemap,不再把 `.map` 打进 tarball。包体显著减小(react ~135KB → 47KB、tokens ~50KB → 23KB),并去掉悬空的 `sourceMappingURL`。本仓库开发调试走 src(vitest / playground),不依赖 dist sourcemap。
- 4d2d694: 主题视觉中性化(优雅简洁、轻线条方向):

  - **arcane 默认主题底色去紫、中性化**:dark `#0A0710`→`#0A0A0B`(中性 zinc 深灰)、light `#FAF8FF`→`#FCFCFD`(中性近白),相邻 surface 档明度差收窄、不跳块。
  - **边框统一为半透明 hairline**:arcane 与 `deriveTheme` 派生的 5 套配色族(frost/ember/verdant/solar/mono)的 `border`/`borderStrong` 全改为半透明白(dark)/半透明黑(light),取代偏亮的色调硬线。
  - **品牌紫只保留在 primary / selection / focusRing / glow**;动画光影、过渡、状态色一律不动。
  - **去中二命名**:`label` "深色奥术"→"深色"、"浅色奥术"→"浅色"、family "奥术"→"暮紫"。
  - WCAG AA 全过(正文 fg-on-bg ≥ 4.5,次要 ≥ 3)。

## 0.1.1

### Patch Changes

- 补齐首发质量缺口:

  - 新增 MIT `LICENSE` 文件(根目录与两个发布包各一份),与已声明的 `license: MIT` 对齐
  - 修正 `exports` 的 `require` 分支类型导出:为 CJS 增加独立的 `.d.cts` types 指向,解决 CJS 消费者类型被当作 ESM 解析(arethetypeswrong 的 "Masquerading as ESM")的问题;publint 现全绿
  - 各包补 `engines.node >=20`、`keywords`、`homepage`、`bugs` 元数据
  - 各发布包新增 `README.md`,让 npm 包详情页有安装与用法说明

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
