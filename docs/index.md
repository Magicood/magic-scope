# magic-scope

可发布到 npm 的多框架 UI 组件库 + 自动化收录流水线。主题:**魔法**(深色奥术为默认预设)。

设计语言与地基蓝图见仓库 `DESIGN.md`,背景与路线图见 `FOUNDATION.md`。

下面是已收录组件的实时预览(深色奥术主题)。把鼠标移上去看**发光与过渡**,按 Tab 看**聚焦光环**。

## Button

<div class="ms-demo">
  <button class="ms-button ms-button--solid ms-button--lg">Solid 大</button>
  <button class="ms-button ms-button--solid ms-button--md">Solid</button>
  <button class="ms-button ms-button--outline ms-button--md">Outline</button>
  <button class="ms-button ms-button--ghost ms-button--md">Ghost</button>
  <button class="ms-button ms-button--solid ms-button--sm" disabled>Disabled</button>
</div>

## Input

<div class="ms-demo" style="flex-direction: column; align-items: stretch">
  <input class="ms-input ms-input--md" placeholder="md 输入框" />
  <input class="ms-input ms-input--sm" placeholder="sm 输入框" />
  <input class="ms-input ms-input--md ms-input--invalid" placeholder="invalid 校验态" aria-invalid="true" />
  <input class="ms-input ms-input--md" placeholder="disabled" disabled />
</div>

## Card

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

## Badge

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

## Switch

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

## Checkbox

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

## Textarea

<div class="ms-demo">
  <textarea class="ms-textarea ms-textarea--sm" placeholder="小尺寸 (sm)"></textarea>
  <textarea class="ms-textarea ms-textarea--md" placeholder="中尺寸 (md,默认)"></textarea>
  <textarea class="ms-textarea ms-textarea--lg" placeholder="大尺寸 (lg)"></textarea>
  <textarea class="ms-textarea ms-textarea--md ms-textarea--invalid" aria-invalid="true" placeholder="校验失败态 (invalid)"></textarea>
  <textarea class="ms-textarea ms-textarea--md" disabled placeholder="禁用态 (disabled)"></textarea>
</div>

## Alert

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

## Spinner

<div class="ms-demo">
  <span class="ms-spinner ms-spinner--sm" role="status" aria-label="加载中"></span>
  <span class="ms-spinner ms-spinner--md" role="status" aria-label="加载中"></span>
  <span class="ms-spinner ms-spinner--lg" role="status" aria-label="加载中"></span>
</div>

## Divider

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
