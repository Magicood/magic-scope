// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Descriptions } from './Descriptions';
import { isResponsiveColumns, normalizeColumns, resolveRows, spreadColumnVars } from './logic';

describe('Descriptions logic（纯逻辑层）', () => {
  it('isResponsiveColumns / normalizeColumns:单值落 base,断点对象保留并补 base 兜底', () => {
    expect(isResponsiveColumns(3)).toBe(false);
    expect(isResponsiveColumns({ base: 1, md: 3 })).toBe(true);
    // 无合法断点键的对象不算响应式
    expect(isResponsiveColumns({ foo: 1 } as never)).toBe(false);

    expect(normalizeColumns(3, 3)).toEqual({ base: 3 });
    expect(normalizeColumns({ base: 1, lg: 4 }, 3)).toEqual({ base: 1, lg: 4 });
    // 响应式对象缺 base 时补 fallback base
    expect(normalizeColumns({ md: 2 }, 3)).toEqual({ base: 3, md: 2 });
    expect(normalizeColumns(undefined, 3)).toEqual({ base: 3 });
  });

  it('spreadColumnVars:只为提供的断点写 --ms-desc-cols-<bp> 变量(级联在 CSS 里做)', () => {
    expect(spreadColumnVars({ base: 1, md: 3 }, 3)).toEqual({
      '--ms-desc-cols-base': '1',
      '--ms-desc-cols-md': '3',
    });
    // 单值 → 仅 base
    expect(spreadColumnVars(2, 3)).toEqual({ '--ms-desc-cols-base': '2' });
  });

  it('resolveRows:按 base 列数折行,行末补 filler 占满,span 跨列', () => {
    const rows = resolveRows(
      [
        { label: 'A', value: '1' },
        { label: 'B', value: '2' },
        { label: 'C', value: '3' },
      ],
      3,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveLength(3);
    expect(rows[0]?.every((c) => !c.filler)).toBe(true);
  });

  it('resolveRows:span 超出本行剩余 → 换行,前一行补 filler 撑满', () => {
    const rows = resolveRows(
      [
        { label: 'A', value: '1' }, // 占 1,行剩 2
        { label: 'B', value: '2', span: 3 }, // span 3 > 剩余 2 → 换行
      ],
      3,
    );
    expect(rows).toHaveLength(2);
    // 第一行:A(1) + filler(2)
    expect(rows[0]).toHaveLength(2);
    expect(rows[0]?.[1]?.filler).toBe(true);
    expect(rows[0]?.[1]?.span).toBe(2);
    // 第二行:B 的 span 被截断到列数 3
    expect(rows[1]?.[0]?.span).toBe(3);
    expect(rows[1]?.[0]?.filler).toBe(false);
  });

  it('resolveRows:单项 span 超过总列数 → 收窄到总列数(不溢出)', () => {
    const rows = resolveRows([{ label: 'wide', value: 'x', span: 99 }], 2);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.[0]?.span).toBe(2);
  });
});

describe('Descriptions 组件', () => {
  it('items 入口:渲染 label / value;空内容渲染占位短横', () => {
    render(
      <Descriptions
        items={[
          { label: '姓名', value: '张三' },
          { label: '邮箱' }, // 无 value → 占位
        ]}
      />,
    );
    expect(screen.getByText('姓名')).toBeInTheDocument();
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('邮箱')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('Descriptions.Item 复合子组件入口:等价于 items', () => {
    render(
      <Descriptions>
        <Descriptions.Item label="状态" value="在线" />
        <Descriptions.Item label="角色">管理员</Descriptions.Item>
      </Descriptions>,
    );
    expect(screen.getByText('状态')).toBeInTheDocument();
    expect(screen.getByText('在线')).toBeInTheDocument();
    expect(screen.getByText('角色')).toBeInTheDocument();
    // children 作为 value 别名
    expect(screen.getByText('管理员')).toBeInTheDocument();
  });

  it('空态:无 items 走 i18n empty.description 默认文案', () => {
    render(<Descriptions items={[]} />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('bordered / size / layout / tone 落到根 class;colon 仅 horizontal 生效', () => {
    const { container, rerender } = render(
      <Descriptions
        bordered
        size="lg"
        layout="horizontal"
        tone="success"
        items={[{ label: 'x', value: 'y' }]}
      />,
    );
    const root = container.querySelector('.ms-descriptions');
    expect(root).toHaveClass('ms-descriptions--bordered');
    expect(root).toHaveClass('ms-descriptions--lg');
    expect(root).toHaveClass('ms-descriptions--horizontal');
    expect(root).toHaveClass('ms-tone-success');
    expect(root).toHaveClass('ms-descriptions--colon');

    // vertical 下 colon class 不应出现
    rerender(<Descriptions layout="vertical" items={[{ label: 'x', value: 'y' }]} />);
    expect(container.querySelector('.ms-descriptions')).not.toHaveClass('ms-descriptions--colon');
  });

  it('响应式 columns:断点对象摊成 CSS 变量写到根 style', () => {
    const { container } = render(
      <Descriptions columns={{ base: 1, md: 2, lg: 3 }} items={[{ label: 'a', value: 'b' }]} />,
    );
    const root = container.querySelector<HTMLElement>('.ms-descriptions');
    expect(root?.style.getPropertyValue('--ms-desc-cols-base')).toBe('1');
    expect(root?.style.getPropertyValue('--ms-desc-cols-md')).toBe('2');
    expect(root?.style.getPropertyValue('--ms-desc-cols-lg')).toBe('3');
  });

  it('title / extra 槽渲染;多态 as 渲染指定标签;forwardRef 到根;...rest 透传', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Descriptions
        ref={ref}
        as="section"
        title="用户信息"
        extra={<button type="button">编辑</button>}
        data-testid="desc"
        items={[{ label: 'a', value: 'b' }]}
      />,
    );
    expect(screen.getByText('用户信息')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '编辑' })).toBeInTheDocument();
    const root = container.querySelector('.ms-descriptions');
    expect(root?.tagName).toBe('SECTION');
    expect(root).toHaveAttribute('data-testid', 'desc');
    expect(ref.current).toBe(root);
  });
});
