// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
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
});
