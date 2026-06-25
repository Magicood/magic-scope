// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NumberInput } from './NumberInput';

const field = () => screen.getByRole('spinbutton') as HTMLInputElement;
const incBtn = () => screen.getByRole('button', { name: '增加' });
const decBtn = () => screen.getByRole('button', { name: '减少' });

describe('NumberInput', () => {
  it('渲染 spinbutton(input[type=number])与 ± 步进按钮', () => {
    render(<NumberInput defaultValue={3} aria-label="数量" />);
    const input = screen.getByRole('spinbutton', { name: '数量' }) as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'number');
    expect(input.value).toBe('3');
    expect(incBtn()).toBeInTheDocument();
    expect(decBtn()).toBeInTheDocument();
  });

  it('非受控:+ 按步长增,夹取到 max,回调数值', () => {
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue={4} min={0} max={5} step={2} onValueChange={onValueChange} />);

    fireEvent.click(incBtn());
    // 4 + 2 = 6 → 夹取到 5
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    expect(field().value).toBe('5');
  });

  it('非受控:− 按步长减,夹取到 min', () => {
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue={1} min={0} max={9} step={2} onValueChange={onValueChange} />);

    fireEvent.click(decBtn());
    // 1 - 2 = -1 → 夹取到 0
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    expect(field().value).toBe('0');
  });

  it('打字:有效数字上报;清空上报 null', () => {
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue={2} onValueChange={onValueChange} />);

    fireEvent.change(field(), { target: { value: '7' } });
    expect(onValueChange).toHaveBeenLastCalledWith(7);
    expect(field().value).toBe('7');

    fireEvent.change(field(), { target: { value: '' } });
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(field().value).toBe('');
  });

  it('失焦:越界值夹取回 [min,max]', () => {
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue={5} min={0} max={10} onValueChange={onValueChange} />);

    fireEvent.change(field(), { target: { value: '999' } });
    expect(field().value).toBe('999');
    fireEvent.blur(field());
    expect(field().value).toBe('10');
    expect(onValueChange).toHaveBeenLastCalledWith(10);
  });

  it('边界:到达 min/max 时对应步进按钮禁用', () => {
    // defaultValue 仅首渲生效,故用 unmount 重挂测另一边界
    const { unmount } = render(<NumberInput defaultValue={5} min={0} max={5} step={1} />);
    expect(incBtn()).toBeDisabled();
    expect(decBtn()).not.toBeDisabled();
    unmount();

    render(<NumberInput defaultValue={0} min={0} max={5} step={1} />);
    expect(decBtn()).toBeDisabled();
    expect(incBtn()).not.toBeDisabled();
  });

  it('受控:value 驱动显示,点击 + 触发回调,父级回灌后显示跟随', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <NumberInput value={2} min={0} max={10} onValueChange={onValueChange} />,
    );
    expect(field().value).toBe('2');

    fireEvent.click(incBtn());
    expect(onValueChange).toHaveBeenLastCalledWith(3);

    rerender(<NumberInput value={3} min={0} max={10} onValueChange={onValueChange} />);
    expect(field().value).toBe('3');
  });

  it('受控配合状态:经 onValueChange 更新后联动', () => {
    function Controlled() {
      const [v, setV] = useState<number | null>(1);
      return <NumberInput value={v ?? 0} onValueChange={setV} min={0} max={99} />;
    }
    render(<Controlled />);
    fireEvent.click(incBtn());
    expect(field().value).toBe('2');
  });

  it('disabled:输入与两个步进按钮均禁用', () => {
    render(<NumberInput defaultValue={3} disabled />);
    expect(field()).toBeDisabled();
    expect(incBtn()).toBeDisabled();
    expect(decBtn()).toBeDisabled();
  });

  it('size:非 md 加尺寸类', () => {
    const { container } = render(<NumberInput defaultValue={1} size="lg" />);
    expect(container.querySelector('.ms-number-input')).toHaveClass('ms-number-input--lg');
  });
});
