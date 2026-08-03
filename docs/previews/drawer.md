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
