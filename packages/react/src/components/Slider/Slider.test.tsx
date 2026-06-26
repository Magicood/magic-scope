// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { clampValue, snapToStep, valueToPercent } from './logic';
import { Slider } from './Slider';

describe('Slider', () => {
  it('渲染原生 range(role=slider),带 min/max/step 与基础类名', () => {
    render(<Slider aria-label="音量" min={0} max={10} step={2} defaultValue={4} />);

    const slider = screen.getByRole('slider', { name: '音量' }) as HTMLInputElement;
    expect(slider).toHaveAttribute('type', 'range');
    expect(slider).toHaveClass('ms-slider__input');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '10');
    expect(slider).toHaveAttribute('step', '2');
    expect(slider.value).toBe('4');
  });

  it('非受控:defaultValue 初始,拖动改值并回调数值', () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="进度" defaultValue={20} onValueChange={onValueChange} />);

    const slider = screen.getByRole('slider', { name: '进度' }) as HTMLInputElement;
    expect(slider.value).toBe('20');

    fireEvent.change(slider, { target: { value: '55' } });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(55);
    expect(slider.value).toBe('55');
  });

  it('受控:value 驱动取值,父级不更新则不变,回调照常触发', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Slider aria-label="受控" value={30} onValueChange={onValueChange} />,
    );

    const slider = screen.getByRole('slider', { name: '受控' }) as HTMLInputElement;
    expect(slider.value).toBe('30');

    fireEvent.change(slider, { target: { value: '70' } });
    expect(onValueChange).toHaveBeenCalledWith(70);
    // 受控且父级未更新 → 仍是 30
    expect(slider.value).toBe('30');

    rerender(<Slider aria-label="受控" value={70} onValueChange={onValueChange} />);
    expect(slider.value).toBe('70');
  });

  it('受控配合状态:经 onValueChange 更新后取值切换', () => {
    function Controlled() {
      const [v, setV] = useState(10);
      return <Slider aria-label="联动" value={v} onValueChange={setV} />;
    }
    render(<Controlled />);

    const slider = screen.getByRole('slider', { name: '联动' }) as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '88' } });
    expect(slider.value).toBe('88');
  });

  it('disabled:禁用态', () => {
    render(<Slider aria-label="禁用" defaultValue={50} disabled />);
    expect(screen.getByRole('slider', { name: '禁用' })).toBeDisabled();
  });

  it('size:非 md 加尺寸类,md 不加', () => {
    const { rerender, container } = render(<Slider aria-label="s" size="lg" defaultValue={1} />);
    expect(container.querySelector('.ms-slider')).toHaveClass('ms-slider--lg');

    rerender(<Slider aria-label="s" size="md" defaultValue={1} />);
    const root = container.querySelector('.ms-slider');
    expect(root).toBeInTheDocument();
    expect(root?.className).not.toMatch(/ms-slider--/);
  });

  it('showValue:渲染当前值,formatValue 可定制', () => {
    const { rerender } = render(<Slider aria-label="v" defaultValue={42} showValue />);
    expect(screen.getByText('42')).toHaveClass('ms-slider__value');

    rerender(<Slider aria-label="v" defaultValue={42} showValue formatValue={(v) => `${v}%`} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('tone:根加 ms-tone-<tone> 类驱动配色', () => {
    const { container, rerender } = render(
      <Slider aria-label="t" tone="success" defaultValue={1} />,
    );
    expect(container.querySelector('.ms-slider')).toHaveClass('ms-tone-success');

    rerender(<Slider aria-label="t" tone="danger" defaultValue={1} />);
    expect(container.querySelector('.ms-slider')).toHaveClass('ms-tone-danger');
  });

  it('orientation:vertical 加朝向类与 aria-orientation', () => {
    const { container } = render(
      <Slider aria-label="纵向" orientation="vertical" defaultValue={1} />,
    );
    expect(container.querySelector('.ms-slider')).toHaveClass('ms-slider--vertical');
    expect(screen.getByRole('slider', { name: '纵向' })).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });

  it('marks:按值渲染刻度,被填充覆盖的高亮', () => {
    const { container } = render(
      <Slider
        aria-label="刻度"
        min={0}
        max={100}
        defaultValue={50}
        marks={[{ value: 0, label: '低' }, { value: 50 }, { value: 100, label: '高' }]}
      />,
    );
    const marks = container.querySelectorAll('.ms-slider__mark');
    expect(marks).toHaveLength(3);
    // 0 与 50 <= 50 高亮,100 不高亮
    expect(container.querySelectorAll('.ms-slider__mark--active')).toHaveLength(2);
    expect(screen.getByText('低')).toHaveClass('ms-slider__mark-label');
    expect(screen.getByText('高')).toBeInTheDocument();
  });

  it('showTooltip:渲染跟随气泡,显当前(格式化)值,交互时可见', () => {
    const { container } = render(
      <Slider aria-label="气泡" defaultValue={30} showTooltip formatValue={(v) => `${v}%`} />,
    );
    const tip = container.querySelector('.ms-slider__tooltip');
    expect(tip).toBeInTheDocument();
    expect(tip).toHaveTextContent('30%');
    // 初始不可见
    expect(tip).not.toHaveAttribute('data-visible');

    const slider = screen.getByRole('slider', { name: '气泡' });
    fireEvent.pointerDown(slider);
    expect(container.querySelector('.ms-slider__tooltip')).toHaveAttribute('data-visible');
  });

  it('onChangeEnd / onValueCommit:拖动中不落定,松手以终值各派发一次', () => {
    const onValueChange = vi.fn();
    const onChangeEnd = vi.fn();
    const onValueCommit = vi.fn();
    render(
      <Slider
        aria-label="落定"
        defaultValue={10}
        onValueChange={onValueChange}
        onChangeEnd={onChangeEnd}
        onValueCommit={onValueCommit}
      />,
    );
    const slider = screen.getByRole('slider', { name: '落定' });

    fireEvent.pointerDown(slider);
    fireEvent.change(slider, { target: { value: '40' } });
    fireEvent.change(slider, { target: { value: '60' } });
    // 拖动中:onValueChange 高频,commit 尚未触发
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onChangeEnd).not.toHaveBeenCalled();
    expect(onValueCommit).not.toHaveBeenCalled();

    fireEvent.pointerUp(slider);
    // 松手:以终值 60 各落定一次
    expect(onChangeEnd).toHaveBeenCalledTimes(1);
    expect(onChangeEnd).toHaveBeenCalledWith(60);
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledWith(60);
  });

  it('onDragStart / onDragEnd:pointerdown 起、pointerup 止,各一次', () => {
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    render(
      <Slider aria-label="边界" defaultValue={5} onDragStart={onDragStart} onDragEnd={onDragEnd} />,
    );
    const slider = screen.getByRole('slider', { name: '边界' });

    fireEvent.pointerDown(slider);
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).not.toHaveBeenCalled();

    fireEvent.pointerUp(slider);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('键盘:方向键起交互,keyup 落定一次', () => {
    const onChangeEnd = vi.fn();
    const onDragStart = vi.fn();
    render(
      <Slider
        aria-label="键盘"
        defaultValue={20}
        onChangeEnd={onChangeEnd}
        onDragStart={onDragStart}
      />,
    );
    const slider = screen.getByRole('slider', { name: '键盘' });

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onDragStart).toHaveBeenCalledTimes(1);
    fireEvent.change(slider, { target: { value: '21' } });
    fireEvent.keyUp(slider, { key: 'ArrowRight' });
    expect(onChangeEnd).toHaveBeenCalledTimes(1);
    expect(onChangeEnd).toHaveBeenCalledWith(21);
  });

  it('compose:用户 onChange 与内部都触发(留口不丢用户处理器)', () => {
    const userOnChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Slider
        aria-label="合并"
        defaultValue={0}
        onChange={userOnChange}
        onValueChange={onValueChange}
      />,
    );
    const slider = screen.getByRole('slider', { name: '合并' }) as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '33' } });

    // 用户原生 onChange 与内部 onValueChange 都被调用,且内部仍正常改值
    expect(userOnChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(33);
    expect(slider.value).toBe('33');
  });

  it('compose:用户 onPointerDown / onPointerUp 与内部边界回调共存', () => {
    const userDown = vi.fn();
    const userUp = vi.fn();
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    render(
      <Slider
        aria-label="指针合并"
        defaultValue={0}
        onPointerDown={userDown}
        onPointerUp={userUp}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />,
    );
    const slider = screen.getByRole('slider', { name: '指针合并' });
    fireEvent.pointerDown(slider);
    fireEvent.pointerUp(slider);

    expect(userDown).toHaveBeenCalledTimes(1);
    expect(userUp).toHaveBeenCalledTimes(1);
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('原生属性透传:...rest 落到 input 根(data-* / name)', () => {
    render(<Slider aria-label="透传" defaultValue={1} name="vol" data-testid="native" />);
    const slider = screen.getByTestId('native');
    expect(slider).toHaveAttribute('name', 'vol');
    expect(slider).toHaveAttribute('type', 'range');
  });
});

describe('Slider/logic', () => {
  it('clampValue:夹取到 [min,max],容错越界与 NaN', () => {
    expect(clampValue(50, 0, 100)).toBe(50);
    expect(clampValue(-5, 0, 100)).toBe(0);
    expect(clampValue(150, 0, 100)).toBe(100);
    expect(clampValue(Number.NaN, 0, 100)).toBe(0);
  });

  it('snapToStep:对齐到步长格点并回正浮点误差', () => {
    expect(snapToStep(7, 0, 100, 5)).toBe(5);
    expect(snapToStep(8, 0, 100, 5)).toBe(10);
    // 浮点步长不溢出小数:0.1 网格上的 0.3 应精确
    expect(snapToStep(0.3, 0, 1, 0.1)).toBe(0.3);
    // step<=0 仅夹取
    expect(snapToStep(33, 0, 100, 0)).toBe(33);
  });

  it('valueToPercent:线性映射到 0–100,边界与退化区间', () => {
    expect(valueToPercent(50, 0, 100)).toBe(50);
    expect(valueToPercent(0, 0, 100)).toBe(0);
    expect(valueToPercent(100, 0, 100)).toBe(100);
    expect(valueToPercent(50, 100, 100)).toBe(0); // max<=min 退化
  });
});
