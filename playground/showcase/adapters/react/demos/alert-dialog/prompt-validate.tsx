import { Button, prompt } from '@magic-scope/react';
import { useState } from 'react';

// inputType:把原生 <input type> 平移进来——password 打码、number 触发数字键盘/步进。
// validate:实时校验,返回非空串即「无效」——拦截确认、禁用按钮并把串作为错误提示展示;
// 返回 undefined 视为有效放行。两者组合成一个可用的受控输入弹窗。
export default function Demo() {
  const [log, setLog] = useState('(等待输入)');

  // 密码输入 + 强度校验:inputType=password 打码,validate 拦截弱密码
  const setPassword = async () => {
    const pwd = await prompt('为这个空间设置访问密码:', {
      title: '设置密码',
      inputType: 'password',
      placeholder: '至少 8 位,含字母与数字',
      confirmText: '保存',
      validate: (v) => {
        if (v.length < 8) return '密码至少 8 位';
        if (!/[a-zA-Z]/.test(v) || !/[0-9]/.test(v)) return '需同时包含字母和数字';
        return undefined;
      },
    });
    if (pwd !== null) setLog(`密码已设置(长度 ${pwd.length},已打码保存)`);
  };

  // 数字输入 + 范围校验:inputType=number,validate 限制 1–20 之间
  const setSeats = async () => {
    const seats = await prompt('本次分配多少个席位?', {
      title: '分配席位',
      inputType: 'number',
      defaultValue: '5',
      confirmText: '分配',
      validate: (v) => {
        const n = Number(v);
        if (v.trim() === '' || Number.isNaN(n)) return '请输入数字';
        if (!Number.isInteger(n)) return '席位必须是整数';
        if (n < 1 || n > 20) return '席位需在 1–20 之间';
        return undefined;
      },
    });
    if (seats !== null) setLog(`已分配 ${seats} 个席位`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="solid" onClick={setPassword}>
          密码 prompt(带强度校验)
        </Button>
        <Button variant="outline" onClick={setSeats}>
          数字 prompt(带范围校验)
        </Button>
      </div>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
        结果:{log}
      </p>
    </div>
  );
}
