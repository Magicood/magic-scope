import { Form, Input, useForm } from '@magic-scope/react';
import { useState } from 'react';

interface Values extends Record<string, unknown> {
  handle: string;
}

const TAKEN = ['admin', 'mira', 'jonas'];

/** 模拟一次远端查重(自带防抖 + 竞态取消,旧请求会被 AbortSignal 取消)。 */
function checkRemote(name: string, signal?: AbortSignal): Promise<true | string> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      if (TAKEN.includes(name.toLowerCase())) resolve('该用户名已被占用');
      else resolve(true);
    }, 700);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
}

/**
 * 异步校验 + 整表禁用:validate 返回 Promise,引擎自带防抖与竞态取消;校验进行中 isValidating
 * 为真(此处用本地态显示「校验中…」)。底部开关演示整表 disabled 下发到各控件。
 */
export default function Demo() {
  const [locked, setLocked] = useState(false);
  const form = useForm<Values>({
    defaultValues: { handle: '' },
    mode: 'onChange',
    delayError: 400,
    rules: {
      handle: {
        required: true,
        minLength: 3,
        validate: async (v, ctx) => checkRemote(String(v), ctx.signal),
      },
    },
  });

  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(440px, 100%)' }}
    >
      <Form
        form={form}
        disabled={locked}
        onSubmit={() => alert('用户名可用,注册成功!')}
        style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)' }}
      >
        <Form.Field
          name="handle"
          label="用户名"
          required
          help="输入后约 0.7s 远端查重;试试 mira / jonas(已占用)。"
        >
          {(field, state) => (
            <div style={{ display: 'grid', gap: '0.3rem' }}>
              <Input
                {...(field.fieldProps as Record<string, unknown>)}
                placeholder="3 个字符以上"
              />
              {state.isValidating && (
                <small style={{ color: 'var(--ms-color-fg-muted)' }}>校验中…</small>
              )}
            </div>
          )}
        </Form.Field>
        <Form.Submit>注册</Form.Submit>
      </Form>

      <label
        style={{
          display: 'flex',
          gap: '0.4rem',
          alignItems: 'center',
          color: 'var(--ms-color-fg-muted)',
          fontSize: '0.85rem',
        }}
      >
        <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
        整表禁用 disabled
      </label>
    </div>
  );
}
