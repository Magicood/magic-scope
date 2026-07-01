import { Button, Popconfirm } from '@magic-scope/react';
import { useState } from 'react';

// tone:语义色调,派生确认按钮配色与浮层发光(读 6 槽位,不写死)。
// icon:标题前的警示图标槽,强化语义。
// confirmLoading:受控 loading——这里用一个显式 state 驱动确认按钮的 loading,
// 模拟「点确认后请求外部审批,拿到回执前锁住按钮」,与内置异步态可叠加。
const TONES = [
  { tone: 'success', label: '发布上线', desc: '版本将对全部用户可见。' },
  { tone: 'warning', label: '归档项目', desc: '归档后转为只读,可随时恢复。' },
  { tone: 'info', label: '重新索引', desc: '将重建搜索索引,约需数分钟。' },
] as const;

export default function Demo() {
  const [log, setLog] = useState('(等待操作)');
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 受控 loading:点确认 → 置 loading → 1s 后收回并落库
  const handleControlledConfirm = () => {
    setConfirmLoading(true);
    setLog('提交审批 → 等待外部回执…');
    window.setTimeout(() => {
      setConfirmLoading(false);
      setLog('提交审批 → 已通过并落库');
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {TONES.map((item) => (
          <Popconfirm
            key={item.tone}
            tone={item.tone}
            trigger={<Button variant="outline">{item.label}</Button>}
            title={item.label}
            description={item.desc}
            icon={
              <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>
                ✦
              </span>
            }
            onConfirm={() => setLog(`${item.label} → 已确认(tone=${item.tone})`)}
          />
        ))}
      </div>

      <Popconfirm
        tone="primary"
        trigger={<Button variant="solid">提交审批(受控 loading)</Button>}
        title="提交这次审批?"
        description="确认后会向审批人发送请求,期间按钮保持 loading。"
        confirmText="提交"
        confirmLoading={confirmLoading}
        onConfirm={handleControlledConfirm}
      />

      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
        结果:{log}
      </p>
    </div>
  );
}
