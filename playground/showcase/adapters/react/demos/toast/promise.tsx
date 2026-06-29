import { Button, toast } from '@magic-scope/react';

// 签名特性:toast.promise 跟踪一个 Promise —— 先弹常驻 loading,resolve 自动替换为 success、
// reject 替换为 danger,文案支持函数派生(拿到 value / error)。onClick 让整条可点击跳转。
function cast(shouldFail: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error('网络超时,请重试'));
      else resolve('生产环境');
    }, 1600);
  });
}

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(cast(false), {
            loading: '正在部署…',
            success: (target) => `已成功部署到「${target}」`,
            error: (err) => `部署失败:${(err as Error).message}`,
          })
        }
      >
        异步成功 promise
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(cast(true), {
            loading: '正在部署…',
            success: '部署完成',
            error: (err) => `部署失败:${(err as Error).message}`,
          })
        }
      >
        异步失败 promise
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info('点我查看详情', {
            description: '整条 toast 可点击,用于跳转或展开详情。',
            onClick: () => toast.success('已打开详情面板'),
          })
        }
      >
        整条可点击 onClick
      </Button>
    </div>
  );
}
