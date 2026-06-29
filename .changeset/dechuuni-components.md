---
"@magic-scope/react": patch
---

chore(react): 去中二文案 —— 组件库面向用户中文改为克制专业措辞

按 `DE-CHUUNI.md` 对照规则,清理 49 个组件里 component.json description/requirements、
*.tsx JSDoc/注释/默认文案、*.css 注释中的中二法术词:辉光→发光、符文→图标、
奥术(修饰)删去、施法→操作/加载、流光→渐变/高亮 等。仅改面向用户的中文文案,
保留英文标识符(prop 名 `glow`、variant `aurora`、`shimmer`、主题 key `arcane`)与
变量/类名/keyframe 名不动(改了会 breaking),需求原意未改。

呼应视觉方向「魔法=精致克制的效果,不是中二法术文字」。复查 grep 中二词清零。
