---
"@magic-scope/react": minor
---

Checkbox 新增 `indeterminate` 半选态

`indeterminate?: boolean` 经合并 ref 落到原生 input 的 `.indeterminate`(仅视觉、不改 checked 取值),方块染主色并以横杠替代对勾。常用于「全选」框的部分选中态(Table 行选择即用它)。
