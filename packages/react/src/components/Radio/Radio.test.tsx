// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Radio, RadioGroup } from './Radio';

describe('RadioGroup + Radio', () => {
  it('渲染 role=radiogroup(带 aria-orientation)与原生 radio,children 作可访问名', () => {
    render(
      <RadioGroup aria-label="尺码">
        <Radio value="s">小</Radio>
        <Radio value="m">中</Radio>
      </RadioGroup>,
    );

    const group = screen.getByRole('radiogroup', { name: '尺码' });
    expect(group).toHaveClass('ms-radio-group', 'ms-radio-group--vertical');
    expect(group).toHaveAttribute('aria-orientation', 'vertical');

    const radio = screen.getByRole('radio', { name: '小' });
    expect(radio).toHaveAttribute('type', 'radio');
    expect(radio).toHaveClass('ms-radio__input');
    expect(screen.getByText('小')).toHaveClass('ms-radio__label');
  });

  it('组内 radio 共享同一 name(自动生成),保证单选语义', () => {
    render(
      <RadioGroup>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );

    const a = screen.getByRole('radio', { name: 'A' }) as HTMLInputElement;
    const b = screen.getByRole('radio', { name: 'B' }) as HTMLInputElement;
    expect(a.name).toBeTruthy();
    expect(a.name).toBe(b.name);
  });

  it('显式 name 优先于自动生成', () => {
    render(
      <RadioGroup name="plan">
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Free' })).toHaveAttribute('name', 'plan');
  });

  it('非受控:defaultValue 决定初始选中,点击改选并仅一项选中,回调带 value', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="a" onValueChange={onValueChange}>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );

    const a = screen.getByRole('radio', { name: 'A' });
    const b = screen.getByRole('radio', { name: 'B' });
    expect(a).toBeChecked();
    expect(b).not.toBeChecked();

    fireEvent.click(b);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(b).toBeChecked();
    expect(a).not.toBeChecked();
  });

  it('受控:value 驱动选中,父级不更新则选中态不变(受控语义),回调照常触发', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <RadioGroup value="a" onValueChange={onValueChange}>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );

    const a = screen.getByRole('radio', { name: 'A' });
    const b = screen.getByRole('radio', { name: 'B' });
    expect(a).toBeChecked();

    // 受控下点击 b:回调触发,但父级未改 value → 仍是 a 选中
    fireEvent.click(b);
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(a).toBeChecked();
    expect(b).not.toBeChecked();

    // 父级把 value 切到 b 后,选中态才跟随
    rerender(
      <RadioGroup value="b" onValueChange={onValueChange}>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    expect(b).toBeChecked();
    expect(a).not.toBeChecked();
  });

  it('受控配合状态:点击后经由 onValueChange 更新,实际选中切换', () => {
    function Controlled() {
      const [v, setV] = useState('a');
      return (
        <RadioGroup value={v} onValueChange={setV}>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      );
    }
    render(<Controlled />);

    fireEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'A' })).not.toBeChecked();
  });

  it('disabled:整组禁用使所有项禁用;单项 disabled 仅禁用该项', () => {
    const { rerender } = render(
      <RadioGroup disabled defaultValue="a">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'A' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'B' })).toBeDisabled();

    rerender(
      <RadioGroup defaultValue="a">
        <Radio value="a">A</Radio>
        <Radio value="b" disabled>
          B
        </Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'A' })).not.toBeDisabled();
    expect(screen.getByRole('radio', { name: 'B' })).toBeDisabled();
  });

  it('size:组尺寸下发到根 label 类名,单项 size 可覆盖;md 不加类', () => {
    render(
      <RadioGroup size="lg">
        <Radio value="a">A</Radio>
        <Radio value="b" size="sm">
          B
        </Radio>
        <Radio value="c" size="md">
          C
        </Radio>
      </RadioGroup>,
    );
    expect(screen.getByText('A').closest('label')).toHaveClass('ms-radio--lg');
    expect(screen.getByText('B').closest('label')).toHaveClass('ms-radio--sm');
    // md 为基准,不加尺寸类
    const c = screen.getByText('C').closest('label');
    expect(c).toHaveClass('ms-radio');
    expect(c?.className).not.toMatch(/ms-radio--/);
  });

  it('独立使用(无 RadioGroup):透传原生 name 与 defaultChecked', () => {
    render(
      <Radio value="x" name="standalone" defaultChecked>
        独立项
      </Radio>,
    );
    const radio = screen.getByRole('radio', { name: '独立项' });
    expect(radio).toBeChecked();
    expect(radio).toHaveAttribute('name', 'standalone');
  });

  it('独立使用:点击未选中项触发透传的 onChange', () => {
    const onChange = vi.fn();
    render(
      <Radio value="x" name="standalone" onChange={onChange}>
        独立项
      </Radio>,
    );
    const radio = screen.getByRole('radio', { name: '独立项' });
    expect(radio).not.toBeChecked();

    fireEvent.click(radio);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
