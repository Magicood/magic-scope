// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  // —— 深度补强 ——

  it('invalid:染 danger tone 类并设 aria-invalid', () => {
    const { container } = render(<NumberInput defaultValue={1} invalid />);
    const root = container.querySelector('.ms-number-input');
    expect(root).toHaveClass('ms-tone-danger');
    expect(root).toHaveClass('ms-number-input--invalid');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
  });

  it('tone:渲染对应色调类;invalid 时强制 danger 覆盖 tone', () => {
    const { container, rerender } = render(<NumberInput defaultValue={1} tone="success" />);
    expect(container.querySelector('.ms-number-input')).toHaveClass('ms-tone-success');
    rerender(<NumberInput defaultValue={1} tone="success" invalid />);
    expect(container.querySelector('.ms-number-input')).toHaveClass('ms-tone-danger');
  });

  it('prefix/suffix:框内渲染单位内容', () => {
    render(<NumberInput defaultValue={1} prefix="¥" suffix="%" />);
    expect(screen.getByText('¥')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('onStep/onStepUp/onStepDown:区分步进方向上报新值', () => {
    const onStep = vi.fn();
    const onStepUp = vi.fn();
    const onStepDown = vi.fn();
    render(
      <NumberInput
        defaultValue={5}
        min={0}
        max={10}
        step={1}
        onStep={onStep}
        onStepUp={onStepUp}
        onStepDown={onStepDown}
      />,
    );

    fireEvent.click(incBtn());
    expect(onStep).toHaveBeenLastCalledWith(6, 'up');
    expect(onStepUp).toHaveBeenLastCalledWith(6);
    expect(onStepDown).not.toHaveBeenCalled();

    fireEvent.click(decBtn());
    expect(onStep).toHaveBeenLastCalledWith(5, 'down');
    expect(onStepDown).toHaveBeenLastCalledWith(5);
  });

  it('步进:小数步长修浮点误差(0.1 + 0.2 = 0.3)', () => {
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue={0.1} step={0.2} onValueChange={onValueChange} />);
    fireEvent.click(incBtn());
    expect(onValueChange).toHaveBeenLastCalledWith(0.3);
    expect(field().value).toBe('0.3');
  });

  it('onPressEnter:回车 clamp+提交,携带提交值', () => {
    const onPressEnter = vi.fn();
    render(<NumberInput defaultValue={5} min={0} max={10} onPressEnter={onPressEnter} />);
    fireEvent.change(field(), { target: { value: '999' } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(field().value).toBe('10');
    expect(onPressEnter).toHaveBeenLastCalledWith(10, expect.anything());
  });

  it('events:用户 onChange 与内部上报并存(compose 不覆盖)', () => {
    const userOnChange = vi.fn();
    const onValueChange = vi.fn();
    render(<NumberInput defaultValue={2} onChange={userOnChange} onValueChange={onValueChange} />);
    fireEvent.change(field(), { target: { value: '7' } });
    expect(userOnChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(7);
  });

  it('events:用户 onBlur 与内部夹取并存(compose 不覆盖)', () => {
    const userOnBlur = vi.fn();
    render(<NumberInput defaultValue={5} min={0} max={10} onBlur={userOnBlur} />);
    fireEvent.change(field(), { target: { value: '999' } });
    fireEvent.blur(field());
    expect(userOnBlur).toHaveBeenCalledTimes(1);
    // 内部夹取仍生效
    expect(field().value).toBe('10');
  });

  it('events:用户 onKeyDown 与内部 Enter 提交并存', () => {
    const userOnKeyDown = vi.fn();
    const onPressEnter = vi.fn();
    render(
      <NumberInput
        defaultValue={5}
        min={0}
        max={10}
        onKeyDown={userOnKeyDown}
        onPressEnter={onPressEnter}
      />,
    );
    fireEvent.change(field(), { target: { value: '999' } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(userOnKeyDown).toHaveBeenCalledTimes(1);
    expect(onPressEnter).toHaveBeenLastCalledWith(10, expect.anything());
  });

  it('events:用户 onKeyDown preventDefault 阻断内部 Enter 提交(keydown 可取消)', () => {
    const onPressEnter = vi.fn();
    render(
      <NumberInput
        defaultValue={5}
        min={0}
        max={10}
        onKeyDown={(e) => {
          e.preventDefault();
        }}
        onPressEnter={onPressEnter}
      />,
    );
    fireEvent.change(field(), { target: { value: '999' } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    // 用户 preventDefault 后内部 handleKeyDown 不执行,onPressEnter 不触发、不夹取
    expect(onPressEnter).not.toHaveBeenCalled();
    expect(field().value).toBe('999');
  });

  it('留口:原生属性透传到 input,fieldClassName / stepClassName 落到对应元素', () => {
    const { container } = render(
      <NumberInput
        defaultValue={1}
        data-testid="ni"
        fieldClassName="my-field"
        stepClassName="my-step"
      />,
    );
    // 原生属性(及 aria-label/name 等)语义上属于 spinbutton,透传到 input(与旗舰 Input 一致)
    expect(field()).toHaveAttribute('data-testid', 'ni');
    expect(field()).toHaveClass('my-field');
    expect(container.querySelectorAll('.my-step')).toHaveLength(2);
  });

  describe('长按连续步进', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('pointerdown 后持续步进,松手停止', () => {
      const onValueChange = vi.fn();
      render(
        <NumberInput defaultValue={0} min={0} max={100} step={1} onValueChange={onValueChange} />,
      );

      // 立即走一步
      fireEvent.pointerDown(incBtn(), { button: 0 });
      expect(onValueChange).toHaveBeenLastCalledWith(1);

      // 越过首次延迟,进入连续步进
      act(() => {
        vi.advanceTimersByTime(400 + 80 * 3);
      });
      const callsBeforeRelease = onValueChange.mock.calls.length;
      expect(callsBeforeRelease).toBeGreaterThan(1);

      // 松手后停止,不再继续
      fireEvent.pointerUp(incBtn());
      act(() => {
        vi.advanceTimersByTime(80 * 5);
      });
      expect(onValueChange.mock.calls.length).toBe(callsBeforeRelease);
    });
  });
});
