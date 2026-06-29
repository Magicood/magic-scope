import { Toaster } from '@magic-scope/react';
import './styles/shop.css';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { productIdFromPath, useHashPath } from './lib/router';
import { Checkout } from './pages/Checkout';
import { Home } from './pages/Home';
import { ProductPage } from './pages/ProductPage';
import { Shop } from './pages/Shop';

export function App() {
  const path = useHashPath();
  const productId = productIdFromPath(path);

  let page = <Home />;
  if (productId) {
    page = <ProductPage id={productId} />;
  } else if (path.startsWith('/shop')) {
    page = <Shop />;
  } else if (path.startsWith('/checkout')) {
    page = <Checkout />;
  }

  return (
    <>
      <div className="db-glow" aria-hidden="true" />
      <div className="db-app">
        <SiteHeader />
        <main>{page}</main>
        <SiteFooter />
      </div>
      <Toaster />
    </>
  );
}
