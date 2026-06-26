---
"@magic-scope/react": minor
---

feat(react): 新增 Form 表单子系统 + 校验引擎(v2 旗舰)

一套对标 react-hook-form 性能 + antd Form 声明式 + 端到端类型安全三者之长的表单子系统:

- **零 React 校验内核**(`logic.ts`):`createFormStore` 细粒度 path 切片订阅(打字只重渲单字段、表单根与兄弟字段零 re-render)、校验引擎 `validateField`/`validateForm`、内建规则 + 纯函数路径读写,全部零 React、可平移 `@magic-scope/core`。
- **双轨校验可叠加**:per-field rules(required/min/max/minLength/maxLength/pattern/email/url/自定义,零依赖、可 i18n)+ Standard Schema v1(zod≥3.24 / valibot / arktype 经 `~standard.validate`,核心零运行时依赖)。异步校验自带 AbortController 竞态取消 + 防抖。
- **10 个异形控件显式适配器表**(`adapters.ts`):Input/Textarea/NumberInput/Checkbox/CheckboxGroup/RadioGroup/Switch/Slider/Rate/Segmented/Select,吸收 value/onChange/checked 形态差异,事件经 `composeEventHandlers` 合并不覆盖用户处理器。
- **公开 API**:`useForm` / `useField` / `useWatch` / `useFormContext`;`Form` / `Form.Field`(别名 `Form.Item`)/ `Form.Submit` / `Form.Reset` / `Form.List` / `Form.ErrorSummary`;`FieldPath<T>` / `PathValue<T,P>` 端到端类型安全的命令式 api(setValue/trigger/getValues)。
- **a11y**:label↔control 关联、aria-invalid/describedby/required、错误 role=alert、提交聚焦首个错误字段。多态 `as` / `asChild`、整表 `disabled` 下发、细粒度 `classNames`。
- **魔法差异化**:校验失败态复用全库 tone resolver 发光、错误文案滑入不抖布局、validating 旋转符文;density/motion/fx/tone 在 Form 根一处切、整表派生。

新增 11 个 `form.*` i18n 默认校验文案 key(可覆盖)。
