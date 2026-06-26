import { useState } from 'react';
import type { Control, ControlValues } from './types';

/** 由 Control[] 推出初始值字典。 */
function initialValues(controls: Control[]): ControlValues {
  const out: ControlValues = {};
  for (const c of controls) {
    out[c.prop] = c.default;
  }
  return out;
}

/**
 * 把 Control[] 变成一份可读写的实时值 + setter。
 * 调用方应给承载它的视图按组件 id 设 key,切换组件时整体重挂载即自动复位,无需手动 reset。
 */
export function useControls(controls: Control[]) {
  const [values, setValues] = useState<ControlValues>(() => initialValues(controls));

  const set = (prop: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [prop]: value }));
  };

  const reset = () => setValues(initialValues(controls));

  return { values, set, reset };
}
