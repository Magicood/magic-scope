# @magic-scope/react

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
