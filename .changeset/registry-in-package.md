---
"@magic-scope/react": minor
---

溯源随包:`@magic-scope/react` 构建时把组件的 `component.json` 溯源汇总成 `dist/registry.json` 一并发布,并新增导出 `@magic-scope/react/registry.json`。消费端可直接读取每个组件的来源、收录日期与需求,「可追溯」从 git 仓库延伸到安装后的包内。
