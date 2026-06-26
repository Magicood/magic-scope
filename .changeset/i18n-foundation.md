---
"@magic-scope/react": minor
---

新增 i18n 文案字典(框架无关化地基第一块)

为多框架/可换 locale 铺路:面向用户的文案不再焊死在 JSX 里,集中成可替换字典。

- `messages.ts`(**纯数据 + 纯函数,零框架依赖,将来可原样平移进 `packages/core`**):`defaultMessages`(zh-CN 全集,纯数据、可 JSON、译者可改)、`formatMessage`(`{var}` 插值)、`resolveMessage`(覆盖→默认→fallback,缺 key 时 dev 警告而非把内部点分串泄漏到 UI)、`PartialMessages` 类型(索引含 `undefined`,使 strict `noUncheckedIndexedAccess` 下的合并不报 TS2322)、`translate`/`getActiveMessages`/`setActiveMessages` 模块单例通道(供 React 树之外的命令式 API 如 confirm/alert/toast 取文案)。
- React 绑定(极薄):`MessagesProvider`(合并父级 + 覆盖,并同步写入模块单例)、`useMessages()` 返回稳定的 `t(key, vars?, fallback?)`。
- 首个接入:`Input` 的清除/密码切换 `aria-label` 改走字典(默认行为不变)。其余 ~30 处既有硬编码文案为存量债,随各组件迭代逐步迁移。
- v1 仅简单插值;复数(plural/ICU)延后。

设计经对抗式校验(修掉了 strict 合并报错、命令式 API 取值通道缺失、缺 key 裸泄漏等真实坑)。
