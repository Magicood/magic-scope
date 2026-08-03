import { Toaster } from '@magic-scope/react';
import { AdminLayout } from './admin/AdminLayout';
import { CartDrawer } from './components/CartDrawer';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { AppearanceProvider, type AppearanceState } from './lib/appearance';
import {
  isAdminPath,
  orderIdFromPath,
  pathnameOf,
  productIdFromPath,
  useHashPath,
} from './lib/router';
import { CartProvider } from './lib/store';
import { Checkout } from './pages/Checkout';
import { Home } from './pages/Home';
import { OrderTracking } from './pages/OrderTracking';
import { ProductDetail } from './pages/ProductDetail';
import { Products } from './pages/Products';

/* ============================================================================
 * Arden 应用根 —— 双面:买家店面(/)与商家控制台(/admin)共用一套
 * 外观四轴 / 购物车 / 数据,靠 hash 路由切换两个世界。
 * ========================================================================== */

export function App({ initialAppearance }: { initialAppearance: AppearanceState }) {
  return (
    <AppearanceProvider initial={initialAppearance}>
      <CartProvider>
        <Routes />
        <Toaster position="bottom-end" max={4} />
      </CartProvider>
    </AppearanceProvider>
  );
}

function Routes() {
  const path = useHashPath();
  return isAdminPath(path) ? <AdminLayout path={path} /> : <Storefront path={path} />;
}

function Storefront({ path }: { path: string }) {
  const pathname = pathnameOf(path);
  const productId = productIdFromPath(path);
  const orderId = orderIdFromPath(path);

  let page = <Home />;
  if (productId) {
    page = <ProductDetail id={productId} />;
  } else if (pathname.startsWith('/products')) {
    page = <Products routePath={path} />;
  } else if (pathname.startsWith('/checkout')) {
    page = <Checkout />;
  } else if (orderId) {
    page = <OrderTracking id={orderId} />;
  }

  return (
    <div className="sf-root">
      <SiteHeader />
      <main>{page}</main>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}
