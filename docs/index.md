# magic-scope

可发布到 npm 的多框架 UI 组件库 + 自动化收录流水线。主题:**魔法**(深色奥术为默认预设)。

文档建设中。设计语言与地基蓝图见仓库 `DESIGN.md`,背景与路线图见 `FOUNDATION.md`。

## Button

`@magic-scope/react` 首个组件,纯自研、消费 `--ms-*` 设计 token。把鼠标移上去看**发光与过渡**,按 Tab 看**聚焦光环**。

### 深色奥术(默认预设)

<div class="ms-demo">
  <button class="ms-button ms-button--solid ms-button--lg">Solid 大</button>
  <button class="ms-button ms-button--solid ms-button--md">Solid</button>
  <button class="ms-button ms-button--outline ms-button--md">Outline</button>
  <button class="ms-button ms-button--ghost ms-button--md">Ghost</button>
  <button class="ms-button ms-button--solid ms-button--sm" disabled>Disabled</button>
</div>

### 浅色奥术

<div class="ms-demo" data-ms-scheme="light">
  <button class="ms-button ms-button--solid ms-button--md">Solid</button>
  <button class="ms-button ms-button--outline ms-button--md">Outline</button>
  <button class="ms-button ms-button--ghost ms-button--md">Ghost</button>
</div>
