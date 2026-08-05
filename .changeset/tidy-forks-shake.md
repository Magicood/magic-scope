---
'@magic-scope/react': patch
---

Form 的 5 个公开子部件补齐 props 文档:`Form.Field` / `Form.Submit` / `Form.Reset` / `Form.List` / `Form.ErrorSummary` 此前在 `props.json` 与文档站里连键都没有(props 抽取器只读组件目录下的同名主文件,写在 `Field.tsx` / `Form.parts.tsx` 里的子部件根本没进解析范围)。

- `Form.Submit` / `Form.Reset` 改用导出的具名接口 `FormSubmitProps` / `FormResetProps`(此前直接用 `ButtonProps`),自有 prop 逐条补 JSDoc;两者仍原样透传 Button 的全部 props。
- `Field` / `FormList` 由函数声明改为 `const`(函数声明会被提升,react-docgen 认不出紧随其后的 `displayName` 赋值,键会退化成 `Field` / `FormList` 而不是 `Form.Field` / `Form.List`);运行时行为与类型不变。
- 子部件 props 的说明统一带 `Form.X:` 归属前缀,合并进 Form 参数表后仍能看出出处。
