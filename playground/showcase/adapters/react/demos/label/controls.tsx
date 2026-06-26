import { Input, Label, Select, Textarea } from '@magic-scope/react';
import { useState } from 'react';

const schools = [
  { value: 'evocation', label: '塑能' },
  { value: 'conjuration', label: '咒法' },
  { value: 'enchantment', label: '惑控' },
];

export default function Demo() {
  const [school, setSchool] = useState('');
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(340px, 80vw)' }}>
      {/* 原生控件:htmlFor 关联,点标签聚焦 */}
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <Label htmlFor="ms-label-ctl-name" required>
          法师称号
        </Label>
        <Input id="ms-label-ctl-name" placeholder="如:奥术学者" aria-required />
      </div>

      {/* 自定义控件:label 用 id,控件用 aria-labelledby 关联 */}
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <Label id="ms-label-ctl-school">主修学派</Label>
        <Select
          options={schools}
          value={school}
          onChange={setSchool}
          placeholder="选择学派"
          aria-labelledby="ms-label-ctl-school"
        />
      </div>

      {/* 多行原生控件同样用 htmlFor */}
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <Label htmlFor="ms-label-ctl-note">备注</Label>
        <Textarea id="ms-label-ctl-note" rows={2} placeholder="记录些什么…" />
      </div>
    </div>
  );
}
