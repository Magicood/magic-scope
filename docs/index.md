# magic-scope

可发布到 npm 的多框架 UI 组件库 + 自动化收录流水线。主题:**魔法**(深色奥术为默认预设)。

设计语言与地基蓝图见仓库 `DESIGN.md`,背景与路线图见 `FOUNDATION.md`。

库内已收录 **26** 个组件,下方为其中部分组件的实时预览(深色奥术主题)。把鼠标移上去看**发光与过渡**,按 Tab 看**聚焦光环**。

## 操作 Actions

### Button

<div class="ms-demo">
  <button class="ms-button ms-button--solid ms-button--lg">Solid 大</button>
  <button class="ms-button ms-button--solid ms-button--md">Solid</button>
  <button class="ms-button ms-button--outline ms-button--md">Outline</button>
  <button class="ms-button ms-button--ghost ms-button--md">Ghost</button>
  <button class="ms-button ms-button--solid ms-button--sm" disabled>Disabled</button>
</div>

## 表单 Forms

### Input

<div class="ms-demo" style="flex-direction: column; align-items: stretch">
  <input class="ms-input ms-input--md" placeholder="md 输入框" />
  <input class="ms-input ms-input--sm" placeholder="sm 输入框" />
  <input class="ms-input ms-input--md ms-input--invalid" placeholder="invalid 校验态" aria-invalid="true" />
  <input class="ms-input ms-input--md" placeholder="disabled" disabled />
</div>

### Textarea

<div class="ms-demo">
  <textarea class="ms-textarea ms-textarea--sm" placeholder="小尺寸 (sm)"></textarea>
  <textarea class="ms-textarea ms-textarea--md" placeholder="中尺寸 (md,默认)"></textarea>
  <textarea class="ms-textarea ms-textarea--lg" placeholder="大尺寸 (lg)"></textarea>
  <textarea class="ms-textarea ms-textarea--md ms-textarea--invalid" aria-invalid="true" placeholder="校验失败态 (invalid)"></textarea>
  <textarea class="ms-textarea ms-textarea--md" disabled placeholder="禁用态 (disabled)"></textarea>
</div>

### Checkbox

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

### Switch

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

### Radio

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

### Label

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

## 数据展示 Data Display

### Badge

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

### Tag

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

### Avatar

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

### Kbd

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

## 布局 Layout

### Card

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

### Divider

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

## 反馈 Feedback

### Alert

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

### Progress

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

### Spinner

<div class="ms-demo">
  <span class="ms-spinner ms-spinner--sm" role="status" aria-label="加载中"></span>
  <span class="ms-spinner ms-spinner--md" role="status" aria-label="加载中"></span>
  <span class="ms-spinner ms-spinner--lg" role="status" aria-label="加载中"></span>
</div>

### Skeleton

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

