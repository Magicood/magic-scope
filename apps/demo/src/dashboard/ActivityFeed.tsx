import { Heading, Text, Timeline, TimelineItem } from '@magic-scope/react';
import { activity } from '../data/content';

export function ActivityFeed() {
  return (
    <div
      className="v-panel"
      style={{
        display: 'grid',
        gap: 'var(--ms-space-4)',
        minInlineSize: 0,
      }}
    >
      <Heading level={3} variant="subtitle">
        团队动态
      </Heading>

      <Timeline mode="left" lineStyle="solid">
        {activity.map((item) => (
          <TimelineItem
            key={item.id}
            variant={item.tone}
            time={
              <Text size="sm" style={{ color: 'var(--ms-color-fg-subtle)' }}>
                {item.when}
              </Text>
            }
          >
            <Text size="sm" leading="snug" style={{ minInlineSize: 0, overflowWrap: 'anywhere' }}>
              <Text as="span" weight="semibold">
                {item.who}
              </Text>{' '}
              {item.what}
            </Text>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}
