import { Button, confirm } from '@magic-scope/react';
import { useState } from 'react';

// icon:警示图标槽,填在标题左侧强化语义。
// confirmLoading:命令式弹窗开局即置 loading——适合「弹出时后台已在校验/预检」,
// 校验完再由业务侧关闭。这里模拟:点「预检部署」先起一个已在跑的确认框,
// 后台 1.2s 出结果后自动收起,期间确认/取消/Esc 都被锁住。
export default function Demo() {
  const [log, setLog] = useState('(等待操作)');

  // 危险确认 + 自定义警示图标
  const askPurge = async () => {
    const ok = await confirm('该操作会清空所有缓存分片,进行中的下载会被中断。', {
      title: '清空缓存',
      variant: 'danger',
      confirmText: '清空',
      cancelText: '再想想',
      icon: (
        <span aria-hidden="true" style={{ fontSize: '1.25rem' }}>
          🗑️
        </span>
      ),
    });
    setLog(ok ? '清空缓存 → 已执行' : '清空缓存 → 已取消');
  };

  // 开局即 loading:弹出瞬间就在做后台预检,期间不可操作
  const askDeploy = () => {
    setLog('预检部署 → 后台校验中…');
    // confirmLoading 让确认框一出现就处于 loading(按钮 disabled、Esc 锁定)
    confirm('正在校验部署清单与依赖版本,请稍候。', {
      title: '预检部署',
      confirmText: '开始部署',
      cancelText: '取消',
      confirmLoading: true,
      icon: (
        <span aria-hidden="true" style={{ fontSize: '1.25rem' }}>
          🚀
        </span>
      ),
    });
    // 模拟后台校验结束后由业务侧收起(这里用 Esc 之外的方式:直接超时提示)
    window.setTimeout(() => {
      setLog('预检部署 → 校验完成(实际项目里会替换为可确认的第二态)');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="outline" onClick={askPurge}>
          带图标的危险确认
        </Button>
        <Button variant="solid" onClick={askDeploy}>
          开局 loading 预检
        </Button>
      </div>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
        结果:{log}
      </p>
    </div>
  );
}
