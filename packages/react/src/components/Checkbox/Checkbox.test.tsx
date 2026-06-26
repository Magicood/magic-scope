// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, CheckboxGroup } from './Checkbox';

describe('Checkbox', () => {
  it('渲染为原生 checkbox,children 作为可访问名,并带组件基础类名', () => {
    render(<Checkbox>同意条款</Checkbox>);

    const input = screen.getByRole('checkbox', { name: '同意条款' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'checkbox');
    expect(input).toHaveClass('ms-checkbox__input');

    // 文字标签渲染在独立的 label span 中
    expect(screen.getByText('同意条款')).toHaveClass('ms-checkbox__label');
  });

  it('合并外部 className 到根 label,且保留组件基础类名与默认 tone/size 类', () => {
    render(<Checkbox className="custom-cls">勾选</Checkbox>);

    const label = screen.getByText('勾选').closest('label');
    expect(label).toHaveClass('ms-checkbox');
    expect(label).toHaveClass('custom-cls');
    expect(label).toHaveClass('ms-checkbox--md');
    expect(label).toHaveClass('ms-tone-primary');
  });

  it('tone/size 落到根 label 的类名(ms-tone-* / ms-checkbox--*)', () => {
    render(
      <Checkbox tone="success" size="lg">
        高级项
      </Checkbox>,
    );
    const label = screen.getByText('高级项').closest('label');
    expect(label).toHaveClass('ms-tone-success');
    expect(label).toHaveClass('ms-checkbox--lg');
  });

  it('透传原生 props:受控 checked + disabled', () => {
    render(
      <Checkbox checked disabled onChange={() => {}}>
        受控项
      </Checkbox>,
    );

    const input = screen.getByRole('checkbox', { name: '受控项' });
    expect(input).toBeChecked();
    expect(input).toBeDisabled();
  });

  it('可点击切换并调用 onChange(非受控,非 disabled)', () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>可切换</Checkbox>);

    const input = screen.getByRole('checkbox', { name: '可切换' });
    expect(input).not.toBeChecked();

    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input).toBeChecked();
  });

  it('onChange(用户) 与 onCheckedChange(内部语义) 都触发,且 onCheckedChange 收到布尔', () => {
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <Checkbox onChange={onChange} onCheckedChange={onCheckedChange}>
        勾我
      </Checkbox>,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: '勾我' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('用户 onChange 内 preventDefault 拦截内部 onCheckedChange(compose 语义)', () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox onChange={(e) => e.preventDefault()} onCheckedChange={onCheckedChange}>
        被拦
      </Checkbox>,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: '被拦' }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('根 label 透传原生事件:onClick / onMouseEnter 挂到根 label', () => {
    const onClick = vi.fn();
    const onMouseEnter = vi.fn();
    render(
      <Checkbox onClick={onClick} onMouseEnter={onMouseEnter}>
        根事件
      </Checkbox>,
    );

    const label = screen.getByText('根事件').closest('label') as HTMLLabelElement;
    fireEvent.mouseEnter(label);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
    fireEvent.click(label);
    expect(onClick).toHaveBeenCalled();
  });

  it('description 渲染为次级说明,并经 aria-describedby 关联到 input', () => {
    render(<Checkbox description="将向你发送营销邮件">订阅</Checkbox>);
    const input = screen.getByRole('checkbox', { name: '订阅' });
    const desc = screen.getByText('将向你发送营销邮件');
    expect(desc).toHaveClass('ms-checkbox__description');
    expect(input.getAttribute('aria-describedby')).toBe(desc.id);
  });

  it('indeterminate 落到原生 input 的 DOM 属性', () => {
    render(<Checkbox indeterminate>全选</Checkbox>);
    const input = screen.getByRole('checkbox', { name: '全选' }) as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });

  it('inputProps 透传到内部 input(如 required / name)', () => {
    render(<Checkbox inputProps={{ required: true, name: 'agree' }}>条款</Checkbox>);
    const input = screen.getByRole('checkbox', { name: '条款' });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('name', 'agree');
  });

  it('无 children 时 aria-label 转发为 input 可访问名(向后兼容 Table 等用法)', () => {
    render(<Checkbox aria-label="选择第 1 行" />);
    expect(screen.queryByRole('checkbox', { name: '选择第 1 行' })).not.toBeNull();
  });
});

describe('CheckboxGroup', () => {
  it('渲染 role="group",并把 tone 类下发到容器', () => {
    render(
      <CheckboxGroup tone="info" aria-label="爱好">
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </CheckboxGroup>,
    );
    const group = screen.getByRole('group', { name: '爱好' });
    expect(group).toHaveClass('ms-checkbox-group');
    expect(group).toHaveClass('ms-tone-info');
  });

  it('非受控 defaultValue:组内 Checkbox 按选中集合自动 checked', () => {
    render(
      <CheckboxGroup defaultValue={['b']}>
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </CheckboxGroup>,
    );
    expect(screen.getByRole('checkbox', { name: 'A' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'B' })).toBeChecked();
  });

  it('点击组内项触发组级 onChange,回传新的选中数组(受控)', () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup value={['a']} onChange={onChange}>
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </CheckboxGroup>,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'B' }));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);

    fireEvent.click(screen.getByRole('checkbox', { name: 'A' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('组级 disabled/size/tone 下发到组内 Checkbox(单项可覆盖)', () => {
    render(
      <CheckboxGroup disabled size="lg" tone="danger">
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b" size="sm">
          B
        </Checkbox>
      </CheckboxGroup>,
    );
    expect(screen.getByRole('checkbox', { name: 'A' })).toBeDisabled();
    const labelA = screen.getByText('A').closest('label');
    expect(labelA).toHaveClass('ms-checkbox--lg');
    expect(labelA).toHaveClass('ms-tone-danger');
    // 单项 size 覆盖组级
    expect(screen.getByText('B').closest('label')).toHaveClass('ms-checkbox--sm');
  });

  it('组内项仍触发各自的 onCheckedChange(与组级 onChange 并存)', () => {
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <CheckboxGroup onChange={onChange}>
        <Checkbox value="a" onCheckedChange={onCheckedChange}>
          A
        </Checkbox>
      </CheckboxGroup>,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'A' }));
    expect(onChange).toHaveBeenCalledWith(['a']);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
