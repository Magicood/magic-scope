import {
  Alert,
  AlertDialogHost,
  AutoComplete,
  type AutoCompleteOption,
  Button,
  confirm as confirmDialog,
  Descriptions,
  type DescriptionsItem,
  Dialog,
  Empty,
  Form,
  type FormApi,
  Input,
  PinInput,
  Radio,
  RadioGroup,
  Result,
  Reveal,
  RevealGroup,
  Select,
  type SelectOption,
  type StepItem,
  Steps,
  toast,
  useForm,
} from '@magic-scope/react';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { ProductVisual } from '../components/ProductVisual';
import { getProduct } from '../data/products';
import { money } from '../lib/format';
import { navigate } from '../lib/router';
import { type CartLineDetail, useCart } from '../lib/store';
import './Checkout.css';

/* ============================================================================
 * Checkout —— 三步结算(Shipping / Payment / Review)。
 * 左栏表单流程(库 Form 校验 + Steps 受控),右栏 340px 粘性订单摘要;
 * 下单走 AlertDialog 确认 → Dialog + PinInput 假验证 → toast.promise 假异步
 * → 内嵌 Result 成功页。全程 mock,无真实支付。
 * ========================================================================== */

/* 免运费门槛与两档运费(与购物车抽屉的提示口径一致)。 */
const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_RATE = 12;
const EXPRESS_RATE = 24;

type ShippingMethod = 'standard' | 'express';
type PaymentMethod = 'card' | 'invoice';

/* Form 泛型要求 Record<string, unknown> 兼容 —— 用 type 字面量而非 interface。 */
type ShippingValues = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postal: string;
  country: string;
};

type CardValues = {
  cardNumber: string;
  expiry: string;
  cvc: string;
};

const SHIPPING_DEFAULTS: ShippingValues = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  postal: '',
  country: '',
};

const CARD_DEFAULTS: CardValues = { cardNumber: '', expiry: '', cvc: '' };

/* City 用 AutoComplete:静态候选,内置子串过滤。 */
const CITY_OPTIONS: AutoCompleteOption[] = [
  { value: 'Copenhagen' },
  { value: 'Aarhus' },
  { value: 'Stockholm' },
  { value: 'Oslo' },
  { value: 'Berlin' },
  { value: 'Amsterdam' },
  { value: 'Paris' },
  { value: 'London' },
];

const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'dk', label: 'Denmark' },
  { value: 'se', label: 'Sweden' },
  { value: 'no', label: 'Norway' },
  { value: 'de', label: 'Germany' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'fr', label: 'France' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
];

/* ----------------------------- 纯格式化工具 ------------------------------ */

/** 卡号:仅数字、上限 16 位、每 4 位一空格。 */
function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** 有效期:MM/YY 掩码(先收数字,满 2 位后自动补斜杠)。 */
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** CVC:3 位数字。 */
function formatCvc(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 3);
}

const asString = (v: unknown): string => (typeof v === 'string' ? v : '');

/* ============================================================================
 * 页面根
 * ========================================================================== */

export function Checkout() {
  const { detailed, subtotal, count, clear } = useCart();

  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [shipMethod, setShipMethod] = useState<ShippingMethod>('standard');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('card');
  const [contact, setContact] = useState<ShippingValues | null>(null);
  const [cardLast4, setCardLast4] = useState('');
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [placing, setPlacing] = useState(false);

  /* 两份表单 store 建在页面层:跨步骤往返编辑时已填值不丢。 */
  const shippingForm = useForm<ShippingValues>({ defaultValues: SHIPPING_DEFAULTS });
  const cardForm = useForm<CardValues>({ defaultValues: CARD_DEFAULTS });

  /* 运费:Express 固定,Standard 满门槛免。 */
  const shippingCost =
    shipMethod === 'express'
      ? EXPRESS_RATE
      : subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : STANDARD_RATE;
  const total = subtotal + shippingCost;

  /* 步骤切换滚回页顶(behavior 交给 CSS scroll-behavior,自动尊重减动效)。 */
  const prevStep = useRef(step);
  useEffect(() => {
    if (prevStep.current !== step) {
      prevStep.current = step;
      window.scrollTo({ top: 0 });
    }
  }, [step]);

  /* 验证弹窗打开后把焦点交给首格:原生 dialog.showModal 会先抢焦到关闭钮,
     PinInput 的 autoFocus 时机在其之前,这里补一拍。 */
  const verifyRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!verifyOpen) return;
    const t = window.setTimeout(() => {
      verifyRef.current?.querySelector('input')?.focus();
    }, 60);
    return () => window.clearTimeout(t);
  }, [verifyOpen]);

  /* 下单:AlertDialog 确认 → 打开 PinInput 假验证。 */
  const handlePlaceOrder = async () => {
    const ok = await confirmDialog(
      `${count} ${count === 1 ? 'item' : 'items'} · ${money(total)}, shipping included.`,
      {
        title: 'Place this order?',
        confirmText: 'Place order',
        cancelText: 'Keep editing',
      },
    );
    if (ok) {
      setPin('');
      setVerifyOpen(true);
    }
  };

  /* 验证码填满即通过:假异步 1.2s → 清车 → 切成功页。 */
  const handleVerified = () => {
    if (placing) return;
    setPlacing(true);
    setVerifyOpen(false);
    const pending = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1200);
    });
    toast.promise(pending, {
      loading: 'Placing your order…',
      success: 'Order placed',
      error: 'Something went wrong',
    });
    void pending.then(() => {
      clear();
      setPlaced(true);
      setPlacing(false);
      window.scrollTo({ top: 0 });
    });
  };

  /* 成功页:内嵌 Result,替换整个结算流程。 */
  if (placed) {
    return (
      <section className="sf-section ck-done">
        <div className="sf-container">
          <Reveal trigger="mount" variant="up" distance={16} duration={600}>
            <Result
              status="success"
              title="Order AR-1042 confirmed"
              subtitle="A confirmation email is on its way. We'll let you know the moment your pieces leave the studio."
              extra={
                <div className="ck-done-actions">
                  <Button onClick={() => navigate('/orders/ar-2001')}>Track order</Button>
                  <Button variant="ghost" onClick={() => navigate('/products')}>
                    Continue shopping
                  </Button>
                </div>
              }
            />
          </Reveal>
        </div>
      </section>
    );
  }

  /* 空购物车守卫。 */
  if (detailed.length === 0) {
    return (
      <section className="sf-section">
        <div className="sf-container ck-empty">
          <Reveal trigger="mount" variant="fade" duration={600}>
            <Empty description="Your cart is empty">
              <Button onClick={() => navigate('/products')}>Browse products</Button>
            </Empty>
          </Reveal>
        </div>
      </section>
    );
  }

  /* 已到过的步骤可点击回跳;之后的步骤禁用。 */
  const stepItems: StepItem[] = [
    { title: 'Shipping' },
    { title: 'Payment', disabled: step < 1 },
    { title: 'Review', disabled: step < 2 },
  ];
  const stepKeys = ['shipping', 'payment', 'review'] as const;

  return (
    <section className="sf-section-tight ck">
      <div className="sf-container">
        <AlertDialogHost />

        <Reveal trigger="mount" variant="up" distance={16} duration={600} as="header">
          <div className="ck-head">
            <p className="sf-eyebrow">Secure checkout</p>
            <div className="ck-head-row">
              <h1 className="sf-display sf-display-md">Checkout</h1>
              <Steps
                className="ck-steps"
                size="sm"
                current={step}
                items={stepItems}
                onChange={(next) => {
                  if (next < step) setStep(next);
                }}
              />
            </div>
          </div>
        </Reveal>

        <div className="ck-grid">
          {/* key 随步骤变化重挂,驱动 CSS 淡入 */}
          <div className="ck-main" key={stepKeys[step] ?? 'shipping'}>
            {step === 0 && (
              <ShippingStep
                form={shippingForm}
                shipMethod={shipMethod}
                onShipMethodChange={setShipMethod}
                subtotal={subtotal}
                onContinue={(values) => {
                  setContact(values);
                  setStep(1);
                }}
              />
            )}
            {step === 1 && (
              <PaymentStep
                form={cardForm}
                payMethod={payMethod}
                onPayMethodChange={setPayMethod}
                onBack={() => setStep(0)}
                onContinue={(values) => {
                  if (payMethod === 'card') {
                    setCardLast4(values.cardNumber.replace(/\s+/g, '').slice(-4));
                  }
                  setStep(2);
                }}
              />
            )}
            {step === 2 && contact && (
              <ReviewStep
                contact={contact}
                shipMethod={shipMethod}
                payMethod={payMethod}
                cardLast4={cardLast4}
                shippingCost={shippingCost}
                lines={detailed}
                total={total}
                placing={placing}
                onEdit={setStep}
                onPlace={() => void handlePlaceOrder()}
              />
            )}
          </div>

          <Reveal trigger="mount" variant="up" distance={16} duration={600} delay={140} asChild>
            <aside className="ck-aside" aria-label="Order summary">
              <OrderSummary
                lines={detailed}
                subtotal={subtotal}
                shipMethod={shipMethod}
                shippingCost={shippingCost}
                total={total}
              />
            </aside>
          </Reveal>
        </div>
      </div>

      {/* 假验证:任意 6 位填满即通过 */}
      <Dialog
        open={verifyOpen}
        onOpenChange={(open) => {
          if (!open) setVerifyOpen(false);
        }}
        size="sm"
      >
        <Dialog.Header>
          <Dialog.Title>Verify purchase</Dialog.Title>
          <Dialog.Description>Enter any code — this is a demo.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <div className="ck-verify" ref={verifyRef}>
            <PinInput
              length={6}
              value={pin}
              onChange={setPin}
              onComplete={handleVerified}
              aria-label="Verification code"
            />
          </div>
        </Dialog.Body>
      </Dialog>
    </section>
  );
}

/* ============================================================================
 * Step 1 —— 收货信息 + 配送方式
 * ========================================================================== */

function ShippingStep({
  form,
  shipMethod,
  onShipMethodChange,
  subtotal,
  onContinue,
}: {
  form: FormApi<ShippingValues>;
  shipMethod: ShippingMethod;
  onShipMethodChange: (method: ShippingMethod) => void;
  subtotal: number;
  onContinue: (values: ShippingValues) => void;
}) {
  const standardPrice = subtotal >= FREE_SHIPPING_THRESHOLD ? 'Free' : money(STANDARD_RATE);

  return (
    <div className="ck-panel">
      <h2 className="ck-panel-title">Where should we send it?</h2>
      <Form form={form} onSubmit={onContinue} className="ck-form">
        <Form.Field name="fullName" label="Full name" rule={{ required: 'Enter your full name' }}>
          <Input placeholder="Alma Reyes" autoComplete="name" />
        </Form.Field>
        <Form.Field
          name="email"
          label="Email"
          rule={{ required: 'Enter your email', email: 'Enter a valid email address' }}
        >
          <Input type="email" placeholder="alma@example.com" autoComplete="email" />
        </Form.Field>
        <Form.Field name="address" label="Address" rule={{ required: 'Enter your street address' }}>
          <Input placeholder="14 Amaliegade, 3rd floor" autoComplete="street-address" />
        </Form.Field>

        <div className="ck-form-row">
          {/* City 走 AutoComplete(未登记适配器,用 render-prop 手动接线) */}
          <Form.Field name="city" label="City" rule={{ required: 'Enter your city' }}>
            {(field, state) => (
              <AutoComplete
                value={asString(field.value)}
                onChange={(v) => field.setValue(v)}
                onBlur={field.onBlur}
                options={CITY_OPTIONS}
                invalid={state.error != null}
                id={field.fieldId}
                placeholder="Copenhagen"
                {...(state.error != null ? { 'aria-describedby': field.errorId } : {})}
              />
            )}
          </Form.Field>
          <Form.Field
            name="postal"
            label="Postal code"
            rule={{ required: 'Enter your postal code' }}
          >
            <Input placeholder="1256" autoComplete="postal-code" inputMode="numeric" />
          </Form.Field>
        </div>

        <Form.Field name="country" label="Country" rule={{ required: 'Select your country' }}>
          <Select options={COUNTRY_OPTIONS} placeholder="Select a country" />
        </Form.Field>

        <fieldset className="ck-fieldset">
          <legend className="ck-legend">Delivery</legend>
          <RadioGroup
            value={shipMethod}
            onValueChange={(v) => onShipMethodChange(v as ShippingMethod)}
            appearance="card"
            orientation="horizontal"
            className="ck-option-grid"
            aria-label="Delivery method"
          >
            <Radio value="standard">
              <span className="ck-option">
                <span className="ck-option-name">Standard</span>
                <span className="ck-option-price">{standardPrice}</span>
                <span className="ck-option-meta">3–5 business days</span>
              </span>
            </Radio>
            <Radio value="express">
              <span className="ck-option">
                <span className="ck-option-name">Express</span>
                <span className="ck-option-price">{money(EXPRESS_RATE)}</span>
                <span className="ck-option-meta">1–2 business days</span>
              </span>
            </Radio>
          </RadioGroup>
        </fieldset>

        <div className="ck-actions">
          <Form.Submit>Continue to payment</Form.Submit>
        </div>
      </Form>
    </div>
  );
}

/* ============================================================================
 * Step 2 —— 支付方式(Card / Invoice;卡字段仅在 Card 下渲染与校验)
 * ========================================================================== */

function PaymentStep({
  form,
  payMethod,
  onPayMethodChange,
  onBack,
  onContinue,
}: {
  form: FormApi<CardValues>;
  payMethod: PaymentMethod;
  onPayMethodChange: (method: PaymentMethod) => void;
  onBack: () => void;
  onContinue: (values: CardValues) => void;
}) {
  return (
    <div className="ck-panel">
      <h2 className="ck-panel-title">How would you like to pay?</h2>
      {/* Invoice 时卡字段整体卸载,其规则随之注销,提交直接放行 */}
      <Form form={form} onSubmit={onContinue} className="ck-form">
        <RadioGroup
          value={payMethod}
          onValueChange={(v) => onPayMethodChange(v as PaymentMethod)}
          appearance="card"
          orientation="horizontal"
          className="ck-option-grid"
          aria-label="Payment method"
        >
          <Radio value="card">
            <span className="ck-option">
              <span className="ck-option-name">Card</span>
              <span className="ck-option-meta">Visa, Mastercard, Amex</span>
            </span>
          </Radio>
          <Radio value="invoice">
            <span className="ck-option">
              <span className="ck-option-name">Pay by invoice</span>
              <span className="ck-option-meta">Net 14 days, sent by email</span>
            </span>
          </Radio>
        </RadioGroup>

        {payMethod === 'card' && (
          <div className="ck-card-fields">
            <Form.Field
              name="cardNumber"
              label="Card number"
              rule={{
                required: 'Enter your card number',
                validate: (v) => {
                  const digits = asString(v).replace(/\s+/g, '');
                  if (digits.length === 0) return true; // 空值交给 required
                  return digits.length === 16 || 'Enter a 16-digit card number';
                },
              }}
            >
              {(field, state) => (
                <Input
                  value={asString(field.value)}
                  onChange={(e) => field.setValue(formatCardNumber(e.target.value))}
                  onBlur={field.onBlur}
                  invalid={state.error != null}
                  id={field.fieldId}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  {...(state.error != null ? { 'aria-describedby': field.errorId } : {})}
                />
              )}
            </Form.Field>
            <div className="ck-form-row">
              <Form.Field
                name="expiry"
                label="Expiry"
                rule={{
                  required: 'Enter the expiry date',
                  pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Use MM/YY' },
                }}
              >
                {(field, state) => (
                  <Input
                    value={asString(field.value)}
                    onChange={(e) => field.setValue(formatExpiry(e.target.value))}
                    onBlur={field.onBlur}
                    invalid={state.error != null}
                    id={field.fieldId}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    {...(state.error != null ? { 'aria-describedby': field.errorId } : {})}
                  />
                )}
              </Form.Field>
              <Form.Field
                name="cvc"
                label="CVC"
                rule={{
                  required: 'Enter the security code',
                  pattern: { value: /^\d{3}$/, message: 'Enter the 3-digit code' },
                }}
              >
                {(field, state) => (
                  <Input
                    value={asString(field.value)}
                    onChange={(e) => field.setValue(formatCvc(e.target.value))}
                    onBlur={field.onBlur}
                    invalid={state.error != null}
                    id={field.fieldId}
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    {...(state.error != null ? { 'aria-describedby': field.errorId } : {})}
                  />
                )}
              </Form.Field>
            </div>
          </div>
        )}

        <Alert variant="info">Demo checkout — no real payment is processed.</Alert>

        <div className="ck-actions">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Form.Submit>Review order</Form.Submit>
        </div>
      </Form>
    </div>
  );
}

/* ============================================================================
 * Step 3 —— 复核(Descriptions + 行项列表 + 下单)
 * ========================================================================== */

/** Descriptions 单元:信息 + 右上 Edit 小链接跳回对应步。 */
function ReviewValue({ children, onEdit }: { children: ReactNode; onEdit: () => void }) {
  return (
    <div className="ck-review-cell">
      <div className="ck-review-text">{children}</div>
      <Button variant="link" size="sm" className="ck-review-edit" onClick={onEdit}>
        Edit
      </Button>
    </div>
  );
}

function ReviewStep({
  contact,
  shipMethod,
  payMethod,
  cardLast4,
  shippingCost,
  lines,
  total,
  placing,
  onEdit,
  onPlace,
}: {
  contact: ShippingValues;
  shipMethod: ShippingMethod;
  payMethod: PaymentMethod;
  cardLast4: string;
  shippingCost: number;
  lines: CartLineDetail[];
  total: number;
  placing: boolean;
  onEdit: (step: number) => void;
  onPlace: () => void;
}) {
  const countryLabel =
    COUNTRY_OPTIONS.find((c) => c.value === contact.country)?.label ?? contact.country;
  const deliveryLabel =
    shipMethod === 'standard'
      ? `Standard · 3–5 business days · ${shippingCost === 0 ? 'Free' : money(shippingCost)}`
      : `Express · 1–2 business days · ${money(EXPRESS_RATE)}`;
  const paymentLabel = payMethod === 'card' ? `Card ending ${cardLast4}` : 'Pay by invoice';

  const items: DescriptionsItem[] = [
    {
      key: 'contact',
      label: 'Contact',
      value: (
        <ReviewValue onEdit={() => onEdit(0)}>
          {contact.fullName}
          <br />
          {contact.email}
        </ReviewValue>
      ),
    },
    {
      key: 'address',
      label: 'Ship to',
      value: (
        <ReviewValue onEdit={() => onEdit(0)}>
          {contact.address}
          <br />
          {contact.city} {contact.postal}, {countryLabel}
        </ReviewValue>
      ),
    },
    {
      key: 'delivery',
      label: 'Delivery',
      value: <ReviewValue onEdit={() => onEdit(0)}>{deliveryLabel}</ReviewValue>,
    },
    {
      key: 'payment',
      label: 'Payment',
      value: <ReviewValue onEdit={() => onEdit(1)}>{paymentLabel}</ReviewValue>,
    },
  ];

  return (
    <div className="ck-panel">
      <h2 className="ck-panel-title">One last look</h2>
      <div className="ck-review">
        <Descriptions bordered columns={{ base: 1, md: 2 }} items={items} />

        {/* 行项复核:错峰入场(mount 触发,一次即定格) */}
        <RevealGroup
          as="ul"
          className="ck-review-lines"
          variant="up"
          trigger="mount"
          stagger={60}
          style={
            { '--ms-reveal-distance': '12px', '--ms-reveal-duration': '560ms' } as CSSProperties
          }
        >
          {lines.map((line) => {
            const product = getProduct(line.productId);
            return (
              <li key={`${line.productId}:${line.colorwayId}`} className="ck-line">
                <span className="ck-line-media" aria-hidden="true">
                  {product ? <ProductVisual product={product} aspect="square" /> : null}
                </span>
                <span className="ck-line-info">
                  <span className="ck-line-name">{line.name}</span>
                  <span className="ck-line-variant">
                    {line.colorwayLabel ? `${line.colorwayLabel} · ` : ''}×{line.qty}
                  </span>
                </span>
                <span className="ck-line-price">{money(line.lineTotal)}</span>
              </li>
            );
          })}
        </RevealGroup>

        <div className="ck-actions">
          <Button variant="ghost" onClick={() => onEdit(1)}>
            Back
          </Button>
          <Button size="lg" loading={placing} onClick={onPlace}>
            Place order · {money(total)}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 右栏 —— 粘性订单摘要
 * ========================================================================== */

function OrderSummary({
  lines,
  subtotal,
  shipMethod,
  shippingCost,
  total,
}: {
  lines: CartLineDetail[];
  subtotal: number;
  shipMethod: ShippingMethod;
  shippingCost: number;
  total: number;
}) {
  const note =
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? shipMethod === 'standard'
        ? 'Complimentary shipping applied.'
        : 'Complimentary standard shipping available.'
      : `Complimentary shipping over ${money(FREE_SHIPPING_THRESHOLD)}.`;

  return (
    <div className="ck-summary">
      <h2 className="ck-summary-title">Order summary</h2>
      <ul className="ck-summary-lines">
        {lines.map((line) => {
          const product = getProduct(line.productId);
          return (
            <li key={`${line.productId}:${line.colorwayId}`} className="ck-line ck-line-sm">
              <span className="ck-line-media" aria-hidden="true">
                {product ? <ProductVisual product={product} aspect="square" /> : null}
              </span>
              <span className="ck-line-info">
                <span className="ck-line-name">{line.name}</span>
                <span className="ck-line-variant">
                  {line.colorwayLabel ? `${line.colorwayLabel} · ` : ''}×{line.qty}
                </span>
              </span>
              <span className="ck-line-price">{money(line.lineTotal)}</span>
            </li>
          );
        })}
      </ul>
      <hr className="sf-hairline" />
      <dl className="ck-totals">
        <div className="ck-totals-row">
          <dt>Subtotal</dt>
          <dd>{money(subtotal)}</dd>
        </div>
        <div className="ck-totals-row">
          <dt>Shipping · {shipMethod === 'standard' ? 'Standard' : 'Express'}</dt>
          <dd>{shippingCost === 0 ? 'Free' : money(shippingCost)}</dd>
        </div>
        <div className="ck-totals-row ck-totals-total">
          <dt>Total</dt>
          <dd>{money(total)}</dd>
        </div>
      </dl>
      <p className="ck-summary-note">{note}</p>
    </div>
  );
}
