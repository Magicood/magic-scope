# TagInput <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

标签 / 令牌输入,输入框内把已添加项渲染成可删除芯片,回车或分隔符成标签,空输入 Backspace 删尾。

> **[在展示站中打开 TagInput](https://magicood.github.io/magic-scope/#/tag-input)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

把自由文本切成多枚可删除标签的输入控件:回车 / 自定义分隔符(默认逗号)成 tag、空输入 Backspace 删尾、粘贴含分隔符的串一次性切多枚。

约束侧:maxTags 限数量、默认去重(caseSensitive 可配)、validate 校验被拒走 onReject;受控 / 非受控双通道接 Form(invalid + aria-invalid)。

差异化深度:双击改写标签(editable)、失焦自动提交残留(addOnBlur)、清空全部(clearable)、renderTag 完全自绘留口;纯算法抽进 logic.ts。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `readonly string[]` | — | 受控值(string&#91;])。传入即受控,配合 onChange。 |
| `defaultValue` | `readonly string[]` | — | 初始值(非受控)。 |
| `delimiter` | `string \| readonly string[]` | — | 分隔符:命中即把当前输入转成标签。可传单字符 / 多字符 / 数组。默认逗号 `,`(回车始终生效,无需配置)。<br>也用于粘贴时一次性切分多标签。<br><br>键入触发:单字符分隔符走 keydown 即时命中;多字符分隔符(如 `'::'`)无法在 keydown 命中<br>(键盘事件的 key 永远是单字符),改由「检测 draft 末尾后缀」在 onChange 时命中并切分。<br>两者最终行为一致;粘贴路径(splitByDelimiters)对单/多字符分隔符一视同仁。 |
| `maxTags` | `number` | — | 标签数量上限。达到后停止新增(并对输入框设只读语义)。undefined 表不限。 |
| `allowDuplicates` | `boolean` | `false` | 是否允许重复标签。默认 false(去重,大小写不敏感)。 |
| `caseSensitive` | `boolean` | `false` | 去重是否大小写敏感。默认 false。 |
| `validate` | `((tag: string) => boolean)` | — | 业务校验:返回 false(或抛错)则拒绝加入。规整(trim)后的候选标签入参。 |
| `disabled` | `boolean` | `false` | 禁用:不可输入 / 增删 / 聚焦,染禁用态。 |
| `placeholder` | `string` | — | 输入框占位符(无标签且输入为空时可见)。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `invalid` | `boolean` | `false` | 校验失败态:染 danger 发光环并设 aria-invalid(供 Form)。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | `primary` | 聚焦发光环色调;invalid 时强制 danger。默认 primary。 |
| `addOnBlur` | `boolean` | `false` | 失焦时把残留输入提交为标签。默认 false。 |
| `editable` | `boolean` | `false` | 双击标签可改写其文本(回填到输入框,确认后替换原标签)。默认 false。 |
| `clearable` | `boolean` | `false` | 有标签时在末尾显示「清空全部」按钮(复用 input.clear 文案)。默认 false。 |
| `renderTag` | `((context: RenderTagContext) => ReactNode)` | — | 自定义渲染每个标签(留口:完全接管标签外观;不传走内置芯片)。<br>组件已负责列表项 key,无需在返回节点上自写 key。<br>想让 ←/→/Backspace 标签键盘导航在自绘模式下也生效,需把 `context.ref` 挂到你的可聚焦元素上<br>(不挂则该标签不参与键盘导航 —— 这是 renderTag 模式下的已知契约)。 |
| `classNames` | `TagInputClassNames` | — | 子部件类名插槽。 |
| `inputProps` | `Omit<Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "ref">, "ref" \| ... 5 more ... \| "placeholder">` | — | 内层文本输入框的额外属性透传(如 name / inputMode / autoComplete);其受控值 / onChange 由组件接管。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string[]) => void` | 标签数组变化(增 / 删 / 编辑后)的核心回调(受控 / 非受控双通道)。<br>· `value` — 变化后的完整标签数组。 |
| `onRemoveTag` | `(value: string, index: number) => void` | 任一标签被移除时触发(在内部状态更新之前)。<br>· `value` — 被移除标签的文本。<br>· `index` — 被移除标签的下标。 |
| `onReject` | `(tag: string, reason: "max" \| "invalid" \| "empty" \| "duplicate") => void` | 新增标签被拒时触发(超限 / 重复 / 校验失败 / 空)。<br>· `tag` — 规整后的被拒标签文本。<br>· `reason` — 拒绝原因:empty / max / duplicate / invalid。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 兼容性备注

透明披露的已知边界与契约(来自 `component.json` 的 `source.notes`):

复用全库 tone resolver 与 --ms-* token,观感对齐 Tag(soft)与 Input(聚焦发光环);i18n 复用既有 key(tag.remove / input.clear),本组件不新增文案 key。兼容性边界(透明备注):(1) 回车提交守卫 IME 组合态(nativeEvent.isComposing / keyCode===229),复用 Textarea 同范式,CJK 选词确认的 Enter 不误提交。(2) 键入触发分隔符:单字符走 keydown 即时命中;多字符分隔符(如 '::')keydown 命中不了(键盘事件 key 永远单字符),改由 onChange 检测 draft 末尾后缀切分,行为与单字符一致;粘贴路径对单/多字符一视同仁。(3) renderTag 自绘模式:列表项 key 由组件负责(用户无需自写);← / → / Backspace 标签键盘导航需用户把 RenderTagContext.ref 挂到自绘的可聚焦元素上才生效,未挂则该标签不参与键盘导航(已知契约)。(4) 粘贴被全部去重/超限拒掉(无净新增)时保留输入框已有草稿,不吞用户正在编辑的文本。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `tag` `token` `chips` `input` `multi-value` `form` `tagging` `keywords` |

::: details 需求原文 / 设计意图
表单里需要一个把自由文本切成多枚可删除标签的输入控件:回车 / 自定义分隔符(默认逗号)成 tag、空输入 Backspace 删尾、粘贴含分隔符的串一次性切多枚;约束侧要能限数量(maxTags)、默认去重(大小写不敏感可配)、接业务 validate 否决,被拒走 onReject 而非静默吞掉。要受控/非受控双通道接 Form(invalid + aria-invalid)。差异化深度:双击改写标签(editable)、失焦自动提交残留(addOnBlur)、清空全部(clearable 复用 input.clear)、renderTag 完全自绘留口。可达性:外层 role=group、输入 role=combobox、每枚移除按钮 aria-label 走 tag.remove、← 进入标签导航 + ←→/Backspace 在标签间操作;多标签换行不撑破。纯算法(规整/分隔/能否新增)抽进 logic.ts 便于平移其它框架内核。
:::
