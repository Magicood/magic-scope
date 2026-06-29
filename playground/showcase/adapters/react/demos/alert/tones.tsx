import type { AlertVariant } from '@magic-scope/react';
import { Alert } from '@magic-scope/react';

// tone 色调系统:Alert 的 4 个 variant 各映射全库统一的 ms-tone-* 槽位,
// 经同一 tone resolver 派生柔和底色与起始边强调条;并按语义自动分流 role
// (danger/warning → alert 打断式播报,info/success → status 礼貌播报)。
// 此处用真实 title prop 渲染加粗标题行,展示同一结构在四种色调下的一致性。
const TONES: { variant: AlertVariant; title: string; body: string }[] = [
  { variant: 'info', title: '信息提示', body: '新版组件库已同步至本地缓存,可离线检索。' },
  { variant: 'success', title: '操作成功', body: '部署已完成,变更已发布到生产环境。' },
  { variant: 'warning', title: '需要注意', body: '本月 API 调用量已达套餐上限的 80%。' },
  { variant: 'danger', title: '严重警告', body: '检测到数据库连接异常,请立即检查服务状态。' },
];

export default function Demo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxInlineSize: 'min(32rem, 100%)',
      }}
    >
      {TONES.map(({ variant, title, body }) => (
        <Alert key={variant} variant={variant} title={title}>
          {body}
        </Alert>
      ))}
    </div>
  );
}
