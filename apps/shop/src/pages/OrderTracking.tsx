import {
  Button,
  Descriptions,
  Divider,
  Popover,
  Result,
  Reveal,
  RevealGroup,
  Tag,
  type TagTone,
  Timeline,
  TimelineItem,
  type TimelineVariant,
  toast,
} from '@magic-scope/react';
import type { CSSProperties } from 'react';
import { ProductVisual } from '../components/ProductVisual';
import { getCustomer } from '../data/customers';
import { DEMO_ORDER_ID, getOrder } from '../data/orders';
import { getProduct } from '../data/products';
import type { OrderEvent, OrderStatus } from '../data/types';
import { formatDate, formatDateTime, money } from '../lib/format';
import { navigate, RouterLink } from '../lib/router';
import './OrderTracking.css';

/* ============================================================================
 * OrderTracking —— 买家订单跟踪页(/orders/:id),Chromatic Grid 版式。
 *
 * 骨架 = 三块色:
 *   ① 页头是一整块**状态色满色块**(色彩即状态编码),超大状态词 vs 11px 眉标;
 *   ② 主区不等分双栏 1.4fr / 1fr —— 左栏两块白拼贴(履约时间线 / 行项清单),
 *      右栏三块(摘要 · 墨色金额块 · 支持),密度自上而下递减;
 *   ③ 金额块用 .sf-tile-ink 反白,大数字(32px numeral)与右侧细目清单并置。
 * 行项按商品品类挂 data-cat,色点承担品类识别 —— 色不是装饰。
 * 未匹配到订单时回落 demo 单;数据缺失兜底 404 Result。
 * ========================================================================== */

/* 订单状态 → Tag 语义色(与后台订单表保持同一映射心智)。 */
const STATUS_TONE: Record<OrderStatus, TagTone> = {
  pending: 'warning',
  paid: 'primary',
  fulfilled: 'primary',
  shipped: 'info',
  delivered: 'success',
  refunded: 'danger',
  cancelled: 'danger',
};

/* 状态展示文案:首字母大写即可(状态词都是单词)。 */
function statusLabel(status: OrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/* 时间线节点语义色:未完成=中性(配合空心样式);已完成按事件性质着色 ——
 * 终点签收用 success、取消/退款用 danger,其余推进节点统一深 ink(克制)。 */
function eventVariant(event: OrderEvent): TimelineVariant {
  if (!event.done) return 'default';
  if (event.label === 'Delivered') return 'success';
  if (event.label === 'Cancelled' || event.label === 'Refund issued') return 'danger';
  return 'primary';
}

/* 行项清单的错峰进场:位移与时长收小一档,只做轻微的"逐行落定"。 */
const ITEM_REVEAL_VARS = {
  '--ms-reveal-distance': '12px',
  '--ms-reveal-duration': '520ms',
} as CSSProperties;

export function OrderTracking({ id }: { id: string }) {
  /* 未匹配到就看 demo 单(结算完成后跳转的固定订单)。 */
  const order = getOrder(id) ?? getOrder(DEMO_ORDER_ID);

  /* 数据缺失兜底:连 demo 单都不存在时给 404。 */
  if (!order) {
    return (
      <section className="ot-page">
        <div className="sf-container ot-shell">
          <div className="sf-tile ot-missing">
            <Result
              status="404"
              title="Order not found"
              subtitle="We couldn't locate that order — the link may have expired."
              extra={<Button onClick={() => navigate('/')}>Back to home</Button>}
            />
          </div>
        </div>
      </section>
    );
  }

  const customer = getCustomer(order.customerId);
  const lastEvent = order.timeline.at(-1);
  /* 进行中 = 时间线还有未发生的事件;此时最后一个已完成节点是"当前站"。 */
  const inProgress = lastEvent !== undefined && !lastEvent.done;
  const currentIndex = order.timeline.findLastIndex((event) => event.done);
  const totalSteps = order.timeline.length;
  const doneSteps = order.timeline.filter((event) => event.done).length;

  return (
    <section className="ot-page">
      <div className="sf-container ot-shell">
        {/* ① 状态满色块:色即状态。左编号 / 右超大状态词 / 底一行下单日与进度条 */}
        <Reveal trigger="mount" variant="fade" duration={560}>
          <header className="ot-hero" data-status={order.status}>
            <div className="ot-hero-top">
              <div className="ot-hero-id">
                <p className="sf-kicker sf-kicker-dot">Order status</p>
                <h1 className="sf-display sf-display-lg">Order {order.number}</h1>
              </div>
              <p className="ot-hero-word">{statusLabel(order.status)}</p>
            </div>

            <div className="ot-hero-foot">
              <p className="ot-hero-placed">Placed {formatDate(order.placedAt)}</p>
              {/* 履约进度色条:满色块底边的结构件,读屏由下方 Timeline 承载 */}
              <div className="ot-track" aria-hidden="true">
                {order.timeline.map((event) => (
                  <i key={`${event.label}-${event.at}`} data-done={event.done || undefined} />
                ))}
              </div>
              <span className="sf-index ot-hero-count">
                {doneSteps}/{totalSteps}
              </span>
            </div>
          </header>
        </Reveal>

        <div className="ot-body">
          {/* ② 左栏:履约时间线 + 行项目(整栏一次 up,时间线不逐项动画) */}
          <Reveal
            trigger="mount"
            variant="up"
            distance={18}
            duration={620}
            delay={90}
            className="ot-col ot-col-main"
          >
            <div className="sf-tile">
              <div className="ot-tile-head">
                <p className="sf-kicker sf-kicker-dot">Fulfilment</p>
                <Tag tone={STATUS_TONE[order.status]} size="sm">
                  {doneSteps} of {totalSteps} steps
                </Tag>
              </div>

              <Timeline className="ot-timeline">
                {order.timeline.map((event, index) => {
                  const upcoming = !event.done;
                  const isLastStep = index === order.timeline.length - 1;
                  return (
                    <TimelineItem
                      key={`${event.label}-${event.at}`}
                      variant={eventVariant(event)}
                      pulse={inProgress && index === currentIndex}
                      className={upcoming ? 'ot-step ot-step-upcoming' : 'ot-step'}
                      title={event.label}
                      time={formatDateTime(event.at)}
                    >
                      {/* 进行中的最后一站:附一句预计送达 */}
                      {inProgress && isLastStep ? (
                        <p className="ot-step-note">
                          On its way — estimated by {formatDateTime(event.at)}. We'll email you the
                          moment it arrives.
                        </p>
                      ) : null}
                    </TimelineItem>
                  );
                })}
              </Timeline>
            </div>

            <div className="sf-tile">
              <div className="ot-tile-head">
                <p className="sf-kicker sf-kicker-dot">Items</p>
                <span className="sf-index">{order.items.length} lines</span>
              </div>

              {/* 与两栏同属一次挂载编排:滚动触发会在长页里把清单卡在隐藏初态 */}
              <RevealGroup
                as="ul"
                trigger="mount"
                className="ot-items"
                variant="up"
                stagger={55}
                style={ITEM_REVEAL_VARS}
              >
                {order.items.map((item, index) => {
                  const product = getProduct(item.productId);
                  if (!product) return null;
                  const colorway = product.colorways.find((c) => c.id === item.colorwayId);
                  const href = `/products/${product.id}`;
                  return (
                    <li
                      key={`${item.productId}:${item.colorwayId}`}
                      className="ot-line"
                      data-cat={product.category}
                    >
                      <span className="sf-index ot-line-idx">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {/* 52px 小视觉:装饰性链接,键盘焦点交给名称链接 */}
                      <RouterLink
                        to={href}
                        className="ot-line-media"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <ProductVisual product={product} aspect="square" />
                      </RouterLink>
                      <div className="ot-line-info">
                        <RouterLink to={href} className="ot-line-name">
                          {product.name}
                        </RouterLink>
                        <span className="ot-line-meta">
                          <i className="sf-dot sf-cat-dot" aria-hidden="true" />
                          {colorway ? `${colorway.label} · ` : ''}Qty {item.qty}
                        </span>
                      </div>
                      <span className="ot-line-price">{money(item.unitPrice * item.qty)}</span>
                    </li>
                  );
                })}
              </RevealGroup>
            </div>
          </Reveal>

          {/* ③ 右栏:摘要 / 墨色金额块 / 支持(晚一拍进场) */}
          <Reveal
            trigger="mount"
            variant="up"
            distance={18}
            duration={620}
            delay={200}
            as="aside"
            className="ot-col ot-col-side"
          >
            <div className="sf-tile ot-summary">
              <div className="ot-tile-head">
                <p className="sf-kicker sf-kicker-dot">Delivery</p>
                {/* 进行中才有意义的预计送达;已终结的订单留空,不硬凑 */}
                {inProgress && lastEvent ? (
                  <span className="sf-index">ETA {formatDate(lastEvent.at)}</span>
                ) : null}
              </div>

              <Descriptions
                className="ot-desc"
                layout="vertical"
                columns={2}
                size="sm"
                items={[
                  { key: 'destination', label: 'Destination', value: order.destination },
                  {
                    key: 'method',
                    label: 'Method',
                    value: order.shippingMethod === 'express' ? 'Express' : 'Standard',
                  },
                  { key: 'payment', label: 'Payment', value: 'Invoice · demo' },
                  { key: 'contact', label: 'Contact', value: customer?.email ?? '—' },
                ]}
              />
            </div>

            {/* 墨色块:超大金额 vs 右侧密集细目 —— 疏密反差 */}
            <div className="sf-tile sf-tile-ink ot-total">
              <div className="ot-total-grid">
                <div className="ot-total-main">
                  <p className="sf-kicker sf-kicker-dot">Total</p>
                  <span className="sf-numeral ot-total-num">{money(order.total)}</span>
                </div>
                <dl className="ot-breakdown">
                  <div className="ot-break-row">
                    <dt>Subtotal</dt>
                    <dd>{money(order.subtotal)}</dd>
                  </div>
                  <div className="ot-break-row">
                    <dt>Shipping</dt>
                    <dd>{order.shipping === 0 ? 'Free' : money(order.shipping)}</dd>
                  </div>
                  <div className="ot-break-row">
                    <dt>Items</dt>
                    <dd>{order.items.reduce((n, item) => n + item.qty, 0)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="sf-tile ot-support">
              <p className="sf-kicker sf-kicker-dot">Support</p>
              <p className="sf-lede">
                Anything to change on {order.number}? The studio picks up within one business day.
              </p>
              <div className="ot-support-row">
                <Popover
                  trigger={
                    <Button variant="ghost" size="sm">
                      Need help?
                    </Button>
                  }
                  placement="top-start"
                  classNames={{ panel: 'ot-help-panel' }}
                >
                  <div className="ot-help">
                    <p>Questions about this order? Our studio replies within one business day.</p>
                    <p>
                      Write to{' '}
                      <a className="ot-link" href="mailto:care@arden.studio">
                        care@arden.studio
                      </a>{' '}
                      and quote {order.number}.
                    </p>
                  </div>
                </Popover>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast('Invoice sent to your email')}
                >
                  Download invoice
                </Button>
              </div>

              <Divider spacing="sm" />

              <Button fullWidth onClick={() => navigate('/products')}>
                Continue shopping
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
