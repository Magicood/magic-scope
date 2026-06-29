import { Input } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [bio, setBio] = useState('产品设计师,负责设计系统');
  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(360px, 80vw)' }}>
      <Input clearable defaultValue="有值时出现清除按钮" placeholder="clearable 清除" />
      <Input
        showCount
        maxLength={20}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="showCount 字数统计"
      />
      <Input
        clearable
        showCount
        maxLength={20}
        defaultValue="清除 + 字数同时开"
        placeholder="clearable + showCount"
      />
    </div>
  );
}
