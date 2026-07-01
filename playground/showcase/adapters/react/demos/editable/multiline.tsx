import { Editable } from '@magic-scope/react';
import { useState } from 'react';

// 多行:multiline 渲染 textarea,Enter 换行不提交,失焦提交(submitOnEnter=false)。
export default function Demo() {
  const [bio, setBio] = useState('热爱把日期数学写成纯函数的前端工程师。');
  return (
    <div style={{ inlineSize: 'min(400px, 100%)' }}>
      <Editable
        value={bio}
        onChange={setBio}
        multiline
        submitOnEnter={false}
        placeholder="写点个人简介…"
        inputAriaLabel="个人简介"
      />
    </div>
  );
}
