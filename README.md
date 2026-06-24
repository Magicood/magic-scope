# magic-scope

> 可发布到 npm 的**多框架 UI 组件库 + 自动化收录流水线**。每个组件都带溯源元数据,整个库可搜索、可追溯。

![status](https://img.shields.io/badge/status-Phase%200-blue)
![pnpm](https://img.shields.io/badge/pnpm-monorepo-f69220)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![license](https://img.shields.io/badge/license-MIT-green)

- **仓库:** `magic-scope` ｜ **npm scope:** `@magic-scope`
- **发布包:** `@magic-scope/tokens`、`@magic-scope/react`

---

## 这是什么

一条「看到喜欢的 UI → 沉淀成可复用、可追溯组件」的流水线:

1. 看到一个喜欢的界面 / 面板 → 把截图、描述、需求交给 Claude
2. Claude 实现组件、写好溯源元数据(`component.json`)、跑测试、提交
3. 每个组件在库里都是一条**带档案的条目**(来源、收录日期、原始需求、版本),可搜索、可追溯

> **git 历史 + Changesets changelog = 「有迹可循」;`component.json` = 「可落库」。**

完整的设计背景、技术选型理由与路线图见 [`FOUNDATION.md`](./FOUNDATION.md);
Claude Code 的操作约定见 [`CLAUDE.md`](./CLAUDE.md)。

## 技术栈

pnpm monorepo · TypeScript (strict) · [tsup](https://tsup.egoist.dev/) · [Biome](https://biomejs.dev/) · [Changesets](https://github.com/changesets/changesets) · [VitePress](https://vitepress.dev/) · [zod](https://zod.dev/) · [Vitest](https://vitest.dev/)

## 目录结构

```
magic-scope/
├── packages/
│   ├── tokens/     # 设计 token(多框架共享标准;@magic-scope/tokens)
│   └── react/      # React 组件包(@magic-scope/react,依赖 tokens)
├── registry/       # component.json 的 zod schema + 索引脚本(扫描 → manifest.json)
├── scripts/        # new-component.ts 组件生成器
├── docs/           # VitePress 文档站
├── CLAUDE.md       # Claude Code 操作手册
└── FOUNDATION.md   # 设计存档 + 落地规范 + 路线图
```

## 快速开始

```bash
pnpm install

pnpm build        # 构建所有发布包(ESM + CJS + .d.ts)
pnpm registry     # 扫描 component.json → 生成 registry/manifest.json
pnpm docs:dev     # 启动 VitePress 文档站
pnpm lint         # Biome 校验
pnpm test         # Vitest
```

## 添加一个组件

标准流程(也是收录流水线的目标形态):

```bash
pnpm new          # 输入名称 / 分类 → 生成目录 + component.json 模板
# → 实现组件
# → 填 component.json 的 source(来源 / 截图 / 需求原文)与 description / tags
pnpm lint && pnpm test && pnpm registry
pnpm changeset    # 写变更说明(版本级溯源)
# → 提交并推送到分支(勿直接动 main)
```

**硬性约定:** 每个组件必须有 `component.json` 且填好 `source` 溯源段;新增组件一律走 `pnpm new` 生成器,不手工建目录;改动发布包必须 `pnpm changeset`。详见 [`CLAUDE.md`](./CLAUDE.md)。

### `component.json`(溯源元数据)

每个组件一份,是「可落库 + 有迹可循」的核心:

```jsonc
{
  "id": "button",
  "name": "Button",
  "category": "actions",
  "status": "stable",                 // draft | stable | deprecated
  "frameworks": ["react"],
  "source": {                          // ← 溯源,关键段
    "type": "inspired",               // original | inspired | captured
    "app": "Linear",                  // 出处(可选)
    "capturedAt": "2026-06-24",       // 收录日期
    "requirements": "当时给的需求原文"
  },
  "dependencies": ["@magic-scope/tokens"],
  "files": ["Button.tsx", "index.ts"]
}
```

## 发布

```bash
pnpm changeset    # 1. 写变更说明
pnpm version      # 2. 升 semver + 生成 CHANGELOG
pnpm release      # 3. 构建 + changeset publish 到 npm
```

发布包以 `@magic-scope/*` 命名,走 `exports` map 导出并标注 `sideEffects` 以保证 tree-shaking。首次发布前需 `npm login` 并准备好 `@magic-scope` scope。

## 路线图

- **Phase 0(现在):** 仓库 + monorepo + `tokens` + `react` 首组件 + registry + 生成器 + VitePress + 发布链路,跑通 `build / registry / docs`。
- **Phase 1:** 把「脚手架 → 实现 → 元数据 → test → changeset → commit → push → 建索引」包成一条 Claude Code 命令 / skill。
- **Phase 2:** Web Component 内核(`packages/core`)+ Vue 封装(`packages/vue`);docs 自动生成;SQLite 索引 + 前台浏览;GitHub Actions CI。

## License

MIT
