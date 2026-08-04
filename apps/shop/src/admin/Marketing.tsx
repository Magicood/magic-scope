import {
  Avatar,
  Button,
  Calendar,
  DatePicker,
  Flex,
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
 *
 * 版式:.ad-split 不等分双栏(1.85fr / 1fr)。左月历大卡顶一条满出血墨色块
 * (超大「03」+ 极小图例,同一块色块里做密度反差),右两块各以满出血色块收尾
 * (主色=预估触达、墨色=平均完成度)—— 色块是骨架,不是装饰。
 * 品类色在本页承担「活动身份」编码:月历标记 / 图例点 / 清单左侧色条同源。
 * ========================================================================== */

/** 品类色键(对应 shop.css 的 [data-cat] 作用域与 --cat-* 派生色)。 */
type CatKey = 'ceramics' | 'lighting' | 'textiles' | 'objects';

/* ------------------------------ 活动月历数据 ------------------------------ */

interface CampaignDay {
  day: number;
  label: string;
  /** 日格内的短文案(格宽有限,完整名走点击 toast 与图例) */
  short: string;
  /** 该活动的品类色:月历标记与图例色点共用 */
  cat: CatKey;
}

/** 演示月固定为 2026-08;月内三个活动日打点。 */
const CAMPAIGN_YEAR = 2026;
const CAMPAIGN_MONTH = 7; // 0 起算 → 八月

const CAMPAIGN_DAYS: readonly CampaignDay[] = [
  { day: 7, label: 'Autumn lighting launch', short: 'Launch', cat: 'lighting' },
  { day: 14, label: 'Newsletter #12', short: 'Issue', cat: 'textiles' },
  { day: 21, label: 'VIP preview', short: 'VIP', cat: 'objects' },
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

/** 两位补零:图例与清单的等宽索引小字用。 */
function pad2(value: number): string {
  return String(value).padStart(2, '0');
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
  /** 左侧色条的品类色(与月历同一套编码) */
  cat: CatKey;
}

const ACTIVE_CAMPAIGNS: readonly ActiveCampaign[] = [
  {
    id: 'cmp-clearance',
    name: 'Summer clearance — final days',
    status: 'Sending',
    tone: 'info',
    sent: 78,
    cat: 'objects',
  },
  {
    id: 'cmp-welcome',
    name: 'Welcome series',
    status: 'Ongoing',
    tone: 'success',
    sent: 63,
    cat: 'textiles',
  },
  {
    id: 'cmp-restock',
    name: 'Back in stock — Orbe Bowl Set',
    status: 'Queued',
    tone: 'neutral',
    sent: 12,
    cat: 'ceramics',
  },
];

/** 平均完成度:墨色收尾块里的那个数,由上面清单直接聚合。 */
const AVERAGE_SENT = Math.round(
  ACTIVE_CAMPAIGNS.reduce((sum, c) => sum + c.sent, 0) / ACTIVE_CAMPAIGNS.length,
);

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

      <div className="ad-split">
        {/* ---------------- 01 左:活动月历大卡(墨色脊柱 + 月历) ---------------- */}
        <section className="ad-card mk-cal-card" aria-label="Campaign calendar">
          {/* 满高墨色脊柱:上索引、中超大数字(疏)、下图例(密)—— 色块即卡片的结构件 */}
          <div className="mk-cal-spine">
            <div className="mk-cal-id">
              <span className="sf-index">01</span>
              <span className="sf-kicker">Campaign calendar</span>
            </div>
            <div className="mk-cal-figure">
              <span className="mk-cal-n">{pad2(CAMPAIGN_DAYS.length)}</span>
              <span className="mk-cal-n-lab">
                sends
                <br />
                planned
                <br />
                in august
              </span>
            </div>
            <ol className="mk-legend">
              {CAMPAIGN_DAYS.map((campaign) => (
                <li key={campaign.day} className="mk-legend-item" data-cat={campaign.cat}>
                  <span className="mk-legend-key">
                    <span className="sf-dot sf-cat-dot mk-legend-dot" aria-hidden="true" />
                    <span className="sf-index">{`AUG ${pad2(campaign.day)}`}</span>
                  </span>
                  <span className="mk-legend-label">{campaign.label}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mk-cal-body">
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
                  <span className="mk-event sf-cat-fill" data-cat={campaign.cat}>
                    <span className="mk-event-label">{campaign.short}</span>
                  </span>
                );
              }}
            />
            <p className="mk-cal-foot">
              <span className="sf-index">TIP</span>
              Click a marked day to preview the send.
            </p>
          </div>
        </section>

        {/* ---------------- 右:受众搭建 + 进行中活动 ---------------- */}
        <div className="mk-side">
          {/* 02 受众:上密(双列穿梭)下满色块(超大触达数) */}
          <section className="ad-card mk-aud" aria-label="Audience builder">
            <div className="mk-head">
              <span className="sf-index">02</span>
              <div>
                <h2 className="mk-title">Audience</h2>
                <p className="mk-sub">Move segments right to include them.</p>
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
                size="lg"
                title="Estimated reach"
                value={reach}
                precision={0}
                animateOnMount
                classNames={{ title: 'mk-reach-title', value: 'mk-reach-value' }}
              />
              <p className="mk-reach-note">Segments overlap — treat the sum as approx.</p>
            </div>
          </section>

          {/* 03 进行中:左色条 + 右大数值(.ad-attn 语言),墨块收尾 */}
          <section className="ad-card mk-live" aria-label="Active campaigns">
            <div className="mk-head">
              <span className="sf-index">03</span>
              <div>
                <h2 className="mk-title">In flight</h2>
                <p className="mk-sub">Live and queued sends.</p>
              </div>
            </div>
            <List marker="none" spacing="none" className="mk-campaign-list">
              {ACTIVE_CAMPAIGNS.map((campaign) => (
                <List.Item key={campaign.id} className="mk-campaign" data-cat={campaign.cat}>
                  <span className="mk-campaign-rule" aria-hidden="true" />
                  <span className="mk-campaign-name">{campaign.name}</span>
                  <span className="mk-campaign-pct">
                    {campaign.sent}
                    <i>%</i>
                  </span>
                  <span className="mk-campaign-meter">
                    <Tag size="sm" tone={campaign.tone}>
                      {campaign.status}
                    </Tag>
                    <Progress
                      className="mk-campaign-progress"
                      value={campaign.sent}
                      size="sm"
                      aria-label={`${campaign.name} — ${campaign.sent}% sent`}
                    />
                  </span>
                  <span className="mk-campaign-act">
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
                  </span>
                </List.Item>
              ))}
            </List>
            <div className="mk-live-foot">
              <span className="sf-kicker">Average completion</span>
              <span className="mk-live-avg">
                {AVERAGE_SENT}
                <i>%</i>
              </span>
            </div>
          </section>
        </div>
      </div>

      {/* ---------------- 04 底:公告撰写器(整宽,控件一行排开) ---------------- */}
      <section className="ad-card mk-composer" aria-label="Announcement composer" ref={composerRef}>
        <div className="mk-head">
          <span className="sf-index">04</span>
          <div>
            <h2 className="mk-title mk-title-lg">Announcement composer</h2>
            <p className="mk-sub">
              Draft a note to your list — type @ to mention a teammate or product.
            </p>
          </div>
        </div>
        <div className="mk-composer-fields">
          <Input
            ref={subjectRef}
            size="lg"
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
          <Flex className="mk-composer-row" align="center" wrap gap="10px">
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
              className="mk-field-time"
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
          </Flex>
        </div>
      </section>
    </div>
  );
}
