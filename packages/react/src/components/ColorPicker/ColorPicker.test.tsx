// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ColorPicker } from './ColorPicker';

// jsdom 不实现 Popover API / pointer capture / 元素尺寸,垫片以让组件可挂载与交互。
// 面板挂在 popover="manual" 容器内,未真正 showPopover 时浏览器把它视作对 a11y 树隐藏 ——
// 故面板内部用 { hidden: true } 查询(组件 a11y 在真实浏览器里正常,这里只是测试环境约束)。
beforeAll(() => {
  if (!HTMLElement.prototype.showPopover) {
    HTMLElement.prototype.showPopover = vi.fn();
    HTMLElement.prototype.hidePopover = vi.fn();
  }
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
});

/** 取浮层面板(panel 在 popover 容器内,含全部内部控件)。 */
function panel(): HTMLElement {
  const el = document.querySelector<HTMLElement>('.ms-color-picker__panel');
  if (!el) throw new Error('panel not found');
  return el;
}

/** 把元素的 getBoundingClientRect 固定成 width×height,便于 pointer 取值断言。 */
function stubRect(el: HTMLElement, width = 200, height = 100): void {
  el.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width,
      height,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON() {},
    }) as DOMRect;
}

describe('ColorPicker', () => {
  it('渲染触发色块按钮(aria-label 缺省回退当前颜色串)', () => {
    render(<ColorPicker defaultValue="#ff0000" />);
    const trigger = screen.getByRole('button', { name: '#ff0000' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass('ms-color-picker__trigger');
  });

  it('aria-label 显式传入时优先于颜色串', () => {
    render(<ColorPicker defaultValue="#ff0000" aria-label="品牌主色" />);
    expect(screen.getByRole('button', { name: '品牌主色' })).toBeInTheDocument();
  });

  it('open 受控时渲染面板:2D 面板 + hue + alpha 三个 slider', () => {
    render(<ColorPicker open defaultValue="#ff0000" />);
    const sliders = within(panel()).getAllByRole('slider', { hidden: true });
    expect(sliders).toHaveLength(3);
    expect(within(panel()).getByRole('slider', { name: '色相', hidden: true })).toBeInTheDocument();
    expect(
      within(panel()).getByRole('slider', { name: '透明度', hidden: true }),
    ).toBeInTheDocument();
  });

  it('alpha=false 时不渲染透明度滑条', () => {
    render(<ColorPicker open defaultValue="#ff0000" alpha={false} />);
    expect(within(panel()).queryByRole('slider', { name: '透明度', hidden: true })).toBeNull();
    expect(within(panel()).getAllByRole('slider', { hidden: true })).toHaveLength(2);
  });

  it('文本输入框回车提交合法色值触发 onChange', () => {
    const onChange = vi.fn();
    render(<ColorPicker open defaultValue="#ff0000" onChange={onChange} />);
    const input = within(panel()).getByLabelText('HEX value', { selector: 'input' });
    fireEvent.change(input, { target: { value: '#00ff00' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('#00ff00');
  });

  it('非法色值提交不触发 onChange 且还原显示', () => {
    const onChange = vi.fn();
    render(<ColorPicker open defaultValue="#ff0000" onChange={onChange} />);
    const input = within(panel()).getByLabelText('HEX value', {
      selector: 'input',
    }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '不是颜色' } });
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('#ff0000');
  });

  it('hue 滑条方向键微调触发 onChange(色相变化)', () => {
    const onChange = vi.fn();
    render(<ColorPicker open defaultValue="#ff0000" onChange={onChange} />);
    const hue = within(panel()).getByRole('slider', { name: '色相', hidden: true });
    expect(hue).toHaveAttribute('aria-valuenow', '0');
    fireEvent.keyDown(hue, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).not.toBe('#ff0000');
  });

  it('2D 面板 pointer 拖拽按矩形换算 s/v 触发 onChange', () => {
    const onChange = vi.fn();
    render(<ColorPicker open defaultValue="#ff0000" onChange={onChange} />);
    const area = within(panel()).getByRole('slider', { name: '色相 S/V', hidden: true });
    stubRect(area, 200, 100);
    // 点左上角 → s≈0, v≈1 → 白
    fireEvent.pointerDown(area, { clientX: 0, clientY: 0, pointerId: 1 });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toBe('#ffffff');
  });

  it('alpha 滑条 pointer 取值得到半透明串', () => {
    const onChange = vi.fn();
    render(<ColorPicker open defaultValue="#ff0000" format="rgb" onChange={onChange} />);
    const alpha = within(panel()).getByRole('slider', { name: '透明度', hidden: true });
    stubRect(alpha, 200, 100);
    // 拖到中点 → a≈0.5
    fireEvent.pointerDown(alpha, { clientX: 100, clientY: 50, pointerId: 1 });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toMatch(/^rgba\(255, 0, 0, 0\.5\d*\)$/);
  });

  it('预设色板点击选中并触发 onChange', () => {
    const onChange = vi.fn();
    render(
      <ColorPicker
        open
        defaultValue="#ff0000"
        presets={['#00ff00', '#0000ff']}
        onChange={onChange}
      />,
    );
    const preset = within(panel()).getByRole('button', { name: '#0000ff', hidden: true });
    fireEvent.click(preset);
    expect(onChange).toHaveBeenCalledWith('#0000ff');
  });

  it('格式切换器把输出从 hex 切到 rgb', () => {
    render(<ColorPicker open defaultValue="#ff0000" />);
    fireEvent.click(within(panel()).getByRole('button', { name: 'RGB', hidden: true }));
    const input = within(panel()).getByLabelText('RGB value', {
      selector: 'input',
    }) as HTMLInputElement;
    expect(input.value).toBe('rgb(255, 0, 0)');
  });

  it('受控 value 渲染对应颜色,内部状态不漂移', () => {
    function Controlled() {
      const [v, setV] = useState('#3366cc');
      return <ColorPicker open value={v} onChange={setV} />;
    }
    render(<Controlled />);
    const input = within(panel()).getByLabelText('HEX value', {
      selector: 'input',
    }) as HTMLInputElement;
    expect(input.value).toBe('#3366cc');
    // 改 hue:受控回写后 value 应随之变(不再等于初值)
    fireEvent.keyDown(within(panel()).getByRole('slider', { name: '色相', hidden: true }), {
      key: 'ArrowRight',
    });
    const after = within(panel()).getByLabelText('HEX value', {
      selector: 'input',
    }) as HTMLInputElement;
    expect(after.value).not.toBe('#3366cc');
  });

  it('受控:v 拖到 0(纯黑)再拖回,色相不丢(回归:灰阶/纯黑往返保 hue)', () => {
    // 蓝色 #3366cc(hue≈220)。受控下父组件存了 #000000(v=0,RGB→HSV 丢 hue)后,
    // 再把 v 拖回有彩区,色相不得砸成红(0)。
    function Controlled() {
      const [v, setV] = useState('#3366cc');
      return <ColorPicker open value={v} onChange={setV} />;
    }
    render(<Controlled />);
    const area = within(panel()).getByRole('slider', { name: '色相 S/V', hidden: true });
    stubRect(area, 200, 100);
    // 拖到底部 → v=0 → 受控值变 #000000
    fireEvent.pointerDown(area, { clientX: 130, clientY: 100, pointerId: 1 });
    let input = within(panel()).getByLabelText('HEX value', {
      selector: 'input',
    }) as HTMLInputElement;
    expect(input.value).toBe('#000000');
    // 同一 x、拖回顶部 → v=1。s=130/200=0.65,hue 应仍是蓝(非红 #ff0000)。
    fireEvent.pointerMove(area, { clientX: 130, clientY: 0, pointerId: 1 });
    input = within(panel()).getByLabelText('HEX value', { selector: 'input' }) as HTMLInputElement;
    // 蓝色调:b 通道为主、r 通道最弱;若 hue 丢成红则会是 #ff...。
    const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(input.value);
    expect(m).not.toBeNull();
    const rCh = Number.parseInt((m as RegExpExecArray)[1] as string, 16);
    const bCh = Number.parseInt((m as RegExpExecArray)[3] as string, 16);
    expect(bCh).toBeGreaterThan(rCh);
    expect(input.value).not.toBe('#ff0000');
  });

  it('hue 滑条 End 键存 h=0(规整 [0,360))且 aria-valuenow 不为 360(回归:消 360 跳变)', () => {
    const onChange = vi.fn();
    render(<ColorPicker open defaultValue="#00ff00" onChange={onChange} />);
    const hue = within(panel()).getByRole('slider', { name: '色相', hidden: true });
    fireEvent.keyDown(hue, { key: 'End' });
    // End 后落到红(h=0),输出 #ff0000,且 aria-valuenow=0(绝不为 360)。
    expect(onChange).toHaveBeenLastCalledWith('#ff0000');
    expect(hue).toHaveAttribute('aria-valuenow', '0');
    expect(hue).not.toHaveAttribute('aria-valuenow', '360');
    // 紧接 ArrowRight 应平滑到 1(若内部存了 360 会 (360+1)%360=1 看似同值,
    // 但 aria 会从 360 跳到 1;这里基准是 0,前进到 1,无跳变)。
    fireEvent.keyDown(hue, { key: 'ArrowRight' });
    expect(hue).toHaveAttribute('aria-valuenow', '1');
  });

  it('disabled 时触发按钮禁用、滑条不可聚焦(tabindex=-1)', () => {
    render(<ColorPicker open defaultValue="#ff0000" disabled />);
    expect(screen.getByRole('button', { name: '#ff0000' })).toBeDisabled();
    const hue = within(panel()).getByRole('slider', { name: '色相', hidden: true });
    expect(hue).toHaveAttribute('tabindex', '-1');
    expect(hue).toHaveAttribute('aria-disabled', 'true');
  });

  it('format 受控时不渲染格式切换器', () => {
    render(<ColorPicker open defaultValue="#ff0000" format="rgb" />);
    expect(within(panel()).queryByRole('button', { name: 'RGB', hidden: true })).toBeNull();
    expect(within(panel()).getByLabelText('RGB value', { selector: 'input' })).toBeInTheDocument();
  });

  it('classNames 槽位透传到对应部件', () => {
    render(
      <ColorPicker
        open
        defaultValue="#ff0000"
        classNames={{ trigger: 'my-trigger', hue: 'my-hue' }}
      />,
    );
    expect(screen.getByRole('button', { name: '#ff0000' })).toHaveClass('my-trigger');
    expect(within(panel()).getByRole('slider', { name: '色相', hidden: true })).toHaveClass(
      'my-hue',
    );
  });
});
