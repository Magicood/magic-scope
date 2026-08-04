import { Button, Drawer, Empty, NumberInput, Popconfirm, toast } from '@magic-scope/react';
import { getProduct } from '../data/products';
import { money } from '../lib/format';
import { navigate, RouterLink } from '../lib/router';
import { type CartLineDetail, useCart } from '../lib/store';
import { ProductVisual } from './ProductVisual';
import './CartDrawer.css';

/* ============================================================================
 * CartDrawer —— 购物车抽屉(右侧滑出,全站常驻,由 store 的 drawerOpen 驱动)。
 * 空车走 Empty + 去逛逛;行项 = 56px 商品小视觉 + 名称/色号/单价 + 数量步进
 * + Popconfirm 移除;底栏汇总 Subtotal / 运费提示 / 全宽 Checkout CTA。
 * ========================================================================== */

/* 免运费门槛(美元)—— 与运费提示文案对应。 */
const FREE_SHIPPING_THRESHOLD = 150;

export function CartDrawer() {
  const { detailed, subtotal, drawerOpen, closeDrawer } = useCart();
  const hasLines = detailed.length > 0;

  /* 去结算 / 去逛逛:先关抽屉再导航,视线直接落到目标页。 */
  const goto = (path: string) => {
    closeDrawer();
    navigate(path);
  };

  return (
    <Drawer
      open={drawerOpen}
      onOpenChange={(open) => {
        if (!open) closeDrawer();
      }}
      side="end"
      title="Cart"
      className="cart-drawer"
      classNames={{
        header: 'cart-drawer-header',
        title: 'cart-drawer-title',
        body: 'cart-drawer-body',
        footer: 'cart-drawer-footer',
      }}
      /* exactOptionalPropertyTypes:空车不传 footer,而不是显式传 undefined */
      {...(hasLines
        ? {
            footer: (
              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Subtotal</span>
                  {/* key 随金额变化重挂,触发轻微进场动画 */}
                  <span key={subtotal} className="cart-summary-value">
                    {money(subtotal)}
                  </span>
                </div>
                <p className="cart-summary-shipping">
                  {subtotal >= FREE_SHIPPING_THRESHOLD
                    ? 'Shipping is on us'
                    : `Complimentary shipping over ${money(FREE_SHIPPING_THRESHOLD)}`}
                </p>
                <Button
                  size="lg"
                  fullWidth
                  className="cart-checkout"
                  onClick={() => goto('/checkout')}
                >
                  Checkout ·{' '}
                  <span key={subtotal} className="cart-checkout-amount">
                    {money(subtotal)}
                  </span>
                </Button>
                <p className="cart-summary-note">Taxes calculated at checkout.</p>
              </div>
            ),
          }
        : {})}
    >
      {hasLines ? (
        <ul className="cart-lines">
          {detailed.map((line) => (
            <CartLine key={`${line.productId}:${line.colorwayId}`} line={line} />
          ))}
        </ul>
      ) : (
        <div className="cart-empty">
          <Empty image="simple" description="Your cart is empty">
            <Button variant="ghost" className="cart-empty-cta" onClick={() => goto('/products')}>
              Browse the collection
            </Button>
          </Empty>
        </div>
      )}
    </Drawer>
  );
}

/* 单个行项:视觉 / 信息 / 操作三列,行间发丝线在 .cart-line + .cart-line 上。 */
function CartLine({ line }: { line: CartLineDetail }) {
  const { setQty, remove, closeDrawer } = useCart();
  const product = getProduct(line.productId);
  const href = `/products/${line.productId}`;
  const removeLabel = line.colorwayLabel ? `${line.name} · ${line.colorwayLabel}` : line.name;

  return (
    <li className="cart-line">
      {/* 56px 小视觉:复用 ProductVisual 保持全站视觉语言;装饰性链接,
          键盘焦点交给名称链接(tabIndex=-1 + aria-hidden 去重) */}
      <RouterLink
        to={href}
        className="cart-line-media"
        tabIndex={-1}
        aria-hidden="true"
        onClick={closeDrawer}
      >
        {product ? (
          <ProductVisual product={product} aspect="square" />
        ) : (
          <span className="cart-line-fallback" />
        )}
      </RouterLink>

      <div className="cart-line-info">
        <RouterLink to={href} className="cart-line-name sf-link" onClick={closeDrawer}>
          {line.name}
        </RouterLink>
        {line.colorwayLabel ? (
          <span className="cart-line-colorway">{line.colorwayLabel}</span>
        ) : null}
        <span className="cart-line-price">{money(line.unitPrice)}</span>
      </div>

      <div className="cart-line-actions">
        <NumberInput
          size="sm"
          min={1}
          max={99}
          value={line.qty}
          onValueChange={(qty) => {
            /* 清空输入会上报 null:忽略,等失焦 clamp 后的有效值 */
            if (qty != null) setQty(line.productId, line.colorwayId, qty);
          }}
          aria-label={`Quantity for ${line.name}`}
          className="cart-line-qty"
          fieldClassName="cart-line-qty-field"
        />
        <Popconfirm
          trigger={
            <Button variant="ghost" size="sm" className="cart-line-remove">
              Remove
            </Button>
          }
          title="Remove this item?"
          description={removeLabel}
          tone="danger"
          confirmText="Remove"
          cancelText="Keep"
          placement="top-end"
          onConfirm={() => {
            remove(line.productId, line.colorwayId);
            toast('Removed from cart');
          }}
        />
      </div>
    </li>
  );
}
