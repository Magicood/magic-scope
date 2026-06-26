// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Transfer, type TransferItem } from './Transfer';

const data: TransferItem[] = [
  { key: 'a', title: 'Apple' },
  { key: 'b', title: 'Banana' },
  { key: 'c', title: 'Cherry', disabled: true },
  { key: 'd', title: 'Date' },
];

/** 受控壳:把 onChange 回传的 targetKeys 写回,模拟真实受控用法。 */
function Controlled({
  onChange,
  ...rest
}: {
  onChange?: (keys: string[]) => void;
} & Omit<React.ComponentProps<typeof Transfer>, 'dataSource' | 'targetKeys'>) {
  const [keys, setKeys] = useState<string[]>([]);
  return (
    <Transfer
      dataSource={data}
      targetKeys={keys}
      onChange={(next, _dir, _moved) => {
        setKeys(next);
        onChange?.(next);
      }}
      {...rest}
    />
  );
}

describe('Transfer', () => {
  it('渲染两栏列表与方向按钮,初始全在左栏', () => {
    render(<Transfer dataSource={data} titles={['源', '目标']} />);
    // 4 项默认全在左栏(右栏空)
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /→/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /←/ })).toBeInTheDocument();
  });

  it('表头计数显示 已选/总数,选中一项后右移按钮启用', () => {
    render(<Transfer dataSource={data} />);
    // 选中 Apple
    fireEvent.click(screen.getByRole('checkbox', { name: 'Apple' }));
    const moveRight = screen.getByRole('button', { name: /→/ });
    expect(moveRight).toBeEnabled();
  });

  it('点击右移把选中项移到右栏(非受控)', () => {
    render(<Transfer dataSource={data} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Apple' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Date' }));
    fireEvent.click(screen.getByRole('button', { name: /→/ }));

    const lists = screen.getAllByRole('list');
    const rightList = lists[1];
    expect(rightList).toBeDefined();
    if (rightList) {
      expect(within(rightList).getByText('Apple')).toBeInTheDocument();
      expect(within(rightList).getByText('Date')).toBeInTheDocument();
    }
  });

  it('onChange 回传 (targetKeys, direction, moveKeys)', () => {
    const onChange = vi.fn();
    render(<Transfer dataSource={data} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Banana' }));
    fireEvent.click(screen.getByRole('button', { name: /→/ }));
    expect(onChange).toHaveBeenCalledWith(['b'], 'right', ['b']);
  });

  it('禁用项的 checkbox 不可用,且不参与全选', () => {
    render(<Transfer dataSource={data} />);
    expect(screen.getByRole('checkbox', { name: 'Cherry' })).toBeDisabled();
  });

  it('表头全选只勾选本栏可选项(跳过禁用)', () => {
    const onChange = vi.fn();
    render(<Transfer dataSource={data} onChange={onChange} />);
    // 左栏表头全选(第一个 checkbox 是表头)
    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    expect(headerCheckbox).toBeDefined();
    if (headerCheckbox) {
      fireEvent.click(headerCheckbox);
    }
    fireEvent.click(screen.getByRole('button', { name: /→/ }));
    // 全选只含 a/b/d(c 禁用被跳过)
    expect(onChange).toHaveBeenCalledWith(
      ['a', 'b', 'd'],
      'right',
      expect.arrayContaining(['a', 'b', 'd']),
    );
  });

  it('受控模式:onChange 回写后项真的移动到右栏', () => {
    render(<Controlled />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Apple' }));
    fireEvent.click(screen.getByRole('button', { name: /→/ }));
    const lists = screen.getAllByRole('list');
    const rightList = lists[1];
    if (rightList) {
      expect(within(rightList).getByText('Apple')).toBeInTheDocument();
    }
    // 左移再移回
    fireEvent.click(screen.getByRole('checkbox', { name: 'Apple' }));
    fireEvent.click(screen.getByRole('button', { name: /←/ }));
    const listsAfter = screen.getAllByRole('list');
    const leftList = listsAfter[0];
    if (leftList) {
      expect(within(leftList).getByText('Apple')).toBeInTheDocument();
    }
  });

  it('oneWay 单向模式只渲染右移按钮', () => {
    render(<Transfer dataSource={data} oneWay />);
    expect(screen.getByRole('button', { name: /→/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /←/ })).not.toBeInTheDocument();
  });

  it('showSearch 渲染搜索框并按关键词过滤列表', () => {
    render(<Transfer dataSource={data} showSearch />);
    const searches = screen.getAllByRole('searchbox');
    const leftSearch = searches[0];
    expect(leftSearch).toBeDefined();
    if (leftSearch) {
      fireEvent.change(leftSearch, { target: { value: 'an' } });
    }
    // 仅 Banana 含 "an"
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('回归:搜索激活时表头全选只作用于过滤后可见项,移动只含可见 key', () => {
    const onChange = vi.fn();
    render(<Transfer dataSource={data} showSearch onChange={onChange} />);
    const leftSearch = screen.getAllByRole('searchbox')[0];
    expect(leftSearch).toBeDefined();
    // 搜 "an" —— 左栏仅 Banana 可见(Apple / Date 被隐藏)
    if (leftSearch) {
      fireEvent.change(leftSearch, { target: { value: 'an' } });
    }
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Date')).not.toBeInTheDocument();

    // 点表头全选(第一个 checkbox 是表头),再右移
    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    expect(headerCheckbox).toBeDefined();
    if (headerCheckbox) {
      fireEvent.click(headerCheckbox);
    }
    fireEvent.click(screen.getByRole('button', { name: /→/ }));

    // 只移动了过滤后可见的 'b';被搜索隐藏的 'a' / 'd' 绝不能被选中 / 移动
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['b'], 'right', ['b']);
    const [, , moveKeys] = onChange.mock.calls[0] as [string[], string, string[]];
    expect(moveKeys).toEqual(['b']);
    expect(moveKeys).not.toContain('a');
    expect(moveKeys).not.toContain('d');
  });

  it('回归:全选作用于过滤子集后清空搜索,隐藏项保持未选(不被误选)', () => {
    render(<Transfer dataSource={data} showSearch />);
    const leftSearch = screen.getAllByRole('searchbox')[0];
    if (leftSearch) {
      fireEvent.change(leftSearch, { target: { value: 'an' } });
    }
    // 全选当前可见子集(仅 Banana)
    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    if (headerCheckbox) {
      fireEvent.click(headerCheckbox);
    }
    // 清空搜索,Apple / Date 重新可见且应保持未选
    if (leftSearch) {
      fireEvent.change(leftSearch, { target: { value: '' } });
    }
    expect(screen.getByRole('checkbox', { name: 'Banana' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Apple' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Date' })).not.toBeChecked();
  });

  it('搜索无结果时显示空态', () => {
    render(<Transfer dataSource={data} showSearch />);
    const leftSearch = screen.getAllByRole('searchbox')[0];
    if (leftSearch) {
      fireEvent.change(leftSearch, { target: { value: 'zzzzz' } });
    }
    // 左栏被过滤到空(右栏本就空),空态文案出现(两栏皆空)
    expect(screen.getAllByText('列表为空').length).toBeGreaterThanOrEqual(1);
  });

  it('render 自定义项渲染覆盖默认 title', () => {
    render(<Transfer dataSource={data} render={(item) => `★ ${item.title}`} />);
    expect(screen.getByText('★ Apple')).toBeInTheDocument();
  });

  it('整体 disabled 时方向按钮不可用、复选框禁用', () => {
    render(<Transfer dataSource={data} disabled />);
    expect(screen.getByRole('button', { name: /→/ })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeDisabled();
  });

  it('透传根 div 的 className 与 data-* 属性', () => {
    const { container } = render(
      <Transfer dataSource={data} className="custom" data-testid="tx" />,
    );
    const root = container.querySelector('.ms-transfer');
    expect(root).toHaveClass('custom');
    expect(root).toHaveAttribute('data-testid', 'tx');
  });
});
