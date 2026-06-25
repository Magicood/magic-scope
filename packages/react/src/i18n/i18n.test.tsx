// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  defaultMessages,
  formatMessage,
  MessagesProvider,
  resolveMessage,
  translate,
  useMessages,
} from './index';

function Probe({
  k,
  vars,
}: {
  k: Parameters<ReturnType<typeof useMessages>>[0];
  vars?: Record<string, string | number>;
}) {
  const t = useMessages();
  return <span data-testid="out">{t(k, vars)}</span>;
}

describe('i18n / 纯函数', () => {
  it('formatMessage 插值,缺变量原样保留', () => {
    expect(formatMessage('已选 {count} 项', { count: 3 })).toBe('已选 3 项');
    expect(formatMessage('创建 “{query}”', { query: 'foo' })).toBe('创建 “foo”');
    expect(formatMessage('第 {page} 页')).toBe('第 {page} 页'); // 无 vars 原样
    expect(formatMessage('{a} {b}', { a: 'x' })).toBe('x {b}'); // 缺 b 保留
  });

  it('resolveMessage:覆盖优先 → 默认表 → fallback', () => {
    expect(resolveMessage({}, 'input.clear')).toBe('清除'); // 默认表
    expect(resolveMessage({ 'input.clear': '清空' }, 'input.clear')).toBe('清空'); // 覆盖
    expect(
      resolveMessage({ 'table.selectRow': '选第 {index} 行' }, 'table.selectRow', { index: 2 }),
    ).toBe('选第 2 行');
  });

  it('defaultMessages 覆盖所有登记的 key(非空字符串)', () => {
    for (const v of Object.values(defaultMessages)) {
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    }
  });
});

describe('i18n / React 绑定', () => {
  it('useMessages 默认取 zh-CN', () => {
    render(<Probe k="select.placeholder" />);
    expect(screen.getByTestId('out')).toHaveTextContent('请选择…');
  });

  it('MessagesProvider 覆盖文案,且支持插值', () => {
    render(
      <MessagesProvider
        messages={{ 'select.placeholder': 'Pick one', 'select.selected': '选了 {count} 个' }}
      >
        <Probe k="select.placeholder" />
      </MessagesProvider>,
    );
    expect(screen.getByTestId('out')).toHaveTextContent('Pick one');
  });

  it('嵌套 Provider 合并父级(未覆盖项回退父级)', () => {
    render(
      <MessagesProvider messages={{ 'select.placeholder': '外层' }}>
        <MessagesProvider messages={{ 'select.empty': '空' }}>
          <Probe k="select.placeholder" />
        </MessagesProvider>
      </MessagesProvider>,
    );
    expect(screen.getByTestId('out')).toHaveTextContent('外层');
  });

  it('命令式通道:Provider 挂载后 translate() 反映当前字典', () => {
    expect(translate('alertDialog.confirm')).toBe('确定'); // 默认
    render(
      <MessagesProvider messages={{ 'alertDialog.confirm': 'OK' }}>
        <span>x</span>
      </MessagesProvider>,
    );
    expect(translate('alertDialog.confirm')).toBe('OK'); // effect 已写入模块单例
  });
});
