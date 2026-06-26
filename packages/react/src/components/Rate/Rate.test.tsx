// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { clampRate, fillStateAt, stepValue, valueFromPointer } from './logic';
import { Rate } from './Rate';

// jsdom 不实现布局,getBoundingClientRect 默认全 0;半星判定依赖宽度,故按需 stub。
function stubRect(el: Element, rect: Partial<DOMRect>): void {
  el.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, ...rect }) as DOMRect;
}

// 取第 i 颗星(noUncheckedIndexedAccess 下断言非空,便于 fireEvent 接收 HTMLElement)。
function item(slider: HTMLElement, i: number): HTMLElement {
  const items = slider.querySelectorAll<HTMLElement>('.ms-rate__item');
  const el = items[i];
  if (!el) {
    throw new Error(`第 ${i} 颗星不存在`);
  }
  return el;
}

describe('Rate', () => {
  it('渲染 role=slider,默认 5 星 + 受控 value 的 aria-valuenow/max,默认 tone=warning', () => {
    render(<Rate value={3} aria-label="评分" />);
    const slider = screen.getByRole('slider', { name: '评分' });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveClass('ms-rate', 'ms-rate--md', 'ms-tone-warning');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '5');
    expect(slider).toHaveAttribute('aria-valuenow', '3');
    // 前 3 颗满,后 2 颗空
    expect(slider.querySelectorAll('.ms-rate__item')).toHaveLength(5);
    expect(item(slider, 0)).toHaveAttribute('data-state', 'full');
    expect(item(slider, 2)).toHaveAttribute('data-state', 'full');
    expect(item(slider, 3)).toHaveAttribute('data-state', 'empty');
  });

  it('非受控点击第 4 颗整星 → onChange(4),DOM 反映新评分', () => {
    const onChange = vi.fn();
    render(<Rate defaultValue={0} onChange={onChange} aria-label="评分" />);
    fireEvent.click(item(screen.getByRole('slider'), 3), { clientX: 10 });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(4);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '4');
  });

  it('allowClear:再次点击当前评分对应星归零', () => {
    const onChange = vi.fn();
    render(<Rate defaultValue={3} onChange={onChange} aria-label="评分" />);
    // 当前为 3,点第 3 颗(整星算 3)→ 与当前相等 → 清零
    fireEvent.click(item(screen.getByRole('slider'), 2), { clientX: 10 });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('allowHalf:点击星左半区取 .5 评分', () => {
    const onChange = vi.fn();
    render(<Rate allowHalf defaultValue={0} onChange={onChange} aria-label="评分" />);
    const third = item(screen.getByRole('slider'), 2);
    // 第 3 颗宽 20,点 x=4(左半)→ 2.5
    stubRect(third, { left: 0, width: 20 });
    fireEvent.click(third, { clientX: 4 });
    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  it('键盘 ArrowRight 增、ArrowLeft 减,allowHalf 时步进 0.5;Home/End 取极值', () => {
    const onChange = vi.fn();
    render(<Rate allowHalf value={2} onChange={onChange} aria-label="评分" />);
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(2.5);
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(1.5);
    fireEvent.keyDown(slider, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(5);
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('readOnly:点击与键盘均不触发 onChange,且标记 aria-readonly', () => {
    const onChange = vi.fn();
    render(<Rate readOnly value={2} onChange={onChange} aria-label="评分" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-readonly', 'true');
    fireEvent.click(item(slider, 4), { clientX: 10 });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('hover 预览触发 onHoverChange,移出回 -1;character render-prop 拿到逐星状态', () => {
    const onHoverChange = vi.fn();
    const character = vi.fn(({ index }: { index: number }) => <i data-i={index}>★</i>);
    render(
      <Rate value={1} onHoverChange={onHoverChange} character={character} aria-label="评分" />,
    );
    const slider = screen.getByRole('slider');
    fireEvent.mouseMove(item(slider, 3), { clientX: 10 });
    expect(onHoverChange).toHaveBeenLastCalledWith(4);
    fireEvent.mouseLeave(slider);
    expect(onHoverChange).toHaveBeenLastCalledWith(-1);
    // render-prop 被逐星调用(bg + fill 两层,共 count*2 次)
    expect(character).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
  });

  it('tooltips:每星 title 透到 item,role=slider 的 aria-valuetext 用当前整星 tooltip', () => {
    render(<Rate value={2} tooltips={['差', '一般', '好', '很好', '极好']} aria-label="评分" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuetext', '一般');
    expect(item(slider, 0)).toHaveAttribute('title', '差');
    expect(item(slider, 4)).toHaveAttribute('title', '极好');
  });
});

describe('Rate logic', () => {
  it('clampRate:夹区间并按步进对齐,脏值归零', () => {
    expect(clampRate(7, 5, false)).toBe(5);
    expect(clampRate(-2, 5, false)).toBe(0);
    expect(clampRate(2.4, 5, true)).toBe(2.5);
    expect(clampRate(2.4, 5, false)).toBe(2);
    expect(clampRate(undefined, 5, true)).toBe(0);
    expect(clampRate(Number.NaN, 5, true)).toBe(0);
  });

  it('fillStateAt:整星/半星/空判定', () => {
    expect(fillStateAt(0, 3, false)).toBe('full');
    expect(fillStateAt(2, 2.5, true)).toBe('half');
    expect(fillStateAt(2, 2, true)).toBe('empty');
    // 不允许半星时,2.5 在第 3 颗(index 2)视为空(需 >=3 才满)
    expect(fillStateAt(2, 2.5, false)).toBe('empty');
  });

  it('stepValue / valueFromPointer:步进与指针落点', () => {
    expect(stepValue(2, 1, 5, true)).toBe(2.5);
    expect(stepValue(0, -1, 5, false)).toBe(0);
    expect(stepValue(5, 1, 5, false)).toBe(5);
    expect(valueFromPointer(2, true, true)).toBe(2.5);
    expect(valueFromPointer(2, true, false)).toBe(3);
    expect(valueFromPointer(2, false, true)).toBe(3);
  });
});
