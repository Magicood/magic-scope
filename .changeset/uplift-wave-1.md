---
"@magic-scope/react": minor
---

组件补强 Wave 1:Switch / Avatar / Kbd / Alert / Progress / Badge 从最小版到生产级

对标旗舰 Button/Input/Text,把 6 个最「最小版」的组件按已立标准(深度 / 光影+动效 / 留口 / i18n / a11y)补厚:

- **Switch**:size(sm/md/lg,随密度)+ tone(7 色,读槽位)+ children 文字 + checkedIcon/uncheckedIcon + loading;修 reduced-motion 合规与 motion-scale 误用;trackClassName/thumbClassName 留口。
- **Avatar**:接 tone 系统 + name 哈希确定性配色 + status 状态点(可呼吸)+ 加载失败兜底 + asChild + shape(circle/rounded/square)+ ring/bordered + 实例级 glow;**新增 AvatarGroup**(重叠堆叠 +N 占位);抽出 logic.ts 纯函数。
- **Kbd**:**keys 自动拆键帽** + 平台符号映射(⌘⌃⌥⇧,mac/win)+ tone + lg 档 + separator 槽;logic.ts 纯解析。
- **Alert**:4 变体重写为读 tone 槽位 + icon/title/action/dismissible 子部件 + classNames 细粒度 + asChild + @starting-style 进场 + role 语义分流(alert/status)+ 关闭文案走 i18n。
- **Progress**:size/tone + 环形进度 + 条纹 + 不确定态动效降级 + label 槽。
- **Badge**:tone 解析器(per-tone CSS 压成 per-variant)+ dot 圆点 + count 数字角标(max/showZero/overlap)+ size。

全部:发光受 `--ms-fx-glow` + `data-ms-fx=off` 总闸,动效受 `prefers-reduced-motion` + `data-ms-motion=off` 双降级,尺寸随 `--ms-density-scale`。i18n 字典补 alert.close + avatar.status.*。+61 测试,全量 248 无回归,dts strict 通过。向后兼容。
