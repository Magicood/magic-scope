import { Button, Divider, Drawer, Empty, NumberInput } from '@magic-scope/react';
import { formatPrice } from '../data/catalog';
import { cartSubtotal, removeFromCart, setQty, useCart } from '../lib/cart';
import { navigate } from '../lib/router';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FREE_SHIPPING = 19900;

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const items = useCart();
  const subtotal = cartSubtotal(items);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);

  const checkout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      side="end"
      size="md"
      title="购物车"
      footer={
        items.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
            >
              <span style={{ color: 'var(--ms-color-fg-muted)' }}>小计</span>
              <span className="db-price" style={{ fontSize: '1.3rem' }}>
                {formatPrice(subtotal)}
              </span>
            </div>
            <Button size="lg" fullWidth onClick={checkout}>
              去结算
            </Button>
            <p
              style={{
                margin: 0,
                fontSize: '0.78rem',
                color: 'var(--ms-color-fg-subtle)',
                textAlign: 'center',
              }}
            >
              {remaining > 0
                ? `再买 ${formatPrice(remaining)} 即可免运费`
                : '已满足包邮 · 含 30 天风味无忧'}
            </p>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <Empty description="购物车还是空的" image="simple">
          <Button
            variant="soft"
            onClick={() => {
              onOpenChange(false);
              navigate('/shop');
            }}
          >
            去逛逛咖啡豆
          </Button>
        </Empty>
      ) : (
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          {items.map((line, i) => (
            <div key={line.id}>
              {i > 0 && <Divider style={{ margin: '0.25rem 0' }} />}
              <div style={{ display: 'flex', gap: '0.85rem', paddingBlock: '0.5rem' }}>
                <span
                  aria-hidden="true"
                  style={{
                    inlineSize: '3rem',
                    blockSize: '3rem',
                    flex: '0 0 auto',
                    borderRadius: 'var(--ms-radius-md, 0.5rem)',
                    background: `radial-gradient(120% 120% at 30% 20%, color-mix(in oklab, ${line.accent} 32%, var(--ms-color-surface)), var(--ms-color-surface-sunken, var(--ms-color-surface)))`,
                  }}
                />
                <div style={{ flex: 1, minInlineSize: 0, display: 'grid', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <strong
                      style={{
                        fontFamily: 'var(--ms-font-display)',
                        fontSize: '0.95rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {line.name}
                    </strong>
                    <span className="db-price" style={{ fontSize: '0.95rem' }}>
                      {formatPrice(line.price * line.qty)}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ms-color-fg-subtle)' }}>
                    {line.variant}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <NumberInput
                      size="sm"
                      value={line.qty}
                      min={1}
                      max={99}
                      onValueChange={(v) => setQty(line.id, v ?? 1)}
                      style={{ inlineSize: '7rem' }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      tone="danger"
                      onClick={() => removeFromCart(line.id)}
                    >
                      移除
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}
