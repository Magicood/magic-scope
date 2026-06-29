import {
  Button,
  Divider,
  Empty,
  Input,
  Label,
  Radio,
  RadioGroup,
  Result,
  Steps,
  Textarea,
  toast,
} from '@magic-scope/react';
import { useState } from 'react';
import { formatPrice } from '../data/catalog';
import { cartSubtotal, clearCart, useCart } from '../lib/cart';
import { navigate } from '../lib/router';

/** 满此金额(分)免运费,否则收取下方运费。 */
const FREE_SHIPPING = 19900;
const SHIPPING_FEE = 1500;

type PayMethod = 'wechat' | 'alipay' | 'cod';

const PAY_LABELS: Record<PayMethod, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
  cod: '货到付款',
};

/** 窄屏堆叠:把两栏网格压成单列。 */
const RESPONSIVE_CSS =
  '@media (max-width: 860px){.db-checkout-grid{grid-template-columns:minmax(0,1fr)!important}.db-checkout-summary{position:static!important}}';

export function Checkout() {
  const items = useCart();
  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const [step, setStep] = useState<number>(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [pay, setPay] = useState<PayMethod>('wechat');

  // 仅在尚未下单(step < 2)且空车时拦截;下单清空购物车后仍需展示成功页。
  if (items.length === 0 && step < 2) {
    return (
      <section className="db-section db-container">
        <Empty image="simple" description="购物车是空的">
          <Button variant="soft" onClick={() => navigate('/shop')}>
            去选购
          </Button>
        </Empty>
      </section>
    );
  }

  const goPay = () => {
    if (name.trim() === '' || phone.trim() === '') {
      toast.error('请先填写收货人姓名与手机号');
      return;
    }
    setStep(1);
  };

  const placeOrder = () => {
    clearCart();
    setStep(2);
    toast.success('下单成功');
  };

  const nameInvalid = name.length > 0 && name.trim() === '';
  const phoneInvalid = phone.length > 0 && phone.trim() === '';

  return (
    <section className="db-section db-container">
      <style>{RESPONSIVE_CSS}</style>
      <div
        className="db-checkout-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 0.9fr)',
          gap: 'var(--ms-space-8, 2.5rem)',
          alignItems: 'start',
        }}
      >
        {/* 左:流程 */}
        <div style={{ minInlineSize: 0, display: 'grid', gap: 'var(--ms-space-6, 1.75rem)' }}>
          <header style={{ display: 'grid', gap: '0.5rem' }}>
            <span className="db-eyebrow">结账</span>
            <h1
              className="db-display"
              style={{ margin: 0, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}
            >
              确认你的订单
            </h1>
          </header>

          <Steps
            current={step}
            onChange={(next) => {
              // 仅允许回退到已完成步骤,且下单完成后不再回退。
              if (next < step && step < 2) setStep(next);
            }}
            items={[
              { title: '配送信息', description: '收货人与地址' },
              { title: '支付方式', description: '选择并下单' },
              { title: '完成', description: '等待新鲜烘焙' },
            ]}
          />

          {step === 0 && (
            <div style={{ display: 'grid', gap: 'var(--ms-space-4, 1.25rem)' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 'var(--ms-space-4, 1.25rem)',
                }}
              >
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <Label htmlFor="co-name" required>
                    收货人姓名
                  </Label>
                  <Input
                    id="co-name"
                    value={name}
                    invalid={nameInvalid}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入姓名"
                  />
                </div>
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <Label htmlFor="co-phone" required>
                    手机号
                  </Label>
                  <Input
                    id="co-phone"
                    inputMode="tel"
                    value={phone}
                    invalid={phoneInvalid}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入手机号"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <Label htmlFor="co-region">省 / 市 / 区</Label>
                <Input
                  id="co-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="如:上海市 · 静安区"
                />
              </div>

              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <Label htmlFor="co-address">详细地址</Label>
                <Input
                  id="co-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="街道、门牌号、楼栋单元"
                />
              </div>

              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <Label htmlFor="co-note">备注</Label>
                <Textarea
                  id="co-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  autosize={{ minRows: 2, maxRows: 5 }}
                  placeholder="对烘焙日期、配送时间的偏好(选填)"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={goPay}>下一步</Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'grid', gap: 'var(--ms-space-5, 1.5rem)' }}>
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                <Label>支付方式</Label>
                <RadioGroup
                  value={pay}
                  onValueChange={(value) => setPay(value as PayMethod)}
                  appearance="card"
                >
                  <Radio value="wechat">{PAY_LABELS.wechat}</Radio>
                  <Radio value="alipay">{PAY_LABELS.alipay}</Radio>
                  <Radio value="cod">{PAY_LABELS.cod}</Radio>
                </RadioGroup>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <Button variant="ghost" onClick={() => setStep(0)}>
                  上一步
                </Button>
                <Button variant="solid" onClick={placeOrder}>
                  提交订单
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <Result
              status="success"
              title="下单成功"
              subtitle="我们会尽快为你新鲜烘焙并发货"
              extra={<Button onClick={() => navigate('/')}>返回首页</Button>}
            />
          )}
        </div>

        {/* 右:订单摘要 */}
        <aside
          className="db-card db-checkout-summary"
          style={{
            position: 'sticky',
            top: 'var(--ms-space-6, 1.75rem)',
            display: 'grid',
            gap: 'var(--ms-space-4, 1.25rem)',
            padding: 'var(--ms-space-5, 1.5rem)',
          }}
        >
          <h2 style={{ margin: 0, fontFamily: 'var(--ms-font-display)', fontSize: '1.1rem' }}>
            订单摘要
          </h2>

          {step === 2 ? (
            <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', lineHeight: 1.7 }}>
              订单已提交,合计 <strong className="db-price">{formatPrice(total)}</strong>
              。烘焙完成后将通过短信通知你物流信息。
            </p>
          ) : (
            <>
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                {items.map((line) => (
                  <div
                    key={line.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      alignItems: 'baseline',
                    }}
                  >
                    <span style={{ minInlineSize: 0, color: 'var(--ms-color-fg-muted)' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          maxInlineSize: '13rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          verticalAlign: 'bottom',
                          color: 'var(--ms-color-fg)',
                        }}
                      >
                        {line.name}
                      </span>
                      <span style={{ whiteSpace: 'nowrap' }}> × {line.qty}</span>
                    </span>
                    <span
                      className="db-price"
                      style={{ fontSize: '0.95rem', whiteSpace: 'nowrap' }}
                    >
                      {formatPrice(line.price * line.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <Divider />

              <div style={{ display: 'grid', gap: '0.55rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: 'var(--ms-color-fg-muted)',
                  }}
                >
                  <span>小计</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: 'var(--ms-color-fg-muted)',
                  }}
                >
                  <span>运费</span>
                  <span>{shipping === 0 ? '免运费' : formatPrice(shipping)}</span>
                </div>
              </div>

              <Divider />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontFamily: 'var(--ms-font-display)', fontSize: '1.05rem' }}>
                  合计
                </span>
                <strong className="db-price" style={{ fontSize: '1.6rem' }}>
                  {formatPrice(total)}
                </strong>
              </div>

              {shipping > 0 && (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ms-color-fg-subtle)' }}>
                  再买 {formatPrice(FREE_SHIPPING - subtotal)} 即可免运费
                </p>
              )}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
