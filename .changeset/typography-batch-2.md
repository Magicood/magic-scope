---
"@magic-scope/react": minor
---

新增 6 个 typography 组件:Heading / Paragraph / Code / Link / Blockquote / List

补全文字排版分类(此前仅 Text),全部站在 Text 底座、复用 tone/魔法/typography token,带留口/事件/i18n:

- **Heading**:`level`(1–6)定语义标签 + `variant` 视觉档(display/title/subtitle/overline/caption,视觉与语义解耦)+ family display 魔法标题 + gradient/glow + wrap=balance + **anchor permalink**(hover 浮出 # 锚点,文档/Prose 必备,slug/CJK/显式 id)+ as/asChild;logic.ts 纯函数。
- **Paragraph**:size/leading/tone/dimmed + **ellipsis 多行省略可展开**(AntD 式,onExpandChange)+ **copyable**(剪贴板 + 复制成功魔法 glow 一闪)+ classNames + as/asChild;logic.ts。
- **Code**:行内 `<code>` / `block` 块级 `<pre>`(tabSize/lineNumbers/横向滚动)+ 4 variant(solid/soft/outline/ghost)× tone + size + 块级 copyable;logic.ts(剪贴板三级兜底 + 抽纯文本)。
- **Link**:underline 四态(auto/hover/always/none)+ tone + `:visited` + **external 一键安全化**(target/rel + 外链图标 + sr-only i18n)+ disabled + asChild 路由 + glow;logic.ts(rel 合并/external/disabled)。
- **Blockquote**:4 variant(bordered/filled/card/plain)+ tone(强调条/柔底/辉光读槽位)+ cite/citeUrl + icon/quoteMark + gradient 强调条 + accentSide RTL;logic.ts。
- **List**:variant(unordered/ordered/description → ul/ol/dl)+ marker 自定义 + tone(::marker 着色)+ spacing(随密度)+ List.Item 子部件 + 嵌套。

全部:forwardRef、`...rest` 透传、className/style + classNames 部件映射、内容边界、动效双降级、strict TS。i18n 字典补 `typography.copy/copied/expand/collapse/permalink`、`link.newWindow`。+65 测试,全量 **559 无回归**,registry 42 组件,dts strict 通过。

至此 **typography 分类 7 个组件**(Text + 这 6 个)。
