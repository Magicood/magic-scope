import { Button } from '@magic-scope/react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { products } from '../data/catalog';
import { navigate } from '../lib/router';
import { CategoryTiles } from '../sections/CategoryTiles';
import { Newsletter } from '../sections/Newsletter';
import { Reviews } from '../sections/Reviews';
import { StoryBand } from '../sections/StoryBand';
import { SubscriptionCTA } from '../sections/SubscriptionCTA';
import { TrustBar } from '../sections/TrustBar';

function FeaturedProducts() {
  const featured = products.filter((p) => p.bestSeller || p.badge).slice(0, 4);
  return (
    <section className="db-section db-container">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBlockEnd: '2rem',
        }}
      >
        <div className="db-section-head">
          <span className="db-eyebrow">本周精选</span>
          <h2
            className="db-display"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBlockStart: '0.6rem' }}
          >
            最近烘得正好的几支
          </h2>
        </div>
        <Button variant="ghost" onClick={() => navigate('/shop')}>
          查看全部 →
        </Button>
      </div>

      <div className="db-grid db-grid--products">
        {featured.map((p, i) => (
          <Reveal key={p.id} delay={i * 70}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedProducts />
      <CategoryTiles />
      <StoryBand />
      <SubscriptionCTA />
      <Reviews />
      <Newsletter />
    </>
  );
}
