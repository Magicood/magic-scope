import type { ListMarkerType, ListSpacing, ListTone, ListVariant } from '@magic-scope/react';
import { List } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const variant = values.variant as ListVariant;
  const common = {
    variant,
    marker: values.marker as ListMarkerType,
    spacing: values.spacing as ListSpacing,
    tone: values.tone as ListTone,
    markerPosition: values.markerPosition as 'inside' | 'outside',
    glow: values.glow as boolean,
    style: { inlineSize: 'min(360px, 100%)' },
  };

  if (variant === 'description') {
    return (
      <List {...common}>
        <List.Term>并发请求数</List.Term>
        <List.Detail>单个客户端在同一时刻可发起的最大请求数量。</List.Detail>
        <List.Term>速率限制</List.Term>
        <List.Detail>在固定时间窗口内允许的请求次数,超出后返回 429。</List.Detail>
      </List>
    );
  }

  return (
    <List {...common}>
      <List.Item>创建项目并连接代码仓库</List.Item>
      <List.Item>配置构建命令与环境变量</List.Item>
      <List.Item>推送提交,触发自动部署</List.Item>
    </List>
  );
}

// 真实 demo 文件:同一文件既 import 渲染、又 ?raw 取源码(永不漂移)。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/list/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/list/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'list',
  Playground,
  demos: buildDemos(comps, reactSources),
};
