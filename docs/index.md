# magic-scope

可发布到 npm 的多框架 UI 组件库 + 自动化收录流水线。主题:**魔法**(深色奥术为默认预设)。

设计语言与地基蓝图见仓库 `DESIGN.md`,背景与路线图见 `FOUNDATION.md`。

库内已收录 **35** 个组件。下方为全部组件的静态预览(深色奥术主题)+ 参数(props)表。把鼠标移上去看**发光与过渡**,按 Tab 看**聚焦光环**。

> 想要**可交互**的实时演示——拖动参数旋钮实时改组件、一键切换主题 / 密度 / 动效 / 光影?运行 `pnpm play` 打开 playground 展示站。


## 操作 Actions

### Button

主操作按钮,三种视觉变体与三档尺寸,solid 带奥术发光。

<div class="ms-demo">
  <button class="ms-button ms-button--solid ms-button--lg">Solid 大</button>
  <button class="ms-button ms-button--solid ms-button--md">Solid</button>
  <button class="ms-button ms-button--outline ms-button--md">Outline</button>
  <button class="ms-button ms-button--ghost ms-button--md">Ghost</button>
  <button class="ms-button ms-button--solid ms-button--sm" disabled>Disabled</button>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` | 视觉变体:实底(带奥术发光)/ 描边 / 幽灵。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸。 |
| `...props` | `ComponentPropsWithoutRef<'button'>` | — | 透传原生 button 属性(onClick / type / disabled 等)。 |

## 表单 Forms

### Input

文本输入框,三档尺寸,带聚焦发光与校验失败态。

<div class="ms-demo" style="flex-direction: column; align-items: stretch">
  <input class="ms-input ms-input--md" placeholder="md 输入框" />
  <input class="ms-input ms-input--sm" placeholder="sm 输入框" />
  <input class="ms-input ms-input--md ms-input--invalid" placeholder="invalid 校验态" aria-invalid="true" />
  <input class="ms-input ms-input--md" placeholder="disabled" disabled />
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸。 |
| `invalid` | `boolean` | `false` | 校验失败态:染 danger 色并设 aria-invalid。 |
| `...props` | `Omit<ComponentPropsWithoutRef<'input'>, 'size'>` | — | 透传原生 input 属性(value / onChange / disabled / type 等)。 |

### Textarea

多行文本输入框,三档尺寸 + 校验失败态,透传原生 textarea。

<div class="ms-demo">
  <textarea class="ms-textarea ms-textarea--sm" placeholder="小尺寸 (sm)"></textarea>
  <textarea class="ms-textarea ms-textarea--md" placeholder="中尺寸 (md,默认)"></textarea>
  <textarea class="ms-textarea ms-textarea--lg" placeholder="大尺寸 (lg)"></textarea>
  <textarea class="ms-textarea ms-textarea--md ms-textarea--invalid" aria-invalid="true" placeholder="校验失败态 (invalid)"></textarea>
  <textarea class="ms-textarea ms-textarea--md" disabled placeholder="禁用态 (disabled)"></textarea>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸,影响 font-size 与 min-block-size。 |
| `invalid` | `boolean` | `false` | 校验失败态:染 danger 色并设置 aria-invalid。 |
| `...props` | `Omit<ComponentPropsWithoutRef<'textarea'>, 'size'>` | `—` | 透传原生 textarea 属性(value / onChange / rows / placeholder / disabled / maxLength 等)。 |

### Label

表单标签,基于原生 label;htmlFor 关联控件,required 时追加装饰星号。

<div class="ms-demo">
  <div style="display: flex; flex-direction: column; gap: var(--ms-space-6); max-inline-size: 20rem;">
    <div style="display: flex; flex-direction: column;">
      <label class="ms-label" for="demo-label-name">用户名</label>
      <input class="ms-input ms-input--md" id="demo-label-name" type="text" placeholder="输入用户名" />
    </div>
    <div style="display: flex; flex-direction: column;">
      <label class="ms-label ms-label--required" for="demo-label-email">邮箱<span class="ms-label__required" aria-hidden="true">*</span></label>
      <input class="ms-input ms-input--md" id="demo-label-email" type="email" placeholder="name@example.com" aria-required="true" />
    </div>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | 标签文字内容。 |
| `required` | `boolean` | `false` | 必填标记:文末追加 danger 色装饰星号(仅 aria-hidden,不承担必填语义)。 |
| `htmlFor` | `string` | — | 关联控件的 id;点击标签可聚焦对应控件。 |
| `...props` | `ComponentPropsWithoutRef<'label'>` | — | 透传原生 label 属性(htmlFor / onClick / className 等)。 |

### Checkbox

复选框,基于原生 input[type=checkbox],checked 染主色并以 ::after 画对勾。

<div class="ms-demo">
  <label class="ms-checkbox">
    <input type="checkbox" class="ms-checkbox__input" />
    <span class="ms-checkbox__box" aria-hidden="true"></span>
    <span class="ms-checkbox__label">未选中</span>
  </label>
  <label class="ms-checkbox">
    <input type="checkbox" class="ms-checkbox__input" checked />
    <span class="ms-checkbox__box" aria-hidden="true"></span>
    <span class="ms-checkbox__label">已选中</span>
  </label>
  <label class="ms-checkbox">
    <input type="checkbox" class="ms-checkbox__input" disabled />
    <span class="ms-checkbox__box" aria-hidden="true"></span>
    <span class="ms-checkbox__label">禁用未选</span>
  </label>
  <label class="ms-checkbox">
    <input type="checkbox" class="ms-checkbox__input" checked disabled />
    <span class="ms-checkbox__box" aria-hidden="true"></span>
    <span class="ms-checkbox__label">禁用已选</span>
  </label>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | 方块右侧的文字标签;省略则只渲染方块。 |
| `checked` | `boolean` | — | 受控勾选态(配合 onChange 使用)。 |
| `defaultChecked` | `boolean` | — | 非受控初始勾选态。 |
| `disabled` | `boolean` | `false` | 禁用:降透明度、禁止交互并变更光标。 |
| `...props` | `Omit<ComponentPropsWithoutRef<'input'>, 'type'>` | — | 透传原生 input 属性(onChange / name / value / required / aria-* 等),type 固定为 checkbox。 |

### Switch

开关,基于原生 input[type=checkbox],checked 时轨道染 primary、滑块右移并发光。

<div class="ms-demo">
  <label class="ms-switch">
    <input type="checkbox" class="ms-switch__input" />
    <span class="ms-switch__track"><span class="ms-switch__thumb"></span></span>
  </label>

  <label class="ms-switch">
    <input type="checkbox" class="ms-switch__input" checked />
    <span class="ms-switch__track"><span class="ms-switch__thumb"></span></span>
  </label>

  <label class="ms-switch">
    <input type="checkbox" class="ms-switch__input" disabled />
    <span class="ms-switch__track"><span class="ms-switch__thumb"></span></span>
  </label>

  <label class="ms-switch">
    <input type="checkbox" class="ms-switch__input" checked disabled />
    <span class="ms-switch__track"><span class="ms-switch__thumb"></span></span>
  </label>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `checked` | `boolean` | `—` | 受控:当前是否开启。提供时需配合 onChange。 |
| `defaultChecked` | `boolean` | `false` | 非受控:初始是否开启。 |
| `onChange` | `(e: ChangeEvent<HTMLInputElement>) => void` | `—` | 状态变化回调,从 e.target.checked 取新值。 |
| `disabled` | `boolean` | `false` | 禁用开关。 |
| `...props` | `Omit<ComponentPropsWithoutRef<'input'>, 'type'>` | `—` | 透传原生 checkbox 属性(name / value / required / aria-* 等)。 |

### Radio

单选组,基于原生 input[type=radio],方向键导航与 roving tabindex 开箱即用。

<div class="ms-demo">
  <div class="ms-radio-group ms-radio-group--vertical" role="radiogroup" aria-label="套餐(纵向)">
    <label class="ms-radio">
      <input type="radio" name="demo-plan" value="free" class="ms-radio__input" checked />
      <span class="ms-radio__control" aria-hidden="true"></span>
      <span class="ms-radio__label">Free</span>
    </label>
    <label class="ms-radio">
      <input type="radio" name="demo-plan" value="pro" class="ms-radio__input" />
      <span class="ms-radio__control" aria-hidden="true"></span>
      <span class="ms-radio__label">Pro</span>
    </label>
    <label class="ms-radio">
      <input type="radio" name="demo-plan" value="ent" class="ms-radio__input" disabled />
      <span class="ms-radio__control" aria-hidden="true"></span>
      <span class="ms-radio__label">Enterprise(禁用)</span>
    </label>
  </div>

  <div class="ms-radio-group ms-radio-group--horizontal" role="radiogroup" aria-label="尺码(横向 + 尺寸档)">
    <label class="ms-radio ms-radio--sm">
      <input type="radio" name="demo-size" value="s" class="ms-radio__input" />
      <span class="ms-radio__control" aria-hidden="true"></span>
      <span class="ms-radio__label">小(sm)</span>
    </label>
    <label class="ms-radio">
      <input type="radio" name="demo-size" value="m" class="ms-radio__input" checked />
      <span class="ms-radio__control" aria-hidden="true"></span>
      <span class="ms-radio__label">中(md)</span>
    </label>
    <label class="ms-radio ms-radio--lg">
      <input type="radio" name="demo-size" value="l" class="ms-radio__input" />
      <span class="ms-radio__control" aria-hidden="true"></span>
      <span class="ms-radio__label">大(lg)</span>
    </label>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | RadioGroup:受控选中值。 |
| `defaultValue` | `string` | — | RadioGroup:非受控初始选中值。 |
| `onValueChange` | `(value: string) => void` | — | RadioGroup:选中变化回调,入参为被选中项的 value。 |
| `name` | `string` | 自动生成 | RadioGroup:同组 radio 的 name,省略时自动生成以保证「同名即单选」。 |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | RadioGroup:排布方向,同时映射到 aria-orientation。 |
| `disabled` | `boolean` | `false` | RadioGroup:整组禁用;Radio:可单独禁用某一项。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | RadioGroup / Radio:尺寸,Radio 缺省继承所在 RadioGroup。 |
| `value`(Radio) | `string` | — | Radio:该选项的值,在 RadioGroup 内唯一(必填)。 |
| `children`(Radio) | `ReactNode` | — | Radio:选项右侧的文字标签内容。 |
| `...props` | `ComponentPropsWithoutRef<'input'>` | — | Radio:透传原生 radio 属性(aria-* / data-* 等)。 |

### Select

下拉选择,Popover API + CSS Anchor Positioning,键盘可达。

浮层进 top-layer 用 Popover API(`popover="auto"` 自带点外 / Esc 关闭),定位用 CSS Anchor Positioning。下面是 trigger 与展开 listbox 的静态外观示意(真实弹出、定位与键盘交互见 playground 展示站)。

<div class="ms-demo" style="gap: var(--ms-space-6); align-items: flex-start;">
  <button type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-label="主题选择" class="ms-select ms-select--md" style="inline-size: 14rem;">
    <span class="ms-select__value">Frost 青</span>
    <span class="ms-select__arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </span>
  </button>

  <div class="ms-select__list ms-select__list--md" data-open="" role="listbox" aria-label="主题选择" style="position: static; transform: none; opacity: 1; inline-size: 14rem; min-inline-size: 14rem;">
    <div role="option" class="ms-select__option" aria-selected="false">
      <span class="ms-select__check" aria-hidden="true"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
      <span class="ms-select__label">Arcane 紫</span>
    </div>
    <div role="option" class="ms-select__option ms-select__option--selected" aria-selected="true" data-active="">
      <span class="ms-select__check" aria-hidden="true"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
      <span class="ms-select__label">Frost 青</span>
    </div>
    <div role="option" class="ms-select__option" aria-selected="false">
      <span class="ms-select__check" aria-hidden="true"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
      <span class="ms-select__label">Ember 品红</span>
    </div>
    <div role="option" class="ms-select__option ms-select__option--disabled" aria-selected="false" aria-disabled="true">
      <span class="ms-select__check" aria-hidden="true"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
      <span class="ms-select__label">Void 玄(禁用)</span>
    </div>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | `—` | 当前选中值(受控)。 |
| `onChange` | `(value: string) => void` | `—` | 选中变化回调。 |
| `options` | `SelectOption[]` | `—` | 选项列表:{ value, label, disabled? }。 |
| `placeholder` | `string` | `'请选择…'` | 未选中时占位文本。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸。 |
| `disabled` | `boolean` | `false` | 禁用整个选择器。 |
| `aria-label` | `string` | `—` | trigger 无障碍名称(无可见 label 时建议提供)。 |

### Slider

滑块,基于原生 input[type=range],自绘轨道 / 填充 / 发光滑块。

<div class="ms-demo" style="flex-direction: column; align-items: stretch; gap: var(--ms-space-5); max-inline-size: 22rem;">
  <span class="ms-slider ms-slider--sm" style="--ms-slider-pct: 25%;">
    <input type="range" class="ms-slider__input" min="0" max="100" value="25" aria-label="sm 滑块" />
  </span>
  <span class="ms-slider" style="--ms-slider-pct: 60%;">
    <input type="range" class="ms-slider__input" min="0" max="100" value="60" aria-label="md 滑块" />
    <output class="ms-slider__value">60</output>
  </span>
  <span class="ms-slider ms-slider--lg" style="--ms-slider-pct: 80%;">
    <input type="range" class="ms-slider__input" min="0" max="100" value="80" aria-label="lg 滑块" />
  </span>
  <span class="ms-slider" style="--ms-slider-pct: 40%;">
    <input type="range" class="ms-slider__input" min="0" max="100" value="40" aria-label="禁用滑块" disabled />
  </span>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | `—` | 受控值。 |
| `defaultValue` | `number` | `min` | 非受控初始值。 |
| `onValueChange` | `(value: number) => void` | `—` | 值变化回调(拖动 / 键盘)。 |
| `min` | `number` | `0` | 最小值。 |
| `max` | `number` | `100` | 最大值。 |
| `step` | `number` | `1` | 步长。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸。 |
| `showValue` | `boolean` | `false` | 在末尾渲染当前值(role=status 的 output)。 |
| `formatValue` | `(value: number) => ReactNode` | `—` | 自定义值展示;仅 showValue 时生效。 |

### NumberInput

数字步进输入,− / ＋ 按钮配原生 spinbutton,支持 min/max/step 与三档尺寸。

<div class="ms-demo">
  <div class="ms-number-input ms-number-input--sm">
    <button type="button" class="ms-number-input__step ms-number-input__step--dec" aria-label="减少" tabindex="-1"><span aria-hidden="true">−</span></button>
    <input type="number" class="ms-number-input__field" value="2" aria-label="数量 sm" />
    <button type="button" class="ms-number-input__step ms-number-input__step--inc" aria-label="增加" tabindex="-1"><span aria-hidden="true">+</span></button>
  </div>
  <div class="ms-number-input">
    <button type="button" class="ms-number-input__step ms-number-input__step--dec" aria-label="减少" tabindex="-1"><span aria-hidden="true">−</span></button>
    <input type="number" class="ms-number-input__field" value="8" aria-label="数量 md" />
    <button type="button" class="ms-number-input__step ms-number-input__step--inc" aria-label="增加" tabindex="-1"><span aria-hidden="true">+</span></button>
  </div>
  <div class="ms-number-input ms-number-input--lg">
    <button type="button" class="ms-number-input__step ms-number-input__step--dec" aria-label="减少" tabindex="-1"><span aria-hidden="true">−</span></button>
    <input type="number" class="ms-number-input__field" value="20" aria-label="数量 lg" />
    <button type="button" class="ms-number-input__step ms-number-input__step--inc" aria-label="增加" tabindex="-1"><span aria-hidden="true">+</span></button>
  </div>
  <div class="ms-number-input ms-number-input--disabled">
    <button type="button" class="ms-number-input__step ms-number-input__step--dec" aria-label="减少" tabindex="-1" disabled><span aria-hidden="true">−</span></button>
    <input type="number" class="ms-number-input__field" value="5" aria-label="禁用" disabled />
    <button type="button" class="ms-number-input__step ms-number-input__step--inc" aria-label="增加" tabindex="-1" disabled><span aria-hidden="true">+</span></button>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | — | 受控值。 |
| `defaultValue` | `number` | — | 非受控初始值。 |
| `onValueChange` | `(value: number \| null) => void` | — | 值变化回调:有效数字时传 number,清空时传 null。 |
| `min` | `number` | `-Infinity` | 最小值(不限时为 -Infinity);步进与失焦时夹取。 |
| `max` | `number` | `Infinity` | 最大值(不限时为 Infinity);步进与失焦时夹取。 |
| `step` | `number` | `1` | 步进步长(步进按钮与方向键)。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸。 |
| `...props` | `Omit<ComponentPropsWithoutRef<'input'>, 'type' \| 'value' \| 'defaultValue' \| 'onChange' \| 'size'>` | — | 透传原生 input 属性(disabled / aria-label / name 等)。 |

## 数据展示 Data Display

### Badge

小标签,用于状态、计数或分类标记。

<div class="ms-demo">
  <span class="ms-badge ms-badge--soft ms-badge--primary">Primary</span>
  <span class="ms-badge ms-badge--soft ms-badge--accent">Accent</span>
  <span class="ms-badge ms-badge--soft ms-badge--success">Success</span>
  <span class="ms-badge ms-badge--soft ms-badge--warning">Warning</span>
  <span class="ms-badge ms-badge--soft ms-badge--danger">Danger</span>
  <span class="ms-badge ms-badge--soft ms-badge--neutral">Neutral</span>

  <span class="ms-badge ms-badge--solid ms-badge--primary">Primary</span>
  <span class="ms-badge ms-badge--solid ms-badge--accent">Accent</span>
  <span class="ms-badge ms-badge--solid ms-badge--success">Success</span>
  <span class="ms-badge ms-badge--solid ms-badge--warning">Warning</span>
  <span class="ms-badge ms-badge--solid ms-badge--danger">Danger</span>
  <span class="ms-badge ms-badge--solid ms-badge--neutral">Neutral</span>

  <span class="ms-badge ms-badge--outline ms-badge--primary">Primary</span>
  <span class="ms-badge ms-badge--outline ms-badge--accent">Accent</span>
  <span class="ms-badge ms-badge--outline ms-badge--success">Success</span>
  <span class="ms-badge ms-badge--outline ms-badge--warning">Warning</span>
  <span class="ms-badge ms-badge--outline ms-badge--danger">Danger</span>
  <span class="ms-badge ms-badge--outline ms-badge--neutral">Neutral</span>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'soft' \| 'outline'` | `'soft'` | 视觉变体:实底 / 柔和底 / 描边。 |
| `tone` | `'primary' \| 'accent' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | `'primary'` | 语义色调。neutral 走中性的 fg-muted / border。 |
| `...props` | `ComponentPropsWithoutRef<'span'>` | — | 透传原生 span 属性。 |

### Tag

语义色标签,六档 tone 柔和底色,可选关闭按钮用于分类、过滤与可移除项。

<div class="ms-demo">
  <span class="ms-tag ms-tag--primary"><span class="ms-tag__label">Primary</span></span>
  <span class="ms-tag ms-tag--accent"><span class="ms-tag__label">Accent</span></span>
  <span class="ms-tag ms-tag--success"><span class="ms-tag__label">Success</span></span>
  <span class="ms-tag ms-tag--warning"><span class="ms-tag__label">Warning</span></span>
  <span class="ms-tag ms-tag--danger"><span class="ms-tag__label">Danger</span></span>
  <span class="ms-tag ms-tag--neutral"><span class="ms-tag__label">Neutral</span></span>

  <span class="ms-tag ms-tag--primary ms-tag--closable">
    <span class="ms-tag__label">可关闭</span>
    <button type="button" class="ms-tag__close" aria-label="移除"><span aria-hidden="true">×</span></button>
  </span>
  <span class="ms-tag ms-tag--success ms-tag--closable">
    <span class="ms-tag__label">奥术</span>
    <button type="button" class="ms-tag__close" aria-label="移除"><span aria-hidden="true">×</span></button>
  </span>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tone` | `'primary' \| 'accent' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | `'neutral'` | 语义色调:主色 / 强调 / 成功 / 警告 / 危险 / 中性,决定柔和底与文字颜色。 |
| `closable` | `boolean` | `false` | 是否在末尾渲染移除按钮。 |
| `onRemove` | `() => void` | — | 点击移除按钮时触发(移除由上层 state 控制)。 |
| `children` | `ReactNode` | — | 标签文本内容。 |
| `...props` | `ComponentPropsWithoutRef<'span'>` | — | 透传原生 span 属性(className / onClick / title 等)。 |

### Avatar

头像,展示用户图片或姓名首字母占位,两种形状与三档尺寸。

<div class="ms-demo">
  <div style="display: flex; align-items: center; gap: var(--ms-space-4); flex-wrap: wrap;">
    <span class="ms-avatar ms-avatar--sm ms-avatar--circle">
      <img class="ms-avatar__img" src="https://i.pravatar.cc/96?img=12" alt="Lyra Vex" />
    </span>
    <span class="ms-avatar ms-avatar--md ms-avatar--circle">
      <img class="ms-avatar__img" src="https://i.pravatar.cc/96?img=32" alt="Orin Sael" />
    </span>
    <span class="ms-avatar ms-avatar--lg ms-avatar--circle">
      <img class="ms-avatar__img" src="https://i.pravatar.cc/96?img=5" alt="Mira Dawnshard" />
    </span>
    <span class="ms-avatar ms-avatar--md ms-avatar--circle ms-avatar--fallback" role="img" aria-label="Lyra Vex">
      <span class="ms-avatar__initials" aria-hidden="true">LV</span>
    </span>
    <span class="ms-avatar ms-avatar--lg ms-avatar--square ms-avatar--fallback" role="img" aria-label="Orin Sael">
      <span class="ms-avatar__initials" aria-hidden="true">OS</span>
    </span>
    <span class="ms-avatar ms-avatar--md ms-avatar--square">
      <img class="ms-avatar__img" src="https://i.pravatar.cc/96?img=47" alt="Kael Brightmoor" />
    </span>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸。 |
| `shape` | `'circle' \| 'square'` | `'circle'` | 形状:圆形(radius-full)/ 方形(radius-md)。 |
| `src` | `string` | — | 头像图片地址。提供时渲染 &lt;img>,object-fit:cover 填充。 |
| `name` | `string` | — | 用户名。无 src 时取首字母(大写、最多 2 字)作占位;同时用作无障碍标签 aria-label。 |
| `...props` | `ComponentPropsWithoutRef<'span'>` | — | 透传原生 span 属性(className / style / title 等)。 |

### Kbd

键盘按键样式,展示快捷键如 ⌘K、Ctrl + C,键帽立体感。

<div class="ms-demo">
  <kbd class="ms-kbd ms-kbd--md">⌘</kbd>
  <kbd class="ms-kbd ms-kbd--md">K</kbd>
  <span style="color:var(--ms-color-fg-muted);margin-inline:var(--ms-space-2);">打开命令面板</span>

  <span style="display:inline-flex;align-items:center;gap:var(--ms-space-1);">
    <kbd class="ms-kbd ms-kbd--md">Ctrl</kbd>
    <span style="color:var(--ms-color-fg-subtle);">+</span>
    <kbd class="ms-kbd ms-kbd--md">Shift</kbd>
    <span style="color:var(--ms-color-fg-subtle);">+</span>
    <kbd class="ms-kbd ms-kbd--md">P</kbd>
  </span>

  <span style="display:inline-flex;align-items:center;gap:var(--ms-space-1);margin-inline-start:var(--ms-space-4);">
    <kbd class="ms-kbd ms-kbd--sm">Esc</kbd>
    <span style="color:var(--ms-color-fg-muted);">取消(sm)</span>
  </span>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md'` | `'md'` | 尺寸:sm 紧凑 / md 默认。 |
| `children` | `ReactNode` | — | 按键内容,如 ⌘、Ctrl、Enter。 |
| `...props` | `ComponentPropsWithoutRef<'kbd'>` | — | 透传原生 kbd 属性(className / title / aria-* 等)。 |

### Table

基础数据表格,语义化 &lt;table> + 列定义/行数据驱动,可选斑马纹与行 hover 高亮。

<div class="ms-demo">
  <div class="ms-table-wrap ms-table-wrap--stripe ms-table-wrap--hoverable" style="max-inline-size: 32rem;">
    <table class="ms-table">
      <caption class="ms-table__caption">奥术法术清单</caption>
      <thead class="ms-table__head">
        <tr class="ms-table__row">
          <th scope="col" class="ms-table__th">法术</th>
          <th scope="col" class="ms-table__th">学派</th>
          <th scope="col" class="ms-table__th ms-table__th--center">法力</th>
          <th scope="col" class="ms-table__th ms-table__th--end">威力</th>
        </tr>
      </thead>
      <tbody class="ms-table__body">
        <tr class="ms-table__row">
          <td class="ms-table__td">奥术飞弹</td>
          <td class="ms-table__td">塑能</td>
          <td class="ms-table__td ms-table__td--center">1</td>
          <td class="ms-table__td ms-table__td--end">★★☆</td>
        </tr>
        <tr class="ms-table__row">
          <td class="ms-table__td">冰霜新星</td>
          <td class="ms-table__td">冰霜</td>
          <td class="ms-table__td ms-table__td--center">3</td>
          <td class="ms-table__td ms-table__td--end">★★★</td>
        </tr>
        <tr class="ms-table__row">
          <td class="ms-table__td">法术反制</td>
          <td class="ms-table__td">防护</td>
          <td class="ms-table__td ms-table__td--center">2</td>
          <td class="ms-table__td ms-table__td--end">★★☆</td>
        </tr>
        <tr class="ms-table__row">
          <td class="ms-table__td">虚空爆裂</td>
          <td class="ms-table__td">暗影</td>
          <td class="ms-table__td ms-table__td--center">5</td>
          <td class="ms-table__td ms-table__td--end">★★★</td>
        </tr>
        <tr class="ms-table__row">
          <td class="ms-table__td">相位闪现</td>
          <td class="ms-table__td">幻象</td>
          <td class="ms-table__td ms-table__td--center">2</td>
          <td class="ms-table__td ms-table__td--end">★☆☆</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columns` | `TableColumn[]` | `—` | 列定义:{ key, header, align? },key 同时用于取值与 React key。 |
| `data` | `Array<Record<string, ReactNode>>` | `—` | 行数据数组,每行是 字段键 -> 单元格内容 的映射。 |
| `stripe` | `boolean` | `false` | 斑马纹:为偶数行加极淡底色。 |
| `hoverable` | `boolean` | `false` | 行 hover 高亮:悬停整行换 surface-raised 底。 |
| `getRowKey` | `(row: Record<string, ReactNode>, index: number) => string \| number` | `索引` | 自定义行 key 派生,默认用行索引,返回值需在表内唯一。 |
| `caption` | `ReactNode` | `—` | 外框 caption(无障碍标题),设置后渲染 &lt;caption>。 |
| `className` | `string` | `—` | 透传给外层包裹 &lt;div> 的 className。 |
| `TableColumn.key` | `string` | `—` | TableColumn:字段键,从行对象取值并作为 React key。 |
| `TableColumn.header` | `ReactNode` | `—` | TableColumn:表头内容。 |
| `TableColumn.align` | `'start' \| 'end' \| 'center'` | `'start'` | TableColumn:列对齐,表头与单元格一致。 |

### Timeline

时间线 / 信息流,语义化 &lt;ol>,竖向轴 + 节点圆点 + 连线,节点可换图标按变体着色。

<div class="ms-demo">
  <ol class="ms-timeline" style="max-inline-size: 26rem;">
    <li class="ms-timeline__item ms-timeline__item--success">
      <div class="ms-timeline__node" aria-hidden="true"><span class="ms-timeline__dot"></span></div>
      <div class="ms-timeline__content">
        <div class="ms-timeline__header"><span class="ms-timeline__title">部署上线</span><time class="ms-timeline__time">10:00</time></div>
        <div class="ms-timeline__body">已发布到生产环境,健康检查通过。</div>
      </div>
    </li>
    <li class="ms-timeline__item ms-timeline__item--primary">
      <div class="ms-timeline__node" aria-hidden="true"><span class="ms-timeline__dot"></span></div>
      <div class="ms-timeline__content">
        <div class="ms-timeline__header"><span class="ms-timeline__title">合并 PR #128</span><time class="ms-timeline__time">09:42</time></div>
        <div class="ms-timeline__body">设备适配 P1:浮层抽屉 + Table 卡片化。</div>
      </div>
    </li>
    <li class="ms-timeline__item ms-timeline__item--warning">
      <div class="ms-timeline__node" aria-hidden="true"><span class="ms-timeline__icon">!</span></div>
      <div class="ms-timeline__content">
        <div class="ms-timeline__header"><span class="ms-timeline__title">CI 重试一次</span><time class="ms-timeline__time">09:30</time></div>
        <div class="ms-timeline__body">flaky 测试触发重跑,第二次通过。</div>
      </div>
    </li>
    <li class="ms-timeline__item">
      <div class="ms-timeline__node" aria-hidden="true"><span class="ms-timeline__dot"></span></div>
      <div class="ms-timeline__content">
        <div class="ms-timeline__header"><span class="ms-timeline__title">提交代码</span><time class="ms-timeline__time">09:12</time></div>
        <div class="ms-timeline__body">默认变体(中性节点)。</div>
      </div>
    </li>
  </ol>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Timeline:若干 TimelineItem 子节点。 |
| `...props` | `ComponentPropsWithoutRef<'ol'>` | — | Timeline:透传原生 ol 属性(className / style 等)。 |
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | TimelineItem:节点圆点的语义色。 |
| `icon` | `ReactNode` | — | TimelineItem:自定义节点内容(图标等),替代默认圆点。 |
| `time` | `ReactNode` | — | TimelineItem:次级元信息(时间 / 日期),渲染为 &lt;time>。 |
| `title` | `ReactNode` | — | TimelineItem:条目标题。 |
| `children` | `ReactNode` | — | TimelineItem:条目正文内容。 |
| `...props` | `Omit<ComponentPropsWithoutRef<'li'>, 'title'>` | — | TimelineItem:透传原生 li 属性(className / style 等)。 |

## 反馈 Feedback

### Alert

语义提示框,四种变体(信息 / 成功 / 警告 / 危险),起始边强调条 + 柔和底色。

<div class="ms-demo">
  <div class="ms-alert ms-alert--info" role="alert">
    这是一条信息提示,用于传达中性的背景说明。
  </div>
  <div class="ms-alert ms-alert--success" role="alert">
    操作成功:你的改动已保存。
  </div>
  <div class="ms-alert ms-alert--warning" role="alert">
    注意:当前为只读模式,部分操作将被禁用。
  </div>
  <div class="ms-alert ms-alert--danger" role="alert">
    出错了:无法连接到服务器,请稍后重试。
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | 语义变体:信息 / 成功 / 警告 / 危险,决定底色与强调条颜色。 |
| `children` | `ReactNode` | — | 提示内容,可放标题、正文或任意节点。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / id 等);role 固定为 'alert'。 |

### Progress

进度条,确定态按 value 驱动填充宽度,不确定态填充段左右往返流动。

<div class="ms-demo" style="display: flex; flex-direction: column; gap: var(--ms-space-6); inline-size: 320px;">
  <div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="35" class="ms-progress">
    <div class="ms-progress__fill" style="inline-size: 35%;"></div>
  </div>
  <div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="70" class="ms-progress">
    <div class="ms-progress__fill" style="inline-size: 70%;"></div>
  </div>
  <div role="progressbar" aria-valuemin="0" aria-valuemax="100" class="ms-progress ms-progress--indeterminate">
    <div class="ms-progress__fill"></div>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | `—` | 进度值 0-100,自动夹取;确定态下驱动填充宽度并设为 aria-valuenow。省略即不确定态。 |
| `indeterminate` | `boolean` | `false` | 不确定态:不知道具体进度,填充段左右往返流动。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | `—` | 透传原生 div 属性(className / style / aria-label 等)。 |

### Spinner

加载旋转器,持续旋转的奥术发光圆环,三档尺寸,尊重 reduced-motion。

<div class="ms-demo">
  <span class="ms-spinner ms-spinner--sm" role="status" aria-label="加载中"></span>
  <span class="ms-spinner ms-spinner--md" role="status" aria-label="加载中"></span>
  <span class="ms-spinner ms-spinner--lg" role="status" aria-label="加载中"></span>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸,同时决定圆环直径与边宽。 |
| `label` | `string` | `'加载中'` | 无障碍文案,通过 aria-label 供读屏播报。 |
| `...props` | `ComponentPropsWithoutRef<'span'>` | — | 透传原生 span 属性(className / style / id 等)。 |

### Skeleton

加载占位,三种形状(文本行 / 矩形 / 圆形),底色叠一道奥术流光。

<div class="ms-demo" style="flex-direction: column; align-items: stretch; gap: var(--ms-space-3)">
  <div style="display: flex; align-items: center; gap: var(--ms-space-3)">
    <div class="ms-skeleton ms-skeleton--circle"></div>
    <div style="flex: 1; display: flex; flex-direction: column; gap: var(--ms-space-2)">
      <div class="ms-skeleton ms-skeleton--text" style="inline-size: 40%"></div>
      <div class="ms-skeleton ms-skeleton--text" style="inline-size: 70%"></div>
    </div>
  </div>
  <div class="ms-skeleton ms-skeleton--rect" style="block-size: 6rem"></div>
  <div class="ms-skeleton ms-skeleton--text"></div>
  <div class="ms-skeleton ms-skeleton--text" style="inline-size: 80%"></div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'text' \| 'rect' \| 'circle'` | `'rect'` | 占位形状:text 为文本行(较矮 + 小圆角)/ rect 为矩形 / circle 为等宽高圆形。 |
| `style` | `CSSProperties` | — | 用于指定宽高;circle 取 width/height 较小者成圆。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / id / data-* 等);组件已内置 aria-hidden。 |

### Toast

命令式轻提示,无需 Provider,任意处调用 toast() 即可弹出。

<div class="ms-demo" style="flex-direction: column; align-items: stretch; gap: var(--ms-space-3); max-inline-size: 24rem;">
  <div class="ms-toast ms-toast--default" role="status">
    <div class="ms-toast__content">
      <p class="ms-toast__message">已保存 ✦</p>
    </div>
    <button type="button" class="ms-toast__close" aria-label="关闭"><span aria-hidden="true">×</span></button>
  </div>
  <div class="ms-toast ms-toast--success" role="status">
    <div class="ms-toast__content">
      <p class="ms-toast__message">操作成功</p>
      <p class="ms-toast__description">你的改动已同步到云端。</p>
    </div>
    <button type="button" class="ms-toast__close" aria-label="关闭"><span aria-hidden="true">×</span></button>
  </div>
  <div class="ms-toast ms-toast--danger" role="alert">
    <div class="ms-toast__content">
      <p class="ms-toast__message">出错了</p>
      <p class="ms-toast__description">无法连接服务器,请稍后重试。</p>
    </div>
    <button type="button" class="ms-toast__action">重试</button>
    <button type="button" class="ms-toast__close" aria-label="关闭"><span aria-hidden="true">×</span></button>
  </div>
  <div class="ms-toast ms-toast--warning" role="alert">
    <div class="ms-toast__content">
      <p class="ms-toast__message">已删除 1 项</p>
    </div>
    <button type="button" class="ms-toast__action">撤销</button>
    <button type="button" class="ms-toast__close" aria-label="关闭"><span aria-hidden="true">×</span></button>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `toast(message, options?)` | `(message: ReactNode, options?: ToastOptions) => string` | `—` | 弹出 default 变体提示,返回 toast id。 |
| `toast.success / warning / info` | `(message: ReactNode, options?: Omit<ToastOptions, "variant">) => string` | `—` | 对应语义变体的快捷方法(success / warning / info)。 |
| `toast.error` | `(message: ReactNode, options?: Omit<ToastOptions, "variant">) => string` | `—` | 弹出 danger 变体(错误)提示的快捷方法。 |
| `toast.dismiss` | `(id: string) => void` | `—` | 按 id 主动关闭某条提示(走退场动画)。 |
| `options.id` | `string` | `自动生成` | ToastOptions:指定 id,重复 id 会替换并重置寿命(用于「上传中→完成」更新)。 |
| `options.variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | ToastOptions:语义变体(快捷方法已内置,直接 toast() 时可显式指定)。 |
| `options.duration` | `number` | `4000` | ToastOptions:自动消失时长(ms);0 或 Infinity 表示常驻,需手动关闭。 |
| `options.description` | `ReactNode` | `—` | ToastOptions:次级描述文字,显示在主消息下方。 |
| `options.action` | `{ label: ReactNode; onClick: () => void }` | `—` | ToastOptions:行动按钮,点击后执行回调并关闭该提示。 |
| `Toaster.position` | `'top-start' \| 'top-center' \| 'top-end' \| 'bottom-start' \| 'bottom-center' \| 'bottom-end'` | `'bottom-end'` | Toaster 容器:弹出堆叠位置。 |
| `Toaster.label` | `string` | `'通知'` | Toaster 容器:通知区域的可访问标签(aria-label)。 |

## 浮层 Overlay

### Dialog

模态对话框,基于原生 &lt;dialog> + showModal(),自带焦点陷阱与 top-layer。

下面是对话框面板的静态外观示意(真实弹出、遮罩与入场动画见 playground 展示站)。

<div class="ms-demo">
  <div class="ms-dialog__panel" style="max-inline-size: 28rem;">
    <button type="button" class="ms-dialog__close" aria-label="关闭">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
    <h3 style="margin-block-start: 0;">奥术对话框</h3>
    <p style="color: var(--ms-color-fg-muted);">原生 &lt;dialog&gt; + showModal():焦点陷阱、Esc、::backdrop 遮罩、入场动画。点遮罩可关闭。</p>
    <button type="button" class="ms-button ms-button--solid ms-button--md">知道了</button>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | — | 是否打开(受控,必填)。 |
| `onClose` | `() => void` | — | 关闭回调(Esc / 点遮罩 / 关闭按钮)。 |
| `dismissable` | `boolean` | `true` | 点击遮罩是否关闭。 |
| `children` | `ReactNode` | — | 对话框内容。 |

### Drawer

侧边抽屉,基于原生 &lt;dialog> + showModal(),支持四向滑入与焦点陷阱。

浮层组件:开合无法静态展开,下面是抽屉面板表面的静态外观示意(从右 end 边滑入,真实弹出见 playground 展示站)。

<div class="ms-demo" style="gap: var(--ms-space-4); align-items: flex-start;">
  <div class="ms-drawer__panel" style="max-inline-size: 22rem; block-size: auto; border-inline-start: 1px solid var(--ms-color-border);">
    <header class="ms-drawer__header">
      <h2 class="ms-drawer__title">奥术抽屉</h2>
      <button type="button" class="ms-drawer__close" aria-label="关闭">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </header>
    <div class="ms-drawer__body">
      <p style="margin-block-start: 0; color: var(--ms-color-fg-muted);">从 <code>end</code> 边滑入的侧边抽屉:焦点陷阱、Esc 关闭、::backdrop 遮罩、top-layer,并锁背景滚动、避让安全区。</p>
      <button type="button" class="ms-button ms-button--solid ms-button--md">收起</button>
    </div>
  </div>
  <div class="ms-drawer__panel" style="max-inline-size: 22rem; block-size: auto; position: relative; border-inline-start: 1px solid var(--ms-color-border);">
    <button type="button" class="ms-drawer__close ms-drawer__close--floating" aria-label="关闭">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
    <div class="ms-drawer__body">
      <p style="margin-block-start: 0; color: var(--ms-color-fg-muted);">无标题时,右上角渲染一个浮动的关闭按钮(<code>ms-drawer__close--floating</code>)。</p>
    </div>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | — | 是否打开(受控,必填)。 |
| `onClose` | `() => void` | — | 关闭回调(Esc / 点遮罩 / 关闭按钮)。 |
| `side` | `'start' \| 'end' \| 'top' \| 'bottom'` | `'end'` | 滑入边:start(左)/ end(右)/ top(上)/ bottom(下)。 |
| `title` | `ReactNode` | — | 标题;设置后渲染头部并与抽屉 aria-labelledby 关联。 |
| `dismissable` | `boolean` | `true` | 点击遮罩是否关闭。 |
| `children` | `ReactNode` | — | 抽屉内容。 |
| `...props` | `ComponentPropsWithoutRef<'dialog'>` | — | 透传原生 dialog 属性(排除 open / title)。 |

### Popover

点击浮层,基于原生 Popover API + CSS Anchor Positioning,贴合触发器四向弹出。

浮层进 top-layer,无法静态展开开合,下面是浮层面板的静态外观示意(真实弹出见 playground 展示站)。

<div class="ms-demo" style="gap: var(--ms-space-4); align-items: flex-start;">
  <div class="ms-popover__panel" style="max-inline-size: 15rem;">
    <div style="display: grid; gap: var(--ms-space-2);">
      <strong style="font-size: 0.9rem;">奥术浮层</strong>
      <p style="margin: 0; color: var(--ms-color-fg-muted); font-size: 0.85rem;">进 top-layer 的原生 Popover API,点外 / Esc 自动关闭;定位走 CSS Anchor Positioning,贴着触发器弹出。</p>
      <button type="button" class="ms-button ms-button--solid ms-button--sm">知道了</button>
    </div>
  </div>
  <button type="button" class="ms-button ms-button--outline ms-button--md" aria-haspopup="dialog" aria-expanded="false">展开浮层 ✦</button>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `trigger` | `ReactElement` | — | 触发元素(单个 React 元素)。点击切换显隐;会被注入 anchor / aria 属性。 |
| `children` | `ReactNode` | — | 浮层内容。 |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | 浮层相对 trigger 的方位。 |
| `open` | `boolean` | — | 受控:是否打开。传入即进入受控模式;不传则组件内部自管显隐。 |
| `onOpenChange` | `(open: boolean) => void` | — | 显隐变化回调(受控 / 非受控均触发,含点外 / Esc 关闭)。 |
| `className` | `string` | — | 浮层附加 className。 |

### Tooltip

提示气泡,Popover API 进 top-layer + CSS Anchor 定位,hover / focus 触发,触屏 tap-to-toggle。

气泡进 top-layer 用 Popover API,定位用 CSS Anchor Positioning,无法静态展开开合;下面是气泡表面与 trigger 的静态外观示意(真实弹出见 playground 展示站)。

<div class="ms-demo" style="gap: var(--ms-space-6); align-items: center;">
  <button class="ms-button ms-button--outline ms-button--md">悬停 / 聚焦我</button>
  <div class="ms-tooltip ms-tooltip--top" role="tooltip" data-open style="position: static; opacity: 1; pointer-events: auto; transform: none;">✦ 奥术提示气泡(上方)</div>
  <div class="ms-tooltip ms-tooltip--bottom" role="tooltip" data-open style="position: static; opacity: 1; pointer-events: auto; transform: none;">出现在下方</div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | `ReactNode` | — | 提示气泡的内容(必填)。 |
| `children` | `ReactElement` | — | 单个触发元素,将被克隆以注入事件 / anchor / aria(必填)。 |
| `placement` | `'top' \| 'bottom'` | `'top'` | 气泡相对 trigger 的方位。 |
| `delay` | `number` | `150` | hover / focus 到显示的延时(毫秒)。 |
| `className` | `string` | — | 透传到气泡容器的额外 className。 |

### Menu

下拉菜单,Popover API + CSS Anchor Positioning,键盘可达,支持危险项。

真实弹出(点击展开 / 锚定位 / 键盘交互)见 playground 展示站,下面是浮层面板的静态外观示意。

<div class="ms-demo">
  <div class="ms-menu" role="menu" aria-orientation="vertical" style="position: static; inset: auto; opacity: 1; transform: none; min-inline-size: 12rem;">
    <button type="button" role="menuitem" class="ms-menu__item">重命名 ✎</button>
    <button type="button" role="menuitem" class="ms-menu__item">复制链接 ⧉</button>
    <button type="button" role="menuitem" class="ms-menu__item" disabled>归档 ⌂（禁用）</button>
    <button type="button" role="menuitem" class="ms-menu__item ms-menu__item--danger">删除 ✕</button>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `trigger` | `ReactElement` | — | 触发元素(通常是 Button)。点击展开菜单;会被注入 anchor-name 与无障碍属性。 |
| `items` | `MenuItem[]` | — | 菜单项列表:{ label, onSelect?, disabled?, danger? }。 |
| `className` | `string` | — | 外部类名(作用于浮层)。 |
| `MenuItem.label` | `string` | — | MenuItem:菜单项文本。 |
| `MenuItem.onSelect` | `() => void` | — | MenuItem:选中回调。点击 / Enter 触发后菜单关闭。 |
| `MenuItem.disabled` | `boolean` | `false` | MenuItem:是否禁用(不可聚焦、不触发)。 |
| `MenuItem.danger` | `boolean` | `false` | MenuItem:是否危险项(用 danger 色)。 |

### ContextMenu

右键菜单,在光标处弹出,越界自动夹回视口,portal 到 body,键盘可达。

命令式触发:在区域内右键(contextmenu)即在光标处弹出浮层 `.ms-context-menu`,点选 / 点外 / Esc / 滚动均关闭;菜单内支持 ↑↓ / Home / End / Enter 键盘导航。下面是浮层面板的静态外观示意(真实右键弹出与越界夹回见 playground 展示站)。

<div class="ms-demo">
  <div class="ms-context-menu" role="menu" aria-orientation="vertical" style="position: static; box-shadow: none; max-inline-size: 14rem;">
    <button type="button" role="menuitem" tabindex="-1" class="ms-menu__item">✦ 召唤法阵</button>
    <button type="button" role="menuitem" tabindex="-1" class="ms-menu__item">↻ 重铸符文</button>
    <button type="button" role="menuitem" tabindex="-1" class="ms-menu__item">⌖ 标记目标</button>
    <button type="button" role="menuitem" tabindex="-1" class="ms-menu__item" disabled>✕ 封印(已锁定)</button>
    <button type="button" role="menuitem" tabindex="-1" class="ms-menu__item ms-menu__item--danger">🜂 解离结界</button>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `MenuItem[]` | — | 菜单项列表:{ label, onSelect?, disabled?, danger? }(与 Menu 同结构)。 |
| `children` | `ReactNode` | — | 响应右键的区域内容。 |
| `className` | `string` | — | 菜单浮层附加类名。 |
| `MenuItem.label` | `string` | — | 菜单项文本。 |
| `MenuItem.onSelect` | `() => void` | — | 选中回调,点击 / Enter 触发后菜单关闭。 |
| `MenuItem.disabled` | `boolean` | `false` | 是否禁用(不可聚焦、不触发)。 |
| `MenuItem.danger` | `boolean` | `false` | 是否危险项(用 danger 色)。 |

### AlertDialog(confirm / alert)

命令式调用:`await confirm('确定删除?', { variant: 'danger' })` 返回 `Promise<boolean>`,`alert('提示')` 返回 `Promise<void>`,在应用根挂一个 `<AlertDialogHost />`。下面是面板的静态外观示意(真实弹出见 playground)。

<div class="ms-demo" style="gap: var(--ms-space-4); align-items: flex-start;">
  <div class="ms-alert-dialog__panel" style="max-inline-size: 22rem;">
    <h2 class="ms-alert-dialog__title">保存更改?</h2>
    <div class="ms-alert-dialog__message">你有未保存的更改,离开前是否保存?</div>
    <div class="ms-alert-dialog__actions">
      <button type="button" class="ms-button ms-button--ghost ms-button--md">取消</button>
      <button type="button" class="ms-button ms-button--solid ms-button--md ms-alert-dialog__confirm">保存</button>
    </div>
  </div>
  <div class="ms-alert-dialog__panel ms-alert-dialog__panel--danger" style="max-inline-size: 22rem;">
    <h2 class="ms-alert-dialog__title">删除该项?</h2>
    <div class="ms-alert-dialog__message">此操作不可撤销,确定删除吗?</div>
    <div class="ms-alert-dialog__actions">
      <button type="button" class="ms-button ms-button--ghost ms-button--md">再想想</button>
      <button type="button" class="ms-button ms-button--solid ms-button--md ms-alert-dialog__confirm">删除</button>
    </div>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `confirm(message, options?)` | `(message: ReactNode, options?: ConfirmOptions) => Promise<boolean>` | `—` | 确认弹窗。确认返回 true；取消 / Esc / 点遮罩返回 false。 |
| `alert(message, options?)` | `(message: ReactNode, options?: AlertOptions) => Promise<void>` | `—` | 提示弹窗（仅一个确认按钮）。确认 / Esc / 点遮罩后 resolve。 |
| `prompt(message, options?)` | `(message: ReactNode, options?: PromptOptions) => Promise<string \| null>` | `—` | 输入弹窗。确认返回输入值；取消 / Esc / 点遮罩返回 null。 |
| `AlertDialogHost` | `() => ReactNode` | `—` | 渲染容器，需在应用根渲染一次；订阅模块级队列，无需 Provider。 |
| `ConfirmOptions.title` | `ReactNode` | `—` | confirm：标题（可选）。 |
| `ConfirmOptions.confirmText` | `ReactNode` | `'确定'` | confirm：确认按钮文案。 |
| `ConfirmOptions.cancelText` | `ReactNode` | `'取消'` | confirm：取消按钮文案。 |
| `ConfirmOptions.variant` | `'default' \| 'danger'` | `'default'` | confirm：danger 时确认按钮染危险色、默认焦点落在取消。 |
| `AlertOptions.title` | `ReactNode` | `—` | alert：标题（可选）。 |
| `AlertOptions.confirmText` | `ReactNode` | `'确定'` | alert：确认按钮文案。 |
| `PromptOptions.title` | `ReactNode` | `—` | prompt：标题（可选）。 |
| `PromptOptions.confirmText` | `ReactNode` | `'确定'` | prompt：确认按钮文案。 |
| `PromptOptions.cancelText` | `ReactNode` | `'取消'` | prompt：取消按钮文案。 |
| `PromptOptions.placeholder` | `string` | `—` | prompt：输入框占位符。 |
| `PromptOptions.defaultValue` | `string` | `—` | prompt：输入框初始值。 |

### Popconfirm

锚定在元素旁的轻量确认气泡,内建确认 / 取消按钮流,常用于内联删除确认。

气泡通过原生 Popover API 锚定在 trigger 旁弹出,静态文档无法展开开合。下面是气泡表面的静态外观示意(默认与 danger 变体,真实弹出见 playground 展示站)。

<div class="ms-demo" style="gap: var(--ms-space-4); align-items: flex-start;">
  <div class="ms-popover">
    <div class="ms-popconfirm__body">
      <div class="ms-popconfirm__title">确定执行此操作?</div>
      <div class="ms-popconfirm__desc">操作不可撤销,请确认。</div>
      <div class="ms-popconfirm__actions">
        <button type="button" class="ms-button ms-button--ghost ms-button--sm">取消</button>
        <button type="button" class="ms-button ms-button--solid ms-button--sm ms-popconfirm__confirm">确定</button>
      </div>
    </div>
  </div>
  <div class="ms-popover">
    <div class="ms-popconfirm__body ms-popconfirm__body--danger">
      <div class="ms-popconfirm__title">确定删除该条目?</div>
      <div class="ms-popconfirm__desc">此操作不可撤销。</div>
      <div class="ms-popconfirm__actions">
        <button type="button" class="ms-button ms-button--ghost ms-button--sm">取消</button>
        <button type="button" class="ms-button ms-button--solid ms-button--sm ms-popconfirm__confirm">删除</button>
      </div>
    </div>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `trigger` | `ReactElement` | — | 触发元素(单个 React 元素,如 &lt;Button>),点击弹出确认气泡。 |
| `title` | `ReactNode` | — | 确认标题 / 主问题。 |
| `description` | `ReactNode` | — | 次级描述说明。 |
| `onConfirm` | `() => void` | — | 点击确认时触发,随后自动关闭气泡。 |
| `onCancel` | `() => void` | — | 点击取消 / 点外 / Esc 关闭时触发。 |
| `confirmText` | `ReactNode` | `'确定'` | 确认按钮文案。 |
| `cancelText` | `ReactNode` | `'取消'` | 取消按钮文案。 |
| `variant` | `'default' \| 'danger'` | `'default'` | danger 时确认按钮染危险色。 |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 气泡相对 trigger 的方位。 |

## 导航 Navigation

### Breadcrumb

面包屑导航,语义化 nav/ol 结构,自动把末项识别为当前页。

<div class="ms-demo">
  <nav aria-label="breadcrumb" class="ms-breadcrumb">
    <ol class="ms-breadcrumb__list">
      <li class="ms-breadcrumb__item">
        <a href="#/" class="ms-breadcrumb__link">首页</a>
        <span aria-hidden="true" class="ms-breadcrumb__separator">/</span>
      </li>
      <li class="ms-breadcrumb__item">
        <a href="#/grimoire" class="ms-breadcrumb__link">法术书</a>
        <span aria-hidden="true" class="ms-breadcrumb__separator">/</span>
      </li>
      <li class="ms-breadcrumb__item">
        <a href="#/grimoire/arcane" class="ms-breadcrumb__link">奥术</a>
        <span aria-hidden="true" class="ms-breadcrumb__separator">/</span>
      </li>
      <li class="ms-breadcrumb__item">
        <span aria-current="page" class="ms-breadcrumb__current">召唤阵</span>
      </li>
    </ol>
  </nav>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `BreadcrumbItem[]` | `—` | 面包屑层级项(自前往后):{ label, href?, current? }。 |
| `items[].label` | `ReactNode` | `—` | 项文本,可为任意节点(如带图标)。 |
| `items[].href` | `string` | `—` | 链接地址。提供且非当前项时渲染 &lt;a>;省略则渲染为纯文本。 |
| `items[].current` | `boolean` | `—` | 是否为当前页。当前项用 fg 色、不可点,并标 aria-current="page";末项未指定时默认当前页。 |
| `separator` | `ReactNode` | `'/'` | 项间分隔符,装饰性(aria-hidden)。 |
| `className` | `string` | `—` | 外部类名,作用于根 &lt;nav>。 |

### Pagination

分页导航,首尾恒显、当前页两侧对称展开,页数过多时省略号折叠。

<div class="ms-demo">
  <nav class="ms-pagination" aria-label="pagination">
    <ul class="ms-pagination__list">
      <li class="ms-pagination__item">
        <button type="button" class="ms-pagination__btn ms-pagination__btn--nav" aria-label="上一页">
          <span class="ms-pagination__chevron ms-pagination__chevron--prev" aria-hidden="true"></span>
        </button>
      </li>
      <li class="ms-pagination__item">
        <button type="button" class="ms-pagination__btn ms-pagination__btn--page" aria-label="第 1 页">1</button>
      </li>
      <li class="ms-pagination__item">
        <span class="ms-pagination__ellipsis" aria-hidden="true">&#8230;</span>
      </li>
      <li class="ms-pagination__item">
        <button type="button" class="ms-pagination__btn ms-pagination__btn--page" aria-label="第 9 页">9</button>
      </li>
      <li class="ms-pagination__item">
        <button type="button" class="ms-pagination__btn ms-pagination__btn--page ms-pagination__btn--current" aria-label="第 10 页" aria-current="page">10</button>
      </li>
      <li class="ms-pagination__item">
        <button type="button" class="ms-pagination__btn ms-pagination__btn--page" aria-label="第 11 页">11</button>
      </li>
      <li class="ms-pagination__item">
        <span class="ms-pagination__ellipsis" aria-hidden="true">&#8230;</span>
      </li>
      <li class="ms-pagination__item">
        <button type="button" class="ms-pagination__btn ms-pagination__btn--page" aria-label="第 20 页">20</button>
      </li>
      <li class="ms-pagination__item">
        <button type="button" class="ms-pagination__btn ms-pagination__btn--nav" aria-label="下一页">
          <span class="ms-pagination__chevron ms-pagination__chevron--next" aria-hidden="true"></span>
        </button>
      </li>
    </ul>
  </nav>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | `number` | `—` | 当前页(1 起,受控,必填)。 |
| `total` | `number` | `—` | 总页数(必填)。 |
| `onPageChange` | `(page: number) => void` | `—` | 翻页回调,入参为目标页码(1 起)。 |
| `siblingCount` | `number` | `1` | 当前页两侧各显示的页码数。 |
| `...props` | `Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'>` | `—` | 透传原生 nav 属性(className / aria-* 等)。 |

### Tabs

标签页,受控 / 非受控双模式,完整 ARIA 与方向键导航。

<div class="ms-demo">
  <div class="ms-tabs ms-tabs--underline" style="min-width: min(32rem, 100%)">
    <div role="tablist" class="ms-tabs__list">
      <button type="button" role="tab" class="ms-tabs__tab" aria-selected="false" tabindex="-1">
        <span class="ms-tabs__label">Arcane 奥术</span>
      </button>
      <button type="button" role="tab" class="ms-tabs__tab ms-tabs__tab--selected" aria-selected="true" tabindex="0">
        <span class="ms-tabs__label">Frost 冰霜</span>
      </button>
      <button type="button" role="tab" class="ms-tabs__tab" aria-selected="false" tabindex="-1">
        <span class="ms-tabs__label">Ember 余烬</span>
      </button>
      <button type="button" role="tab" class="ms-tabs__tab" aria-selected="false" tabindex="-1" aria-disabled="true" disabled>
        <span class="ms-tabs__label">Void 虚空(禁用)</span>
      </button>
    </div>
    <div role="tabpanel" class="ms-tabs__panel" tabindex="0">
      <p style="margin: 0; color: var(--ms-color-fg-muted)">冰霜系以控场见长,减速与冻结让节奏尽在掌握。切换标签时面板内容平滑替换。</p>
    </div>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `TabItem[]` | — | 标签项列表:{ value, label, content?, disabled? }。 |
| `value` | `string` | — | 受控选中值。传入则由外部托管,需配合 onChange。 |
| `defaultValue` | `string` | `首个可用项` | 非受控初始选中值。缺省取第一个未禁用项。 |
| `onChange` | `(value: string) => void` | — | 选中变化回调,参数为新选中项的 value。 |
| `variant` | `'underline' \| 'pill'` | `'underline'` | 视觉变体:下划线条带 / 实底胶囊。 |
| `className` | `string` | — | 外部类名(作用于最外层容器)。 |

### Accordion

手风琴折叠面板组,single / multiple 两种展开模式,键盘可达。

<div class="ms-demo">
  <div class="ms-accordion" style="max-inline-size: 28rem;">
    <div class="ms-accordion__item ms-accordion__item--open">
      <h3 class="ms-accordion__heading">
        <button type="button" class="ms-accordion__trigger" aria-expanded="true" aria-controls="demo-accordion-p-0" id="demo-accordion-h-0">
          <span class="ms-accordion__icon" aria-hidden="true"></span>
          <span class="ms-accordion__title">奥术回路 Arcane</span>
        </button>
      </h3>
      <section id="demo-accordion-p-0" aria-labelledby="demo-accordion-h-0" class="ms-accordion__panel">
        <div class="ms-accordion__panel-inner">
          <div class="ms-accordion__content">展开/收起用 grid-template-rows: 0fr → 1fr 过渡,平滑且无需测量高度。展开图标 ▸ 旋转 90°,旋转量乘 motion-scale。</div>
        </div>
      </section>
    </div>
    <div class="ms-accordion__item">
      <h3 class="ms-accordion__heading">
        <button type="button" class="ms-accordion__trigger" aria-expanded="false" aria-controls="demo-accordion-p-1" id="demo-accordion-h-1">
          <span class="ms-accordion__icon" aria-hidden="true"></span>
          <span class="ms-accordion__title">霜结协议 Frost</span>
        </button>
      </h3>
      <section id="demo-accordion-p-1" aria-labelledby="demo-accordion-h-1" class="ms-accordion__panel" hidden>
        <div class="ms-accordion__panel-inner">
          <div class="ms-accordion__content">头部为原生 &lt;button&gt;,带 aria-expanded / aria-controls;内容区 role="region" + aria-labelledby,无障碍开箱即用。</div>
        </div>
      </section>
    </div>
    <div class="ms-accordion__item">
      <h3 class="ms-accordion__heading">
        <button type="button" class="ms-accordion__trigger" aria-expanded="false" aria-controls="demo-accordion-p-2" id="demo-accordion-h-2">
          <span class="ms-accordion__icon" aria-hidden="true"></span>
          <span class="ms-accordion__title">余烬通道 Ember</span>
        </button>
      </h3>
      <section id="demo-accordion-p-2" aria-labelledby="demo-accordion-h-2" class="ms-accordion__panel" hidden>
        <div class="ms-accordion__panel-inner">
          <div class="ms-accordion__content">↑↓ 在头部间移动焦点(跳过 disabled),Home / End 跳首尾;Enter / Space 由原生 button 触发切换。</div>
        </div>
      </section>
    </div>
    <div class="ms-accordion__item ms-accordion__item--disabled">
      <h3 class="ms-accordion__heading">
        <button type="button" class="ms-accordion__trigger" aria-expanded="false" aria-controls="demo-accordion-p-3" id="demo-accordion-h-3" disabled>
          <span class="ms-accordion__icon" aria-hidden="true"></span>
          <span class="ms-accordion__title">虚空封印 Void(禁用)</span>
        </button>
      </h3>
      <section id="demo-accordion-p-3" aria-labelledby="demo-accordion-h-3" class="ms-accordion__panel" hidden>
        <div class="ms-accordion__panel-inner">
          <div class="ms-accordion__content">此项被禁用,既不可展开也不会成为键盘焦点的落点。</div>
        </div>
      </section>
    </div>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'single' \| 'multiple'` | `'single'` | single 同时只展开一项;multiple 可同时展开多项。 |
| `items` | `AccordionItem[]` | — | 面板项列表:{ value, title, content, disabled? }。 |
| `defaultValue` | `string \| string[]` | — | 初始展开值。single 取 string,multiple 取 string[];宽松接受任一形态。 |
| `className` | `string` | — | 外部类名(作用于根容器)。 |
| `item.value` | `string` | — | AccordionItem:唯一标识,用于受控展开判定。 |
| `item.title` | `ReactNode` | — | AccordionItem:头部标题(button 内容)。 |
| `item.content` | `ReactNode` | — | AccordionItem:折叠面板内容。 |
| `item.disabled` | `boolean` | `false` | AccordionItem:是否禁用(不可展开、不接收键盘焦点)。 |

## 布局 Layout

### Card

内容卡片容器,elevated(底+柔影)与 outline(描边)两种变体,可选 interactive 上浮发光。

<div class="ms-demo">
  <div class="ms-card ms-card--elevated" style="max-inline-size: 16rem">
    <strong>Elevated</strong>
    <p style="margin-block: var(--ms-space-2) 0; color: var(--ms-color-fg-muted)">surface 底 + 柔和阴影,适合内容分组。</p>
  </div>
  <div class="ms-card ms-card--outline" style="max-inline-size: 16rem">
    <strong>Outline</strong>
    <p style="margin-block: var(--ms-space-2) 0; color: var(--ms-color-fg-muted)">透明底 + 描边,弱化容器存在感。</p>
  </div>
  <div class="ms-card ms-card--elevated ms-card--interactive" tabindex="0" style="max-inline-size: 16rem">
    <strong>Interactive</strong>
    <p style="margin-block: var(--ms-space-2) 0; color: var(--ms-color-fg-muted)">移上来看上浮与发光,按 Tab 看聚焦光环。</p>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'elevated' \| 'outline'` | `'elevated'` | 视觉变体:elevated(surface 底 + 柔和阴影)/ outline(透明底 + 描边)。 |
| `interactive` | `boolean` | `false` | 可交互:hover 上浮 + 奥术发光,并暴露键盘聚焦环(默认 tabIndex 0 + focus-visible)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / onClick / children 等)。 |

### Divider

分隔线,语义 &lt;hr>(隐含 separator role),支持水平 / 垂直两种朝向。

<div class="ms-demo">
  <p style="color: var(--ms-color-fg);">上方内容</p>
  <div class="ms-divider ms-divider--horizontal" role="separator" aria-orientation="horizontal"></div>
  <p style="color: var(--ms-color-fg);">下方内容</p>

  <div style="display: flex; align-items: center; block-size: 2rem; margin-block-start: var(--ms-space-6); color: var(--ms-color-fg);">
    <span>左</span>
    <div class="ms-divider ms-divider--vertical" role="separator" aria-orientation="vertical" style="margin-inline: var(--ms-space-4);"></div>
    <span>中</span>
    <div class="ms-divider ms-divider--vertical" role="separator" aria-orientation="vertical" style="margin-inline: var(--ms-space-4);"></div>
    <span>右</span>
  </div>
</div>

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | 朝向:水平横跨容器宽度,垂直贴满容器高度(行内)。同步设 aria-orientation。 |
| `...props` | `ComponentPropsWithoutRef<'hr'>` | — | 透传原生 hr 属性(className / style 等)。注意 &lt;hr> 为空元素,不接受 children。 |
