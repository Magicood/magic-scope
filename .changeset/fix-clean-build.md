---
"@magic-scope/tokens": patch
---

修复 `tsup.config.ts`:`onSuccess` 改用运行时解析的绝对 file URL 动态 import 构建产物,避免 esbuild 在编译 config 时就静态解析尚不存在的 `./dist/index.js`,使**干净环境 / CI 首次构建**不再失败(此前依赖 `dist` 已存在,只有增量构建侥幸成功)。dist 产物内容不变。
