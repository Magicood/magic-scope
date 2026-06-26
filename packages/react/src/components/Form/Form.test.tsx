// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../Checkbox';
import { Input } from '../Input';
import { Field, Form, useForm, useWatch } from './index';

type Values = {
  name: string;
  agree: boolean;
  nick: string;
};

function Harness({
  onValid = () => {},
  onInvalid = () => {},
  disabled = false,
}: {
  onValid?: (v: Values) => void;
  onInvalid?: () => void;
  disabled?: boolean;
}) {
  const form = useForm<Values>({
    defaultValues: { name: '', agree: false, nick: '' },
    mode: 'onSubmit',
  });
  return (
    <Form form={form} onSubmit={onValid} onInvalid={onInvalid} disabled={disabled}>
      <Form.Field name="name" label="姓名" rule={{ required: true }} help="真实姓名">
        <Input placeholder="名字" />
      </Form.Field>
      <Form.Field name="agree">
        <Checkbox>同意</Checkbox>
      </Form.Field>
      <Form.Field name="nick" label="昵称">
        {(field) => (
          <input
            data-testid="nick"
            value={String(field.value ?? '')}
            onChange={(e) => field.setValue(e.target.value)}
          />
        )}
      </Form.Field>
      <Form.Submit>提交</Form.Submit>
      <Form.Reset>重置</Form.Reset>
    </Form>
  );
}

describe('Form 集成', () => {
  it('Label 经 htmlFor 关联控件,help/error id 连 aria-describedby', () => {
    render(<Harness />);
    const input = screen.getByRole('textbox', { name: /姓名/ });
    expect(input).toBeInTheDocument();
    // help 已连入 aria-describedby
    expect(input.getAttribute('aria-describedby')).toContain('-help');
  });

  it('直接子控件注入:输入写回 store,提交拿到值', async () => {
    const onValid = vi.fn();
    render(<Harness onValid={onValid} />);
    fireEvent.change(screen.getByRole('textbox', { name: /姓名/ }), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByTestId('nick'), { target: { value: 'lovelace' } });
    fireEvent.click(screen.getByRole('checkbox', { name: '同意' }));
    fireEvent.click(screen.getByText('提交'));
    await waitFor(() =>
      expect(onValid).toHaveBeenCalledWith({ name: 'Ada', agree: true, nick: 'lovelace' }),
    );
  });

  it('必填校验:提交空值显示默认 i18n 文案 + 不调 onValid + 调 onInvalid', async () => {
    const onValid = vi.fn();
    const onInvalid = vi.fn();
    render(<Harness onValid={onValid} onInvalid={onInvalid} />);
    fireEvent.click(screen.getByText('提交'));
    await screen.findByText('此项为必填项');
    expect(onValid).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalled();
  });

  it('required 对未勾选 checkbox 触发(false 视为未填)', async () => {
    function CbForm() {
      const form = useForm<{ ok: boolean }>({ defaultValues: { ok: false }, mode: 'onSubmit' });
      return (
        <Form form={form} onSubmit={() => {}}>
          <Form.Field name="ok" rule={{ required: '必须勾选' }}>
            <Checkbox>同意条款</Checkbox>
          </Form.Field>
          <Form.Submit>提交</Form.Submit>
        </Form>
      );
    }
    render(<CbForm />);
    fireEvent.click(screen.getByText('提交'));
    await screen.findByText('必须勾选');
  });

  it('出错时控件 aria-invalid=true,error 容器 role=alert 且被 describedby 指向', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('提交'));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('此项为必填项');
    const input = screen.getByRole('textbox', { name: /姓名/ });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toContain(alert.id);
  });

  it('提交失败聚焦首个错误字段', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('提交'));
    await screen.findByText('此项为必填项');
    await waitFor(() => expect(screen.getByRole('textbox', { name: /姓名/ })).toHaveFocus());
  });

  it('required 落 Label 必填标记 + aria-required', () => {
    render(<Harness />);
    // Label 渲染 * 必填标记(sr 文案「必填」)
    expect(screen.getByText('必填')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /姓名/ })).toHaveAttribute('aria-required', 'true');
  });

  it('整表 disabled 下发到控件', () => {
    render(<Harness disabled />);
    expect(screen.getByRole('textbox', { name: /姓名/ })).toBeDisabled();
  });

  it('reset 清回默认值', async () => {
    render(<Harness />);
    const input = screen.getByRole('textbox', { name: /姓名/ }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'X' } });
    expect(input.value).toBe('X');
    fireEvent.click(screen.getByText('重置'));
    await waitFor(() => expect(input.value).toBe(''));
  });

  it('useWatch 跨字段联动:谁订谁渲', () => {
    function Watcher() {
      const v = useWatch('name');
      return <div data-testid="watch">{String(v ?? '')}</div>;
    }
    function WForm() {
      const form = useForm<Values>({ defaultValues: { name: '', agree: false, nick: '' } });
      return (
        <Form form={form}>
          <Field name="name" label="姓名">
            <Input />
          </Field>
          <Watcher />
        </Form>
      );
    }
    render(<WForm />);
    fireEvent.change(screen.getByRole('textbox', { name: /姓名/ }), { target: { value: 'Grace' } });
    expect(screen.getByTestId('watch')).toHaveTextContent('Grace');
  });

  it('useForm/Form 子部件在 Form 外使用抛错', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <Field name="x">
          <Input />
        </Field>,
      ),
    ).toThrow(/必须在 <Form> 内/);
    spy.mockRestore();
  });
});
