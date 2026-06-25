# CLAUDE.md

Claude Code 操作手册。**开始任何工作前,先读本文件与 `FOUNDATION.md`。**

## 项目
可发布到 npm 的**多框架 UI 组件库 + 自动化收录流水线**。每个组件都带溯源元数据(`component.json`),整个库可搜索、可追溯。完整背景与路线图见 `FOUNDATION.md`。

- 仓库:`magic-scope` ｜ npm scope:`@magic-scope`
- 发布包:`@magic-scope/tokens`、`@magic-scope/react`

## 技术栈
pnpm monorepo · TypeScript (strict) · tsup · Biome · Changesets · VitePress · zod · Vitest

## 目录
- `packages/tokens`(`@magic-scope/tokens`)、`packages/react`(`@magic-scope/react`)— 发布包
- `registry/` — schema + 索引脚本
- `scripts/new-component.ts` — 组件生成器
- `docs/` — VitePress 文档站

## 常用命令
- 新组件:`pnpm new`
- 构建:`pnpm build` ｜ 建索引:`pnpm registry` ｜ 文档:`pnpm docs:dev`
- 校验:`pnpm lint` ｜ 测试:`pnpm test`
- 发布:`pnpm changeset` → `pnpm run version` → `pnpm release`(注意 `pnpm run version`,`pnpm version` 会撞 pnpm 内置命令)

## 硬性约定
1. **每个组件必须有 `component.json`**,且 `source` 段填写溯源(来源 / capturedAt / requirements)。无元数据不得合并。`source.type` 为 `inspired` / `captured` 时**必须**至少给 `url` / `app` / `screenshot` 之一作为证据(schema 已强制,缺则 `pnpm registry` 校验失败);`original` 自研免证据。`requirements` 写真实需求原文 / 设计意图,勿照抄 `description`(`pnpm registry` 会列出疑似模板)。
2. **每次改动发布包都要 `pnpm changeset`** 写变更说明 —— 这是版本级的"有迹可循"。
3. 新增组件一律走 `pnpm new` 生成器,**不手工新建目录**,以保证结构与命名统一。
4. TypeScript strict;通过 `biome check` 才能提交。
5. 发布包导出走 `exports` map,标好 `sideEffects` 以保证 tree-shaking。
6. 提交信息结构化(`type(scope): ...`),便于追溯。
7. **多框架对等(设备适配 / 响应式):当前以 React 为基准落地适配,但适配契约是「框架无关」的——断点 token(`@magic-scope/tokens` 的 `breakpoints`)、横向 token(`--ms-target-min` / `--ms-safe-*` / `--ms-viewport-h` / `--ms-hairline`)、密度与 `data-ms-*` 属性、容器查询语义、pointer/hover 约定,都是唯一真相源。** 后续接入的主流框架(Vue / Web Component 等,见 `FOUNDATION.md` Phase 2)必须**同步对齐同一套适配语义**,不得各框架自行其是、各写一套断点或热区。实际接入放后续做,但新增任何组件 / 能力时,React 已有的适配行为要保证可平移到其它框架。

## 添加一个组件(标准流程 = 收录流水线的目标形态)
1. `pnpm new` —— 输入名称 / 分类,生成目录 + `component.json` 模板
2. 实现组件(**Claude 在此步介入**)
3. 填 `component.json` 的 `source`(来源 / 截图 / 需求原文)与 `description` / `tags`
4. `pnpm lint && pnpm test && pnpm registry`
5. `pnpm changeset`(写变更说明)
6. 提交并推送(**推到分支,勿直接动 `main`**)

## 不要做
- 不要新增没有 `component.json` 的组件
- 不要绕过 changeset 直接发布
- 不要手工拷目录建组件(必须用生成器)
- 不要直接 push `main`(走分支 / PR)
- 不要在没读 `FOUNDATION.md` 的情况下擅自更改技术选型或目录结构
