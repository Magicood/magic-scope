import { describe, expect, it } from 'vitest';
import {
  clamp,
  createDisclosure,
  createRovingFocus,
  createStore,
  getInitials,
  resolveControlled,
} from './index';

describe('createStore', () => {
  it('getState / setState(值与函数式)/ subscribe / 取消订阅', () => {
    const s = createStore({ n: 0 });
    let calls = 0;
    const unsub = s.subscribe(() => {
      calls += 1;
    });
    s.setState({ n: 1 });
    expect(s.getState().n).toBe(1);
    expect(calls).toBe(1);
    s.setState((p) => ({ n: p.n + 1 }));
    expect(s.getState().n).toBe(2);
    expect(calls).toBe(2);
    unsub();
    s.setState({ n: 9 });
    expect(calls).toBe(2); // 取消订阅后不再通知
  });

  it('同一引用不触发通知', () => {
    const same = { n: 0 };
    const s = createStore(same);
    let calls = 0;
    s.subscribe(() => {
      calls += 1;
    });
    s.setState(same);
    expect(calls).toBe(0);
  });
});

describe('resolveControlled', () => {
  it('controlled 优先并标记 isControlled', () => {
    expect(resolveControlled('a', 'b')).toEqual({ value: 'a', isControlled: true });
    expect(resolveControlled(undefined, 'b')).toEqual({ value: 'b', isControlled: false });
  });

  it('falsy 但非 undefined 仍算受控', () => {
    expect(resolveControlled(false, true).isControlled).toBe(true);
    expect(resolveControlled(0, 9).value).toBe(0);
  });
});

describe('createDisclosure', () => {
  it('非受控:setOpen / toggle 改内部并回调', () => {
    const seen: boolean[] = [];
    const d = createDisclosure({ defaultOpen: false, onOpenChange: (o) => seen.push(o) });
    expect(d.getState().open).toBe(false);
    d.setOpen(true);
    expect(d.getState().open).toBe(true);
    d.toggle();
    expect(d.getState().open).toBe(false);
    expect(seen).toEqual([true, false]);
  });

  it('受控:不改内部,只回调', () => {
    const seen: boolean[] = [];
    const d = createDisclosure({ open: true, onOpenChange: (o) => seen.push(o) });
    expect(d.getState().open).toBe(true);
    d.setOpen(false);
    expect(d.getState().open).toBe(true); // 受控内部不变
    expect(seen).toEqual([false]);
  });

  it('同值不重复回调', () => {
    const seen: boolean[] = [];
    const d = createDisclosure({ defaultOpen: false, onOpenChange: (o) => seen.push(o) });
    d.setOpen(false);
    expect(seen).toEqual([]);
  });
});

describe('createRovingFocus', () => {
  const items = [{}, { disabled: true }, {}, {}]; // 0 ✓ / 1 ✗ / 2 ✓ / 3 ✓

  it('first / last 跳过 disabled', () => {
    const r = createRovingFocus(items);
    expect(r.first()).toBe(0);
    expect(r.last()).toBe(3);
  });

  it('next / prev 跳过 disabled', () => {
    const r = createRovingFocus(items);
    expect(r.next(0)).toBe(2);
    expect(r.prev(2)).toBe(0);
  });

  it('loop:末→首 / 首→末', () => {
    const r = createRovingFocus(items, { loop: true });
    expect(r.next(3)).toBe(0);
    expect(r.prev(0)).toBe(3);
  });

  it('不 loop:到边界停住', () => {
    const r = createRovingFocus(items, { loop: false });
    expect(r.next(3)).toBe(3);
    expect(r.prev(0)).toBe(0);
  });

  it('全 disabled / 空:返回 -1', () => {
    const r = createRovingFocus([{ disabled: true }, { disabled: true }]);
    expect(r.first()).toBe(-1);
    expect(r.last()).toBe(-1);
    expect(createRovingFocus([]).next(0)).toBe(-1);
  });
});

describe('util', () => {
  it('clamp', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it('getInitials', () => {
    expect(getInitials('Lyra Vex')).toBe('LV');
    expect(getInitials('Orin')).toBe('O');
    expect(getInitials('   ')).toBe('');
    expect(getInitials('a b c', 3)).toBe('ABC');
  });
});
