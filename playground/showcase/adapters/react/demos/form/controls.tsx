import {
  Form,
  Input,
  NumberInput,
  RadioGroup,
  Rate,
  Segmented,
  Slider,
  Switch,
  useForm,
} from '@magic-scope/react';
import { useState } from 'react';

interface Values extends Record<string, unknown> {
  nick: string;
  level: number;
  element: string;
  plan: string;
  power: number;
  stars: number;
  newsletter: boolean;
}

const ELEMENTS = [
  { value: 'fire', label: '火' },
  { value: 'water', label: '水' },
  { value: 'wind', label: '风' },
];

/**
 * 控件适配器表演示:同一套 store 绑定经显式适配器注入到 value/onChange 形态各异的控件——
 * Input(value 字符串)、NumberInput(数值)、RadioGroup/Segmented(onValueChange)、
 * Slider(高频 onValueChange + 松手 onChangeEnd)、Rate(数值)、Switch(checked)。
 * 子控件不必再传 value,值由 defaultValues 设初值、store 接管。
 */
export default function Demo() {
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const form = useForm<Values>({
    defaultValues: {
      nick: '萌新',
      level: 3,
      element: 'fire',
      plan: 'pro',
      power: 40,
      stars: 4,
      newsletter: true,
    },
  });

  return (
    <Form
      form={form}
      layout="horizontal"
      labelWidth="5rem"
      onSubmit={(v) => setSnapshot(JSON.stringify(v))}
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(480px, 100%)' }}
    >
      <Form.Field name="nick" label="名号">
        <Input placeholder="名号" />
      </Form.Field>
      <Form.Field name="level" label="等级">
        <NumberInput min={1} max={99} />
      </Form.Field>
      <Form.Field name="element" label="元素">
        <RadioGroup options={ELEMENTS} aria-label="元素" />
      </Form.Field>
      <Form.Field name="plan" label="套餐">
        <Segmented options={['free', 'pro', 'max']} aria-label="套餐" />
      </Form.Field>
      <Form.Field name="power" label="法力">
        <Slider min={0} max={100} aria-label="法力" />
      </Form.Field>
      <Form.Field name="stars" label="评分">
        <Rate count={5} aria-label="评分" />
      </Form.Field>
      <Form.Field name="newsletter">
        <Switch>订阅奥术周报</Switch>
      </Form.Field>

      <Form.Submit>保存设置</Form.Submit>
      {snapshot && (
        <small style={{ color: 'var(--ms-color-fg-muted)', wordBreak: 'break-all' }}>
          {snapshot}
        </small>
      )}
    </Form>
  );
}
