---
"@magic-scope/react": minor
---

新增 Radio 单选组件(RadioGroup + Radio)

补齐表单控件缺口(此前有 Checkbox/Switch 无单选):

- **RadioGroup**:`role="radiogroup"`,context 下发 name / 选中值 / 尺寸 / 禁用,支持受控(`value`)与非受控(`defaultValue`),`onValueChange` 回调;`orientation` 映射 `aria-orientation`。
- **Radio**:基于原生 `input[type=radio]`,同名自动获得方向键导航与 roving tabindex;圆点控件 checked 染主色显内点,与 Checkbox 视觉语言一致。
- 设备适配开箱即用:触控热区(`--ms-target-min`)、hover 守卫(`@media (hover: hover)`)、`focus-visible` 发光环、`prefers-reduced-motion`;sm/md/lg 三档尺寸。
- 10 个功能测试覆盖单选语义、受控/非受控、name 共享、disabled、尺寸、独立使用。
