import { Form, Input, useForm } from '@magic-scope/react';

interface Values extends Record<string, unknown> {
  name: string;
  email: string;
  age: string;
  site: string;
}

/**
 * 内建 rules 双轨校验:零依赖、可叠加约束(required / minLength / email / pattern / 自定义 validate),
 * mode="onTouched" 让首次校验在失焦后触发,出错后随输入实时复验;失败态发光 + 错误 role=alert 滑入。
 */
export default function Demo() {
  const form = useForm<Values>({
    defaultValues: { name: '', email: '', age: '', site: '' },
    mode: 'onTouched',
  });

  return (
    <Form
      form={form}
      onSubmit={() => alert('全部校验通过!')}
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(440px, 100%)' }}
    >
      <Form.Field name="name" label="名号" required rule={{ required: true, minLength: 2 }}>
        <Input placeholder="至少 2 个字符" />
      </Form.Field>

      <Form.Field name="email" label="邮箱" required rule={{ required: true, email: true }}>
        <Input placeholder="you@example.com" />
      </Form.Field>

      <Form.Field
        name="age"
        label="年龄"
        rule={{
          pattern: /^\d+$/,
          validate: (v) => (Number(v) >= 18 ? true : '需年满 18 岁'),
        }}
        help="选填,需为大于等于 18 的整数。"
      >
        <Input placeholder="18" />
      </Form.Field>

      <Form.Field name="site" label="个人主页" rule={{ url: true }}>
        <Input placeholder="https://..." />
      </Form.Field>

      <Form.Submit>校验并提交</Form.Submit>
    </Form>
  );
}
