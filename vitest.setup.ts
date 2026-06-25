import '@testing-library/jest-dom/vitest';

// jsdom 未实现 Popover API 与 dialog.showModal,测试用最小 stub(仅切换 open / data-open 状态)。
if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.showPopover) {
  // 仅消除 "not a function" 报错;组件自行用 dataset / state 控制可见态,故 noop。
  HTMLElement.prototype.showPopover = function showPopover() {};
  HTMLElement.prototype.hidePopover = function hidePopover() {};
}
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}
