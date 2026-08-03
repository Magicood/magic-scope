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
