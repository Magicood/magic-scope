// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { findEnabledIndex, keyToAction, normalizeItems, stepIndex } from './logic';
import { Segmented } from './Segmented';

const options = [
  { value: 'list', label: '列表' },
  { value: 'kanban', label: '看板' },
  { value: 'gantt', label: '甘特', disabled: true },
  { value: 'calendar', label: '日历' },
];

describe('Segmented', () => {
  it('渲染 radiogroup + 各 radio,默认选中首个可用项,roving tabindex 正确', () => {
    render(<Segmented options={options} aria-label="视图" />);

    const group = screen.getByRole('radiogroup', { name: '视图' });
    expect(group).toBeInTheDocument();
    expect(group).toHaveClass('ms-segmented', 'ms-segmented--md', 'ms-tone-primary');

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    // 默认选中首个可用项(list),其 aria-checked=true 且进 Tab 序(tabIndex=0)
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('tabindex', '0');
    // 其余未选中段不进 Tab 序
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('tabindex', '-1');
    // 禁用段渲染 disabled + aria-disabled
    expect(radios[2]).toBeDisabled();
    expect(radios[2]).toHaveAttribute('aria-disabled', 'true');
  });

  it('受控 value 展示选中段,点击其它段触发 onChange(value,item)+onValueChange,受控不自变', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Segmented
        options={options}
        value="kanban"
        onChange={onChange}
        onValueChange={onValueChange}
        aria-label="视图"
      />,
    );

    const radios = screen.getAllByRole('radio');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(radios[3] as HTMLElement);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      'calendar',
      expect.objectContaining({ value: 'calendar' }),
    );
    expect(onValueChange).toHaveBeenCalledWith('calendar');
    // 受控:外部未更新 value,选中态保持原值不自变
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[3]).toHaveAttribute('aria-checked', 'false');
  });

  it('非受控:点击切换选中并平移 indicator(写入 data-selected),defaultValue 生效', () => {
    render(<Segmented options={options} defaultValue="kanban" aria-label="视图" />);

    const radios = screen.getAllByRole('radio');
    expect(radios[1]).toHaveAttribute('data-selected', '');

    fireEvent.click(radios[0] as HTMLElement);
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('data-selected', '');
    expect(radios[1]).not.toHaveAttribute('data-selected');
  });

  it('点击禁用段不触发 onChange,选中态不变', () => {
    const onChange = vi.fn();
    render(
      <Segmented options={options} defaultValue="list" onChange={onChange} aria-label="视图" />,
    );

    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[2] as HTMLElement); // gantt 禁用
    expect(onChange).not.toHaveBeenCalled();
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('键盘 ArrowRight 跳过禁用段并选中(radiogroup roving 即选中),Home/End 跳首尾可用项', () => {
    const onChange = vi.fn();
    render(
      <Segmented options={options} defaultValue="list" onChange={onChange} aria-label="视图" />,
    );

    const group = screen.getByRole('radiogroup', { name: '视图' });
    // list -> kanban
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(
      'kanban',
      expect.objectContaining({ value: 'kanban' }),
    );
    // kanban -> (跳过禁用 gantt) -> calendar
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(
      'calendar',
      expect.objectContaining({ value: 'calendar' }),
    );
    // End 已在末尾可用项,Home 跳回首个可用项 list
    fireEvent.keyDown(group, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('list', expect.objectContaining({ value: 'list' }));
  });

  it('disabled 整组:键盘与点击均不触发 onChange', () => {
    const onChange = vi.fn();
    render(<Segmented options={options} onChange={onChange} disabled aria-label="视图" />);

    const group = screen.getByRole('radiogroup', { name: '视图' });
    expect(group).toHaveAttribute('aria-disabled', 'true');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    fireEvent.click(screen.getAllByRole('radio')[1] as HTMLElement);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('role=tablist:渲染 tab + aria-selected;方向键仅移焦不自动激活(不触发 onChange)', () => {
    const onChange = vi.fn();
    render(
      <Segmented
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        role="tablist"
        defaultValue="a"
        onChange={onChange}
        aria-label="选项卡"
      />,
    );

    const tablist = screen.getByRole('tablist', { name: '选项卡' });
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    // tablist:方向键移焦,但不自动激活(手动 Enter 才选中)
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(tabs[1]);
    fireEvent.keyDown(tablist, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('b', expect.objectContaining({ value: 'b' }));
  });

  it('复合用法 Segmented.Item:以 value 收集为段、children 作为内容,classNames 部件定制生效', () => {
    render(
      <Segmented defaultValue="x" classNames={{ item: 'my-item' }} aria-label="复合">
        <Segmented.Item value="x">第一</Segmented.Item>
        <Segmented.Item value="y" disabled>
          第二
        </Segmented.Item>
      </Segmented>,
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0]).toHaveTextContent('第一');
    expect(radios[0]).toHaveClass('my-item');
    expect(radios[1]).toBeDisabled();
  });

  it('options 纯值简写数组归一为段;...rest 透传到根、ref 指向根', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Segmented
        ref={ref}
        options={['x', 'y']}
        defaultValue="x"
        data-testid="seg"
        aria-label="简写"
      />,
    );

    const group = screen.getByTestId('seg');
    expect(group).toBe(ref.current);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveTextContent('x');
    expect(radios[1]).toHaveTextContent('y');
  });

  it('外部用户 onKeyDown 经 compose 保留(与内部处理器共存)', () => {
    const userKeyDown = vi.fn();
    render(
      <Segmented options={options} defaultValue="list" onKeyDown={userKeyDown} aria-label="视图" />,
    );
    const group = screen.getByRole('radiogroup', { name: '视图' });
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(userKeyDown).toHaveBeenCalledTimes(1);
  });

  it('受控父组件经 onChange 更新 value 后,UI 跟随更新', () => {
    function Host() {
      const [v, setV] = useState('list');
      return (
        <Segmented
          options={options}
          value={v}
          onChange={(next) => setV(next)}
          aria-label="受控宿主"
        />
      );
    }
    render(<Host />);
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[1] as HTMLElement);
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
  });
});

describe('Segmented logic', () => {
  const items = [{ value: 'a' }, { value: 'b', disabled: true }, { value: 'c' }];

  it('normalizeItems 把纯值简写归一为 {value,label}', () => {
    expect(normalizeItems(['a', 2])).toEqual([
      { value: 'a', label: 'a' },
      { value: '2', label: '2' },
    ]);
  });

  it('findEnabledIndex 跳过禁用并环形遍历', () => {
    expect(findEnabledIndex(items, 1, 1)).toBe(2); // b 禁用 -> c
    expect(findEnabledIndex(items, 3, 1)).toBe(0); // 越界环回 a
    expect(findEnabledIndex([{ value: 'x', disabled: true }], 0, 1)).toBe(-1); // 全禁用
  });

  it('keyToAction 区分横/纵朝向方向键', () => {
    expect(keyToAction('ArrowRight', 'horizontal')).toEqual({ type: 'move', dir: 1 });
    expect(keyToAction('ArrowDown', 'vertical')).toEqual({ type: 'move', dir: 1 });
    // 纵向时左右键不参与移动
    expect(keyToAction('ArrowLeft', 'vertical')).toBeNull();
    expect(keyToAction('Enter', 'horizontal')).toEqual({ type: 'select' });
  });

  it('stepIndex 按动作计算目标索引(跳过禁用)', () => {
    expect(stepIndex(items, 0, { type: 'move', dir: 1 })).toBe(2);
    expect(stepIndex(items, 2, { type: 'first' })).toBe(0);
    expect(stepIndex(items, 0, { type: 'last' })).toBe(2);
  });
});
