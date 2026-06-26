import { Switch } from '@magic-scope/react';
import { useState } from 'react';

// 轨道内两端图标(checkedIcon / uncheckedIcon,随开关状态显隐)+ loading 加载态:
// 滑块转为旋转符文、禁用交互并标记 aria-busy。
export default function Demo() {
  const [theme, setTheme] = useState(true);
  const [syncing, setSyncing] = useState(true);

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Switch
        checked={theme}
        onChange={(e) => setTheme(e.target.checked)}
        checkedIcon="☾"
        uncheckedIcon="☼"
        tone="accent"
        aria-label="切换主题"
      >
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>主题:{theme ? '暗夜' : '白昼'}</span>
      </Switch>

      <Switch loading={syncing} defaultChecked tone="info" aria-label="同步开关">
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>{syncing ? '同步中…' : '已同步'}</span>
      </Switch>

      <button
        type="button"
        onClick={() => setSyncing((v) => !v)}
        style={{ font: 'inherit', cursor: 'pointer' }}
      >
        {syncing ? '结束同步' : '重新同步'}
      </button>
    </div>
  );
}
