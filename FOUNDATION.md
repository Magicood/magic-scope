# FOUNDATION.md — 组件库基础与路线图

> 本文件是项目的「设计存档 + 落地规范」,由 Claude(claude.ai 会话)与 Magic 讨论后生成,供 **Claude Code 在新会话中读取并执行**。
> 如果你是 Claude Code:先读本文件和 `CLAUDE.md`,再开始脚手架。先搭基础,不要急着实现业务组件。

> **命名(已定稿):** 仓库 `magic-scope` · npm scope `@magic-scope` · 发布包 `@magic-scope/tokens`、`@magic-scope/react`。本文档内不再有占位名,可直接执行。

---

## 1. 这是什么

一个**可发布到 npm、多框架、带溯源的 UI 组件库**,配套一条**自动化收录流水线**:

- Magic 看到一个喜欢的 UI / 面板 → 把截图 / 描述 + 需求交给 Claude
- Claude 实现该组件、写好溯源元数据、跑测试、提交并推送到仓库
- 每个组件在库中是一条**带档案的条目**(来源、收录日期、原始需求、版本),可搜索、可追溯
- **git 历史 + Changesets changelog = 「有迹可循」;`component.json` = 「可落库」**

### 收录流水线(目标形态)
```
你:提供 UI + 需求
   │
   ▼
[ 自动化命令(Claude Code) ]
   · 脚手架(模板)            自动
   · 实现组件                需 Claude
   · 写 component.json 元数据  自动
   · lint · test · changeset  自动
   │
   ▼
你:review → 批准
   │
   ▼
git push → 仓库 (git = 溯源)   自动
   │
   ▼
构建索引 → manifest / SQLite   自动
   │
   ▼
AgentDeck / 文档站  浏览 · 搜索
```
**注意:「实现组件」每次需要 Claude 在回路里**;其余步骤自动。单组件 Magic 的耗时 = 几分钟输入 + 一次 review,不是 0。

---

## ✦ 设计哲学(核心 · 先读 · 优先级最高)

> Magic 给 `magic` 的定调:**多变、平滑、亮眼、有吸引力**。下面几条凌驾于具体实现之上,与任何细节冲突时以本节为准。

1. **千变万化,但可控;随心变化,但遵从核心。** 一套**核心契约**(core tokens / 主题契约)驱动一切——配色、主题、变体、密度都由核心**派生**,而非各处硬编码。于是无论怎么变,结果始终协调、可控、可在运行时切换。这是「magic 多变」与「工程可控」的统一。
2. **动效是一等公民。** 更多动效 + **完整的过渡**:每个状态 / 切换(hover、focus、open/close、主题切换、内容进出)都有完整、平滑的 transition,杜绝突兀跳变。平滑感优先。
3. **不偷懒,为性能自研。** 组件与动效**自己手写**,不抄现成、不 wrap 第三方 UI / 动画库(与「溯源 original」一致)。优先原生高性能方案(CSS、Web Animations API、`transform`/`opacity` 合成层动画;避免触发 layout / reflow 抖动)。
4. **灵活 = 一等能力。** 组件内建「一键切换」类能力——主题 / 配色 / 明暗 / 密度 / 动效强度 / 变体,皆可一键切换;可切换性作为设计与 API 的一等公民。
5. **命名带自有色彩(核心契约 + 双轨皮肤)。** 底层(token / 主题 / 动效 / 变体色族 / `--ms-` 变量 / 内部 API)纯魔法命名且为**唯一真相源**;组件公共 API 用标准语义名作默认入口(商用零门槛),另提供魔法别名作 opt-in 皮肤。魔法名是第一公民,标准名是对外映射。**定稿见第 9 节。**
6. **可访问性是底线。** 亮眼与动效不牺牲对比度与可用性;尊重 `prefers-reduced-motion`、键盘可达、ARIA 正确。
7. **不锁色彩,配置驱动。** 不针对任何行业 / 固定主色;**配色与主题由使用者配置**,支持多色主题、高度自定义。「深色奥术 Arcane」等是**开箱即用的默认预设主题(非唯一)**;核心是语义角色 + 主题引擎,预设只是其上的一层皮肤。
8. **适配主流设备 + 用满现代平台能力。** 响应式跨设备(桌面 / 平板 / 手机 / 触控 / 高 DPI)、light + dark;实现用满现阶段最先进的 Web 平台能力与最佳实践(OKLCH 色彩、`color-mix()`、container queries、cascade layers、`@property`、View Transitions、scroll-driven animations 等),并做优雅降级。
9. **地基优先,不计成本。** 前期把基础打到扎实且领先(主题引擎 / token 契约 / 构建 / 设备适配 / 动效系统),不急于堆业务组件;为质量不惜投入。

---

## 2. 技术选型(基础阶段定稿)

| 关注点 | 选择 | 理由 |
|---|---|---|
| 包管理 / monorepo | pnpm workspaces | Magic 已在用;workspace 协议管内部依赖 |
| 语言 | TypeScript (strict) | 类型即标准 |
| 构建 | tsup | 零配置输出 ESM + CJS + `.d.ts`,发布友好 |
| Lint / 格式化 | Biome | 单工具、快;若需 React 专用规则插件可换 ESLint + Prettier |
| 版本 / 发布 / changelog | Changesets | 每包 semver + 自动 `CHANGELOG`(版本级溯源)+ 发布 npm |
| 文档站 | VitePress | 轻量、Vite 系、可消费 registry 自动列组件;交互演示(Storybook)留作 Phase 2 |
| 注册表校验 | zod | `component.json` schema |
| 索引落库 | `manifest.json`(源)+ SQLite(可选索引) | **files 为唯一真相源**,DB 仅做查询 / 前台 |
| 测试 | Vitest | Vite 原生 |

---

## 3. 目录结构(基础阶段)
```
magic-scope/
├── .changeset/
├── packages/
│   ├── tokens/       # 设计 token(多框架共享标准;发布)
│   └── react/        # 首个组件包(发布;依赖 tokens)
├── registry/
│   ├── component.schema.ts   # zod schema
│   ├── build-index.ts        # 扫描 component.json → manifest.json (+ 可选 SQLite)
│   └── manifest.json         # 生成物
├── scripts/
│   └── new-component.ts      # 生成器(脚手架 + 元数据模板)
├── docs/                     # VitePress
├── CLAUDE.md
├── FOUNDATION.md
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── biome.json
└── package.json              # 私有 root
```
> **多框架扩展**(`packages/core` 的 Web Component 内核、`packages/vue`)属 **Phase 2**,结构已预留,届时为「新增」而非「重构」。基础阶段先把一条链路(tokens → react → 发布 + 文档 + 索引)打通。

---

## 4. `component.json`(溯源元数据 schema)
每个组件一份,是「可落库 + 有迹可循」的核心:
```jsonc
{
  "id": "button",
  "name": "Button",
  "description": "主操作按钮",
  "category": "actions",
  "tags": ["button", "action"],
  "status": "stable",               // draft | stable | deprecated
  "version": "0.1.0",
  "frameworks": ["react"],          // react | vue | web-component | tokens
  "source": {                        // ← 溯源,这一段是关键
    "type": "inspired",             // original | inspired | captured
    "url": "https://...",           // 灵感 / 原始 UI 出处(可选)
    "app": "Linear",                // 出处应用名(可选)
    "screenshot": "./preview.png",  // 参考截图(可选)
    "capturedAt": "2026-06-24",     // 收录日期
    "requirements": "你当时给的需求原文"
  },
  "dependencies": ["@magic-scope/tokens"],
  "preview": "./preview.png",
  "files": ["Button.tsx", "Button.css.ts", "index.ts"]
}
```
`registry/build-index.ts`:扫描 `packages/*/src/**/component.json` → 用 zod 校验 → 写 `registry/manifest.json`(数组)→ (Phase 1 可选)同步写入 SQLite `components` 表供查询 / AgentDeck 前台。

---

## 5. 根 `package.json` scripts(约定)
```jsonc
{
  "private": true,
  "scripts": {
    "build":     "pnpm -r build",
    "lint":      "biome check .",
    "format":    "biome format --write .",
    "test":      "vitest run",
    "new":       "tsx scripts/new-component.ts",
    "registry":  "tsx registry/build-index.ts",
    "docs:dev":  "vitepress dev docs",
    "docs:build":"vitepress build docs",
    "changeset": "changeset",
    "version":   "changeset version",
    "release":   "pnpm build && changeset publish"
  }
}
```

---

## 6. 发布到 npm(要点)
- 需要 npm 账号 + scope `@magic-scope`(首次发布前在 npmjs.com 注册该 org / 用个人 scope);本机 `npm login`
- 每个发布包的 `package.json`:
  - `"name": "@magic-scope/<pkg>"`(如 `@magic-scope/tokens`、`@magic-scope/react`)、`"type": "module"`
  - `"exports"`:区分 `import` / `require` / `types`
  - `"files": ["dist"]`
  - 合理设置 `"sideEffects"`(保证 tree-shaking)
  - `"publishConfig": { "access": "public" }`(scoped 包公开发布必需)
  - `"repository"` 字段(npm → git 的溯源链接)
- 在 `.changeset/config.json` 里设 `"access": "public"`
- 发布流程:改动 → `pnpm changeset`(写变更)→ `pnpm run version`(升号 + 生成 `CHANGELOG`;注意是 `pnpm run version`,`pnpm version` 撞 pnpm 内置)→ `pnpm release`(构建 + 发布)
- 首次可先 `npm publish --dry-run` 验证打包产物

---

## 7. 落地步骤(Phase 0)
**纯命令的部分可直接跑;文件内容多的部分(各 `package.json`、schema、生成器、示例组件、VitePress 配置)由 Claude Code 按本文件生成。**

```bash
# 0. 名字已定:仓库 magic-scope,npm scope @magic-scope(本机当前即在 magic-scope/ 内)

# 1. 仓库(本仓库已 git init,此步可跳过)
# mkdir magic-scope && cd magic-scope
# git init
pnpm init                      # 然后把 root package.json 设为 "private": true

# 2. workspace + 目录
printf 'packages:\n  - "packages/*"\n' > pnpm-workspace.yaml
mkdir -p packages registry scripts docs

# 3. 基础开发依赖
pnpm add -Dw typescript tsup tsx vitest @biomejs/biome @changesets/cli zod vitepress

# 4. 初始化工具
pnpm exec biome init           # 生成 biome.json
pnpm exec changeset init       # 生成 .changeset/(随后把 access 改为 "public")
#  tsconfig.base.json 由 Claude Code 写(strict)

# 5. 交给 Claude Code 按本文件搭建:
#    packages/tokens、packages/react(含 Button 示例)、
#    registry/(schema + build-index)、scripts/new-component.ts、docs/(VitePress)、
#    各包 package.json(exports / files / publishConfig)、根 scripts

# 6. 首次提交
git add -A && git commit -m "chore: foundation skeleton"

# 7. (可选)建远程仓库并推送(<owner> 换成你的 GitHub 用户名 / org)
# gh repo create <owner>/magic-scope --private --source=. --remote=origin --push
```

---

## 8. 路线图
- **Phase 0(现在):** 仓库 + monorepo + `tokens` + `react` 首组件(Button)+ registry + 生成器 + VitePress + 发布链路,跑通 `build / registry / docs`。
- **Phase 1:** 把「脚手架 → 实现 → 元数据 → test → changeset → commit → push → 建索引」包成一条 Claude Code 命令 / skill(收录流水线)。
- **Phase 2:** Web Component 内核(`packages/core`)+ Vue 封装(`packages/vue`);docs 从 TSDoc / manifest 自动生成;SQLite 索引 + AgentDeck 前台;GitHub Actions CI(PR 校验 + 合并自动发布)。

---

## 9. 待定(Magic 后续补充想法,占位区)
- registry 是否升级为真数据库(当前默认 files 为源 + SQLite 索引)
- **动效 / 光影 / 渐变参数化(下一步重点 —— 用户反馈当前视觉偏死板):** 把发光 / 渐变 / 动效做成**可开关参数**(组件 CSS 接入已有的 `data-ms-motion` full/subtle/off,并新增"视觉强度 / 光效"开关如 `data-ms-fx`),让用户自选是否应用;同时把视觉做得**更丰富**。基础组件铺完后做。
- 是否引入 Storybook 做交互演示
- 展示字体的具体选型与授权(随设计语言落地时定)
- _(后续在此追加)_

### 已拍板(从待定区毕业)
- **命名:** 仓库 `magic-scope`,npm scope `@magic-scope`,首发包 `@magic-scope/tokens`、`@magic-scope/react`。
- **设计主题:** 魔法(Magic),围绕 `magic` 一词。
- **视觉方向:** 核心 = **高度可配置的多主题引擎**(配色由使用者定义,不锁行业 / 主色,支持多色主题、高自定义)。**深色奥术(Arcane)** —— 暗底 + 霓虹发光(glow)+ 紫/青/品红 + 符文(sigil)几何 —— 是**开箱即用的默认预设主题(非唯一)**。light + dark 双模,dark 作默认。
- **命名策略 =「核心契约 + 双轨皮肤」(为「自用起步 → 后续商用」+「重品牌表达」+「接受双轨」定制):**
  - **底层(token / 主题 / 动效 / 变体色族 / CSS 变量 `--ms-` / 内部 API):纯魔法命名,且是唯一真相源。** `arcane`/`ember`/`frost`/`void`、`glow.*`、动效 `cast`/`shimmer`/`conjure` —— 这是「我们自己的色彩」的根。
  - **组件公共 API:标准语义名作默认入口。** `Button`/`Input`/`Dialog` + 标准 props(`variant`/`size`/`disabled`),保证商用零门槛、可搜索、AI 可检索。
  - **魔法贯穿到「使用层」靠风格 / 动效而非改组件名:** 如 `tone="arcane"|"ember"|"frost"`、`<Button glow>`、动效名 `cast`/`shimmer` —— 高频在用、既带色彩又不挡路。
  - **双轨别名 = opt-in 皮肤出口:** 默认入口标准名;额外提供一套魔法化别名 / 主题预设导出(薄包装),想要魔法命名的人自选。双轨只在「别名 / 皮肤」薄层,不是整套 API 翻倍。
  - **总原则:魔法名是第一公民(根),标准名是面向外部的官方映射;两者由同一核心契约派生,不各自硬编码(呼应设计哲学第 1 条)。** 详细命名词典与机制见 [`DESIGN.md`](./DESIGN.md)。
- **token 体系:** 底层「原始调色板」用魔法名(`arcane` / `ember` / `frost` / `void`),上层「语义层」用标准角色名(`primary` / `surface` / `danger`…)映射;CSS 变量前缀 `--ms-`。具体色值 / 数值见 [`DESIGN.md`](./DESIGN.md)(设计语言规范)。
- **地基技术决策(2026-06-24 定稿):** 17 项已拍板,详见 [`DESIGN.md`](./DESIGN.md) 附录 A.1。要点:核心契约现在补齐常用角色一次定准(`overlay`/`selection`/`link`/`surfaceSunken`);主题引擎先寄居 `@magic-scope/tokens` 的 `./runtime`(Phase 2 迁 `core`);对比度 **WCAG AA + 派生器自愈**;色阶 50–950 全存;**OKLCH** 色彩 + `culori`(build-only),不引 PostCSS;`data-ms-*` 属性 + 8 层 cascade layers。
- **范围与发布决策(2026-06-24 商定):** 浏览器**仅现代 evergreen**(放手用 OKLCH / 容器查询 / View Transitions / `@property`,降级只保功能);收录输入 = **截图 / 在线 URL / Figma**(Phase 1 据此:读图 + 抓网页 + Figma);溯源**受启发重做、原创优先**(`source.type` 默认 `inspired`/`original`,可公开);组件**按通用库系统化铺**(Input/Select/Checkbox → Card/Dialog/Tooltip…);多框架 **react 先深耕,vue/wc 留 Phase 2**;发布 **攒一批 + 文档再首发 `0.1`**;`@magic-scope` scope **尚未注册**(npm 上为 404,包名可用,发布前注册);远程 **先推 GitHub(私有),CI 后置**;协作走**分支 + PR**,做一步提交一步。

---

## 10. 在 Claude Code 中恢复
1. 把本 `FOUNDATION.md` 与 `CLAUDE.md` 放入仓库根并提交。
2. 新开 Claude Code 会话,工作目录指向仓库根。
3. 首条指令示例:
   > 读 `CLAUDE.md` 和 `FOUNDATION.md`,按 Phase 0 搭好基础脚手架;先不做业务组件,用一个 `Button` 当示例,把 `build` / `registry` / `docs` 跑通。
4. 之后把「待定」里的想法逐条补充给它。
