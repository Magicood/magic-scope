import {
  Button,
  Descriptions,
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
 * OrderTracking —— 买家订单跟踪页(/orders/:id)。
 * 左栏:Timeline 履约进度(实心=已完成 / 空心=待发生)+ 行项目清单;
 * 右栏:摘要卡(Descriptions 配送与支付 + 金额三行 + 支持区)。
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
      <section className="sf-section">
        <div className="sf-container">
          <Result
            status="404"
            title="Order not found"
            subtitle="We couldn't locate that order — the link may have expired."
            extra={<Button onClick={() => navigate('/')}>Back to home</Button>}
          />
        </div>
      </section>
    );
  }

  const customer = getCustomer(order.customerId);
  const lastEvent = order.timeline.at(-1);
  /* 进行中 = 时间线还有未发生的事件;此时最后一个已完成节点是"当前站"。 */
  const inProgress = lastEvent !== undefined && !lastEvent.done;
  const currentIndex = order.timeline.findLastIndex((event) => event.done);

  return (
    <section className="sf-section-tight">
      <div className="sf-container">
        {/* 页头:眉标 / 编号 + 状态 / 下单日期 —— 整块淡入,先于两栏 */}
        <Reveal trigger="mount" variant="fade" duration={600}>
          <header className="ot-head">
            <p className="sf-eyebrow">Order status</p>
            <div className="ot-head-row">
              <h1 className="sf-display sf-display-md">Order {order.number}</h1>
              <Tag tone={STATUS_TONE[order.status]}>{statusLabel(order.status)}</Tag>
            </div>
            <p className="ot-placed">Placed {formatDate(order.placedAt)}</p>
          </header>
        </Reveal>

        <div className="ot-layout">
          {/* 左栏:履约时间线 + 行项目(整栏一次 up,时间线不逐项动画) */}
          <Reveal
            trigger="mount"
            variant="up"
            distance={18}
            duration={650}
            delay={90}
            className="ot-main"
          >
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

            <h2 className="ot-subhead">
              Items <span className="ot-subhead-count">{order.items.length}</span>
            </h2>
            <RevealGroup
              as="ul"
              className="ot-items"
              variant="up"
              stagger={55}
              amount={0.1}
              style={ITEM_REVEAL_VARS}
            >
              {order.items.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;
                const colorway = product.colorways.find((c) => c.id === item.colorwayId);
                const href = `/products/${product.id}`;
                return (
                  <li key={`${item.productId}:${item.colorwayId}`} className="ot-line">
                    {/* 56px 小视觉:装饰性链接,键盘焦点交给名称链接 */}
                    <RouterLink
                      to={href}
                      className="ot-line-media"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <ProductVisual product={product} aspect="square" />
                    </RouterLink>
                    <div className="ot-line-info">
                      <RouterLink to={href} className="ot-line-name sf-link">
                        {product.name}
                      </RouterLink>
                      <span className="ot-line-meta">
                        {colorway ? `${colorway.label} · ` : ''}Qty {item.qty}
                      </span>
                    </div>
                    <span className="ot-line-price">{money(item.unitPrice * item.qty)}</span>
                  </li>
                );
              })}
            </RevealGroup>
          </Reveal>

          {/* 右栏:摘要卡(晚一拍进场;桌面端随滚动吸顶) */}
          <Reveal
            trigger="mount"
            variant="up"
            distance={18}
            duration={650}
            delay={200}
            as="aside"
            className="ot-aside"
          >
            <div className="ot-card">
              <h2 className="ot-subhead ot-card-title">Summary</h2>

              <Descriptions
                className="ot-desc"
                layout="vertical"
                columns={1}
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

              <dl className="ot-totals">
                <div className="ot-total-row">
                  <dt>Subtotal</dt>
                  <dd>{money(order.subtotal)}</dd>
                </div>
                <div className="ot-total-row">
                  <dt>Shipping</dt>
                  <dd>{order.shipping === 0 ? 'Complimentary' : money(order.shipping)}</dd>
                </div>
                <div className="ot-total-row ot-total-grand">
                  <dt>Total</dt>
                  <dd>{money(order.total)}</dd>
                </div>
              </dl>

              <div className="ot-support">
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
                      <a className="sf-link" href="mailto:care@arden.studio">
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
