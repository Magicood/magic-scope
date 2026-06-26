import { Alert, Button } from '@magic-scope/react';
import { ActivityFeed } from './ActivityFeed';
import { EventsTable } from './EventsTable';
import { KpiCards } from './KpiCards';
import { TrafficPanel } from './TrafficPanel';

export function Overview() {
  return (
    <>
      <Alert
        variant="warning"
        title="支付失败率超过阈值"
        dismissible
        action={
          <Button size="sm" variant="soft" tone="warning">
            查看详情
          </Button>
        }
      >
        过去 30 分钟内支付失败率达到 2.3%,已触发告警规则「payment-health」。
      </Alert>

      <KpiCards />
      <TrafficPanel />

      <div className="v-content__cols">
        <EventsTable />
        <ActivityFeed />
      </div>
    </>
  );
}
