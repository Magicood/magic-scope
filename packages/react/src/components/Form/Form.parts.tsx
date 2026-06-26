import type { ReactElement, ReactNode } from 'react';
import { forwardRef, useRef, useSyncExternalStore } from 'react';
import { useMessages } from '../../i18n';
import { Button, type ButtonProps } from '../Button';
import { useWatch } from './Field';
import { useFormContext } from './Form';
import type { FormMeta } from './logic';

/** 订阅全表 meta(Submit/Reset/ErrorSummary 用)。 */
function useFormState(): FormMeta {
  const { store } = useFormContext();
  return useSyncExternalStore(store.subscribe, store.getFormMeta, store.getFormMeta);
}

/** Form.Submit —— 提交按钮,type=submit,自动随 isSubmitting loading/禁用。复用 Button 全部能力。 */
export const Submit = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { isSubmitting } = useFormState();
  return <Button ref={ref} {...props} type="submit" loading={isSubmitting || !!props.loading} />;
});
Submit.displayName = 'Form.Submit';

/** Form.Reset —— 重置按钮,调 store.reset(回默认值)。type=button(不走原生 reset,store 是真相源)。 */
export const Reset = forwardRef<HTMLButtonElement, ButtonProps>(({ onClick, ...props }, ref) => {
  const { store } = useFormContext();
  return (
    <Button
      ref={ref}
      variant="soft"
      {...props}
      type="button"
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) store.reset();
      }}
    />
  );
});
Reset.displayName = 'Form.Reset';

/** Form.List 渲染 API。 */
export interface FormListApi {
  /** 当前各行(稳定 id + 该行 path 前缀)。 */
  fields: Array<{ id: string; name: string }>;
  /** 追加一行(给初值)。 */
  append: (value: unknown) => void;
  /** 删除第 i 行。 */
  remove: (index: number) => void;
  /** 把第 from 行移到 to。 */
  move: (from: number, to: number) => void;
}

export interface FormListProps {
  /** 数组字段路径。 */
  name: string;
  /** 渲染函数:拿到稳定 id 列表与增删移动 API。 */
  children: (api: FormListApi) => ReactNode;
}

/**
 * Form.List —— 动态字段数组。基于 path 前缀 `items.0.x`,每行持稳定 id(增删移动时 id 跟随,
 * 避免 store 切片订阅与 DOM 错位)。值仍存 store(唯一真相源)。
 */
export function FormList({ name, children }: FormListProps): ReactElement {
  const { store } = useFormContext();
  const value = useWatch(name);
  const arr: unknown[] = Array.isArray(value) ? value : [];

  // 稳定 id 列表(随长度增减;reorder 时跟随重排)
  const idsRef = useRef<string[]>([]);
  const seqRef = useRef(0);
  while (idsRef.current.length < arr.length) idsRef.current.push(`${name}-${seqRef.current++}`);
  if (idsRef.current.length > arr.length) idsRef.current.length = arr.length;

  const fields = arr.map((_, i) => ({ id: idsRef.current[i] as string, name: `${name}.${i}` }));

  // 增删移动都基于 store 最新值(而非渲染期闭包 arr),避免同 tick 连点丢值
  const current = (): unknown[] => {
    const v = store.getValue(name);
    return Array.isArray(v) ? v : [];
  };
  const api: FormListApi = {
    fields,
    append: (v) => {
      idsRef.current.push(`${name}-${seqRef.current++}`);
      store.setValue(name, [...current(), v]);
    },
    remove: (index) => {
      const next = current().slice();
      next.splice(index, 1);
      idsRef.current.splice(index, 1);
      store.setValue(name, next);
    },
    move: (from, to) => {
      const next = current().slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      const [id] = idsRef.current.splice(from, 1);
      if (id !== undefined) idsRef.current.splice(to, 0, id);
      store.setValue(name, next);
    },
  };

  return <>{children(api)}</>;
}
FormList.displayName = 'Form.List';

export interface FormErrorSummaryProps {
  /** 标题(不传用 i18n 默认「表单有 N 处错误」)。 */
  title?: ReactNode;
  /** 根 className。 */
  className?: string;
}

/**
 * Form.ErrorSummary —— 提交后错误汇总。role=region + aria-live=polite,点条目聚焦/滚动到对应字段
 * (聚焦意图来自 store.firstErrorPath 同源的 ref,DOM 副作用留壳)。
 */
export const FormErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>(
  ({ title, className }, ref) => {
    const { store } = useFormContext();
    const { errors } = useFormState();
    const t = useMessages();
    const entries = Object.entries(errors);
    if (entries.length === 0) return null;

    return (
      // biome-ignore lint/a11y/useSemanticElements: 错误汇总需 role=region + aria-live=polite 作动态播报区,用 div 承载 live region 语义
      <div
        ref={ref}
        role="region"
        aria-live="polite"
        className={['ms-form__error-summary', 'ms-tone-danger', className]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="ms-form__error-summary-title">
          {title ?? t('form.errorSummary', { count: entries.length })}
        </div>
        <ul className="ms-form__error-summary-list">
          {entries.map(([path, err]) => (
            <li key={path}>
              <button
                type="button"
                className="ms-form__error-summary-item"
                onClick={() => {
                  const handle = store.getState().errors[path]?.ref;
                  handle?.focus();
                  handle?.scrollIntoView?.({ block: 'center' });
                }}
              >
                {err.message}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  },
);
FormErrorSummary.displayName = 'Form.ErrorSummary';
