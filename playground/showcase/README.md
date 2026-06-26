# 组件展示站(showcase)

`pnpm play` → http://localhost:5173。单一架构,数据驱动,**示例引真实源码、props 从 TS 自动抽取**(对应 CI 红线:不手抄、不漂移)。

## 三层结构

```
showcase/
  registry/<id>.meta.ts        框架无关元数据:id/name/category/summary/controls/(propsName/alsoProps/spread)
  adapters/react/<id>.tsx      React 适配:Playground(旋钮驱动) + buildDemos(收集真实 demo)
  adapters/react/demos/<id>/   真实 demo 文件:既 import 实时渲染、又 ?raw 显示源码(同一文件,永不漂移)
  generated/props.json         由 scripts/extract-props.ts 从真实 TS 抽取(组件 props + *Options 接口)
  core/                        types / props 加载 / catalog(侧栏目录) / registry2(glob 自动发现)
  pages/ComponentDocV2.tsx     组件页:说明 + 演示(设备视口切换 + 旋钮) + 真实 demo(可折叠/多框架代码块) + 自动 props 表
```

加一个组件 = 丢 `registry/<id>.meta.ts` + `adapters/react/<id>.tsx` + `demos/<id>/*.tsx`,glob 自动注册,**无需改公共文件**。demo 从 `@magic-scope/react` 导入(Vite 别名指向源码)。

## 整合跑一次(组件会话补强后,展示会话执行)

> 工作模式:组件会话把全部组件按标准补强 → 全弄完 → 展示会话整合跑一次 → 再加新组件。

1. **同步组件代码**:把本 worktree(`feat/showcase-docs`)rebase / merge 到含组件增强的 main(或对应分支),让 `packages/react/src` 拿到新组件 / 新 props。
2. **重抽 props + 看缺口**:`pnpm showcase:sync`(= `gen:props` + `showcase:coverage`)。新 props 自动进表;覆盖率报告列出**尚未在 demo/控件中体现的 props**。
3. **补 demo / 旋钮**:对报告里每个「未演示」项,在 `demos/<id>/` 加真实 demo 文件;新的展示型枚举 prop 加进 `meta.controls`。深度遵 [[component-depth-mandate]](完整变体/子部件/生产特性 + 对抗性内容 demo)。
4. **新增组件**:若有全新组件,照上面三层加 meta+adapter+demos。
5. **校验**:`pnpm check:docs`(props 防漂移 + 完整性)、`biome check`、`vite build playground`。
6. **起站验收**:`pnpm play` 后**硬刷新一次**(import.meta.glob 加文件后 HMR 会残留旧 glob);窄屏验收用 390×844。

## 命令

| 命令 | 作用 |
|---|---|
| `pnpm play` | 起展示站(5173) |
| `pnpm gen:props` | 从真实 TS 重抽 props.json |
| `pnpm showcase:coverage` | 演示覆盖率报告(列出未演示的 props) |
| `pnpm showcase:sync` | gen:props + coverage(整合时一键看缺口) |
| `pnpm check:docs` | CI 红线:props 防漂移 + 每组件有真实 demo |
