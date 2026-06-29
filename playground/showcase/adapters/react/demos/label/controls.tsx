import { Input, Label, Select, Textarea } from '@magic-scope/react';
import { useState } from 'react';

const teams = [
  { value: 'frontend', label: '前端' },
  { value: 'backend', label: '后端' },
  { value: 'design', label: '设计' },
];

export default function Demo() {
  const [team, setTeam] = useState('');
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(340px, 80vw)' }}>
      {/* 原生控件:htmlFor 关联,点标签聚焦 */}
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <Label htmlFor="ms-label-ctl-name" required>
          显示名称
        </Label>
        <Input id="ms-label-ctl-name" placeholder="如:Mira Chen" aria-required />
      </div>

      {/* 自定义控件:label 用 id,控件用 aria-labelledby 关联 */}
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <Label id="ms-label-ctl-school">所属团队</Label>
        <Select
          options={teams}
          value={team}
          onChange={setTeam}
          placeholder="选择团队"
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
