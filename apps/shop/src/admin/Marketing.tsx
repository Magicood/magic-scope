import {
  Avatar,
  Button,
  Calendar,
  DatePicker,
  Input,
  List,
  type MentionOption,
  Mentions,
  Popconfirm,
  Progress,
  Segmented,
  Statistic,
  Tag,
  type TagTone,
  TimePicker,
  Transfer,
  type TransferItem,
  toast,
} from '@magic-scope/react';
import { useMemo, useRef, useState } from 'react';
import { formatDate } from '../lib/format';
import './Marketing.css';

/* ============================================================================
 * Marketing —— 营销页:活动月历(Calendar)+ 受众搭建(Transfer)+
 * 进行中活动(List/Tag/Progress/Popconfirm)+ 公告撰写器(Mentions/
 * Segmented/DatePicker/TimePicker)。全部数据为静态 mock,发送均为假调度。
 * ========================================================================== */

/* ------------------------------ 活动月历数据 ------------------------------ */

type CampaignKind = 'launch' | 'newsletter' | 'vip';

interface CampaignDay {
  day: number;
  label: string;
  /** 日格内的短文案(格宽有限,完整名走点击 toast 与图例) */
  short: string;
  kind: CampaignKind;
}

/** 演示月固定为 2026-08;月内三个活动日打点。 */
const CAMPAIGN_YEAR = 2026;
const CAMPAIGN_MONTH = 7; // 0 起算 → 八月

const CAMPAIGN_DAYS: readonly CampaignDay[] = [
  { day: 7, label: 'Autumn lighting launch', short: 'Launch', kind: 'launch' },
  { day: 14, label: 'Newsletter #12', short: 'Issue #12', kind: 'newsletter' },
  { day: 21, label: 'VIP preview', short: 'VIP', kind: 'vip' },
];

/** mock 世界里的「今天」(与 metrics 数据末日对齐),避免动态 new Date() 漂移。 */
const DEMO_TODAY = new Date(2026, 7, 3);
/** 月历初始展示月:活动所在的 2026-08。 */
const PANEL_MONTH = new Date(CAMPAIGN_YEAR, CAMPAIGN_MONTH, 1);

function campaignFor(date: Date): CampaignDay | undefined {
  if (date.getFullYear() !== CAMPAIGN_YEAR || date.getMonth() !== CAMPAIGN_MONTH) {
    return undefined;
  }
  return CAMPAIGN_DAYS.find((c) => c.day === date.getDate());
}

/* ------------------------------ 受众分段数据 ------------------------------ */

interface AudienceSegment {
  key: string;
  title: string;
  count: number;
}

const SEGMENTS: readonly AudienceSegment[] = [
  { key: 'all', title: 'All subscribers', count: 4812 },
  { key: 'vip', title: 'VIP', count: 286 },
  { key: 'repeat', title: 'Repeat buyers', count: 1304 },
  { key: 'lapsed', title: 'Lapsed 90d', count: 942 },
  { key: 'ceramics', title: 'Ceramics lovers', count: 1168 },
  { key: 'lighting', title: 'Lighting lovers', count: 897 },
];

const SEGMENT_COUNT = new Map(SEGMENTS.map((s) => [s.key, s.count]));
const SEGMENT_ITEMS: TransferItem[] = SEGMENTS.map(({ key, title }) => ({ key, title }));

/* ------------------------------ 进行中的活动 ------------------------------ */

interface ActiveCampaign {
  id: string;
  name: string;
  status: string;
  tone: TagTone;
  sent: number;
}

const ACTIVE_CAMPAIGNS: readonly ActiveCampaign[] = [
  {
    id: 'cmp-clearance',
    name: 'Summer clearance — final days',
    status: 'Sending',
    tone: 'info',
    sent: 78,
  },
  { id: 'cmp-welcome', name: 'Welcome series', status: 'Ongoing', tone: 'success', sent: 63 },
  {
    id: 'cmp-restock',
    name: 'Back in stock — Orbe Bowl Set',
    status: 'Queued',
    tone: 'neutral',
    sent: 12,
  },
];

/* ------------------------------ 提及候选 ---------------------------------- */

/* 三位店员 + 两个商品名;label 即回填文本,icon 展示 Mentions 的候选装饰位。 */
const MENTION_OPTIONS: MentionOption[] = [
  {
    value: 'ava-martin',
    label: 'Ava Martin',
    description: 'Founder',
    icon: <Avatar name="Ava Martin" size={18} />,
  },
  {
    value: 'jonas-beck',
    label: 'Jonas Beck',
    description: 'Studio manager',
    icon: <Avatar name="Jonas Beck" size={18} />,
  },
  {
    value: 'maren-voss',
    label: 'Maren Voss',
    description: 'Support lead',
    icon: <Avatar name="Maren Voss" size={18} />,
  },
  { value: 'halo-table-lamp', label: 'Halo Table Lamp', description: 'Product' },
  { value: 'duna-vase', label: 'Duna Vase', description: 'Product' },
];

/** "HH:mm"(24 制)→ "9:30 AM" 展示文案。 */
function timeLabel(value: string): string {
  const [hh, mm] = value.split(':');
  const hour = Number(hh ?? '0');
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${mm ?? '00'} ${suffix}`;
}

/* -------------------------------- 页面本体 -------------------------------- */

export function Marketing() {
  // 月历选中日(受控,便于点击反馈)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // 受众:右栏(已选分段)key 集合
  const [audienceKeys, setAudienceKeys] = useState<string[]>(['vip', 'repeat']);
  // 撰写器字段
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState('email');
  const [sendDate, setSendDate] = useState<Date | null>(null);
  const [sendTime, setSendTime] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);

  const composerRef = useRef<HTMLElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);

  // 预估触达:已选分段人数直接加总(分段有重叠,只作近似值)
  const reach = useMemo(
    () => audienceKeys.reduce((sum, key) => sum + (SEGMENT_COUNT.get(key) ?? 0), 0),
    [audienceKeys],
  );

  /** 页头 "New campaign":滚到撰写器并聚焦主题输入。 */
  const focusComposer = () => {
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => subjectRef.current?.focus({ preventScroll: true }), 350);
  };

  /** 点到有活动标记的日期 → toast 报活动名。 */
  const handleCalendarChange = (date: Date) => {
    setSelectedDate(date);
    const campaign = campaignFor(date);
    if (campaign) {
      toast(campaign.label, { description: `Campaign day · ${formatDate(date.toISOString())}` });
    }
  };

  /** 假调度:校验主题后走 toast.promise 三态。 */
  const schedule = () => {
    if (!subject.trim()) {
      toast.error('Add a subject before scheduling.');
      subjectRef.current?.focus();
      return;
    }
    const when = sendDate
      ? `${formatDate(sendDate.toISOString())}${sendTime ? ` at ${timeLabel(sendTime)}` : ''}`
      : 'the next send window';
    setScheduling(true);
    const request = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1200);
    });
    void toast
      .promise(request, {
        loading: 'Scheduling…',
        success: `Scheduled for ${when}`,
        error: 'Scheduling failed — try again.',
      })
      .then(() => {
        setSubject('');
        setBody('');
        setScheduling(false);
      });
  };

  return (
    <div className="ad-content mk-page">
      <header className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Marketing</h1>
          <p className="ad-page-sub">Plan sends, build audiences and keep campaigns moving.</p>
        </div>
        <div className="ad-page-actions">
          <Button tone="primary" onClick={focusComposer}>
            New campaign
          </Button>
        </div>
      </header>

      <div className="ad-split mk-split">
        {/* ---------------- 左:活动月历 ---------------- */}
        <section className="ad-card" aria-label="Campaign calendar">
          <div className="mk-card-head">
            <div>
              <h2 className="ad-card-title">Campaign calendar</h2>
              <p className="mk-card-sub">August 2026 · three sends planned</p>
            </div>
          </div>
          <Calendar
            className="mk-calendar"
            size="fullscreen"
            locale="en-US"
            value={selectedDate}
            onChange={handleCalendarChange}
            defaultPanelDate={PANEL_MONTH}
            referenceDate={DEMO_TODAY}
            dateCellRender={(date) => {
              const campaign = campaignFor(date);
              if (!campaign) return null;
              return (
                <span className="mk-event" data-kind={campaign.kind}>
                  <span className="mk-event-dot" aria-hidden="true" />
                  <span className="mk-event-label">{campaign.short}</span>
                </span>
              );
            }}
          />
          <div className="mk-legend">
            {CAMPAIGN_DAYS.map((campaign) => (
              <span key={campaign.day} className="mk-legend-item" data-kind={campaign.kind}>
                <span className="mk-event-dot" aria-hidden="true" />
                {`Aug ${campaign.day} · ${campaign.label}`}
              </span>
            ))}
          </div>
        </section>

        {/* ---------------- 右:受众搭建 + 进行中活动 ---------------- */}
        <div className="mk-side">
          <section className="ad-card" aria-label="Audience builder">
            <div className="mk-card-head">
              <div>
                <h2 className="ad-card-title">Audience builder</h2>
                <p className="mk-card-sub">Move segments right to include them.</p>
              </div>
            </div>
            <Transfer
              dataSource={SEGMENT_ITEMS}
              targetKeys={audienceKeys}
              onChange={(next) => setAudienceKeys(next)}
              titles={['Segments', 'Selected']}
              render={(item) => (
                <span className="mk-seg">
                  <span className="mk-seg-name">{item.title}</span>
                  <span className="mk-seg-count">
                    {(SEGMENT_COUNT.get(item.key) ?? 0).toLocaleString('en-US')}
                  </span>
                </span>
              )}
            />
            <div className="mk-reach">
              <Statistic
                size="sm"
                title="Estimated reach"
                value={reach}
                precision={0}
                animateOnMount
              />
              <p className="mk-reach-note">Segments overlap — treat the sum as approx.</p>
            </div>
          </section>

          <section className="ad-card" aria-label="Active campaigns">
            <div className="mk-card-head">
              <div>
                <h2 className="ad-card-title">Active campaigns</h2>
                <p className="mk-card-sub">Live and queued sends.</p>
              </div>
            </div>
            <List marker="none" spacing="none" className="mk-campaign-list">
              {ACTIVE_CAMPAIGNS.map((campaign) => (
                <List.Item key={campaign.id} className="mk-campaign">
                  <div className="mk-campaign-top">
                    <span className="mk-campaign-name">{campaign.name}</span>
                    <Tag size="sm" tone={campaign.tone}>
                      {campaign.status}
                    </Tag>
                  </div>
                  <Progress
                    value={campaign.sent}
                    size="sm"
                    aria-label={`${campaign.name} — ${campaign.sent}% sent`}
                  />
                  <div className="mk-campaign-foot">
                    <span className="mk-campaign-sent">{campaign.sent}% sent</span>
                    <Popconfirm
                      trigger={
                        <Button variant="ghost" size="sm">
                          Pause
                        </Button>
                      }
                      title="Pause this campaign?"
                      description="Recipients already queued will still receive it."
                      confirmText="Pause"
                      placement="top-end"
                      onConfirm={() => {
                        toast(`Paused “${campaign.name}”`);
                      }}
                    />
                  </div>
                </List.Item>
              ))}
            </List>
          </section>
        </div>
      </div>

      {/* ---------------- 底:公告撰写器 ---------------- */}
      <section className="ad-card mk-composer" aria-label="Announcement composer" ref={composerRef}>
        <div className="mk-card-head">
          <div>
            <h2 className="ad-card-title">Announcement composer</h2>
            <p className="mk-card-sub">
              Draft a note to your list — type @ to mention a teammate or product.
            </p>
          </div>
        </div>
        <div className="mk-composer-fields">
          <Input
            ref={subjectRef}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Subject — e.g. The autumn lighting edit"
            aria-label="Subject"
          />
          <Mentions
            value={body}
            onChange={setBody}
            options={MENTION_OPTIONS}
            rows={4}
            placeholder="Write the announcement. Mention @Ava Martin or @Halo Table Lamp."
            aria-label="Announcement body"
          />
          <div className="mk-composer-row">
            <Segmented
              size="sm"
              value={channel}
              onValueChange={setChannel}
              options={[
                { value: 'email', label: 'Email' },
                { value: 'sms', label: 'SMS' },
              ]}
              aria-label="Channel"
            />
            <DatePicker
              size="sm"
              locale="en-US"
              value={sendDate}
              onChange={setSendDate}
              placeholder="Send date"
            />
            <TimePicker
              size="sm"
              value={sendTime}
              onChange={(next) => setSendTime(next)}
              showSecond={false}
              minuteStep={5}
              clearable
              placeholder="Send time"
            />
            <span className="mk-composer-spacer" />
            <span className="mk-composer-note">Sends are mocked in this demo.</span>
            <Button tone="primary" loading={scheduling} onClick={schedule}>
              Schedule
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
