import { Button } from '@magic-scope/react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { Reveal, RevealGroup } from '../components/Reveal';
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
        <Reveal variant="up" className="db-section-head">
          <span className="db-eyebrow">本周精选</span>
          <Reveal
            as="h2"
            variant="mask-up"
            className="db-display"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBlockStart: '0.6rem' }}
          >
            最近烘得正好的几支
          </Reveal>
        </Reveal>
        <Button variant="ghost" onClick={() => navigate('/shop')}>
          查看全部 →
        </Button>
      </div>

      {/* 产品网格:zoom-in 错峰进场,一个 observer 管全组 */}
      <RevealGroup variant="zoom-in" stagger={70} className="db-grid db-grid--products">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </RevealGroup>
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
