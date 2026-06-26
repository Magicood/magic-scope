# @magic-scope/core

> magic-scope 的**框架无关 headless 逻辑内核** —— 状态机 / 键盘 / 焦点 / 受控解析,纯 TS、零框架依赖。

多框架(react / vue / angular)共享同一份逻辑内核,各框架只写薄壳消费它。设计与迁移蓝图见仓库根 [`CORE-MIGRATION.md`](../../CORE-MIGRATION.md)。

> **状态:`0.0.0` 地基阶段** —— 当前仅公共原语 + 纯函数样板,验证 core 工程链路;组件状态机将随"抽内核试点"逐步迁入。暂不发布。

## 当前内容

| 导出 | 用途 |
| --- | --- |
| `createStore` / `Store` | 框架无关订阅式 store(React useSyncExternalStore / Vue shallowRef / Angular signal 各自绑定) |
| `resolveControlled` | 受控 / 非受控解析(八处组件共用的第一原语) |
| `createDisclosure` | 开合状态原语(Popover/Dialog/Menu/Tooltip) |
| `createRovingFocus` | roving 焦点索引计算(跳 disabled、可循环;「算焦点」纯逻辑,「移焦点」留薄壳) |
| `clamp` / `getInitials` | 纯函数样板(从 Progress/Avatar 抽出) |

## 切割铁律

core 只产出**「状态 + 动作意图 + props 描述」,绝不碰 DOM**。`focus()` / `showPopover()` / ref 合并 全部留各框架薄壳。
