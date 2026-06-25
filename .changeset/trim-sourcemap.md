---
"@magic-scope/tokens": patch
"@magic-scope/react": patch
---

发布瘦身:构建关闭 sourcemap,不再把 `.map` 打进 tarball。包体显著减小(react ~135KB → 47KB、tokens ~50KB → 23KB),并去掉悬空的 `sourceMappingURL`。本仓库开发调试走 src(vitest / playground),不依赖 dist sourcemap。
