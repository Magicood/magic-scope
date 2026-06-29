import {
  Breadcrumb,
  Button,
  Checkbox,
  CheckboxGroup,
  Empty,
  Select,
  Slider,
  Tag,
} from '@magic-scope/react';
import { useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import {
  CATEGORY_LABEL,
  type Category,
  flavorFilters,
  products,
  ROAST_LABEL,
  type Roast,
} from '../data/catalog';
import { navigate } from '../lib/router';

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'rating';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: '推荐排序' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'rating', label: '评分最高' },
];

const CATEGORY_KEYS: Category[] = ['single', 'blend', 'gear'];
const ROAST_KEYS: Roast[] = ['light', 'medium', 'medium-dark', 'dark'];

// 价格滑块以「元」为单位(catalog 里价格是分),上限向上取整到 50 元的整数倍。
const PRICE_CEILING = Math.ceil(Math.max(...products.map((p) => p.price / 100)) / 50) * 50;

export function Shop() {
  const [sort, setSort] = useState<SortKey>('recommended');
  const [categories, setCategories] = useState<string[]>([]);
  const [roasts, setRoasts] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(PRICE_CEILING);
  const [flavors, setFlavors] = useState<string[]>([]);

  const hasFilters =
    categories.length > 0 || roasts.length > 0 || flavors.length > 0 || maxPrice < PRICE_CEILING;

  const resetFilters = () => {
    setCategories([]);
    setRoasts([]);
    setFlavors([]);
    setMaxPrice(PRICE_CEILING);
  };

  const toggleFlavor = (flavor: string) => {
    setFlavors((prev) =>
      prev.includes(flavor) ? prev.filter((f) => f !== flavor) : [...prev, flavor],
    );
  };

  const results = useMemo(() => {
    const filtered = products.filter((p) => {
      if (categories.length > 0 && !categories.includes(p.category)) {
        return false;
      }
      // 烘焙度只对有 roast 的豆生效;选了烘焙度时排除无 roast 的器具。
      if (roasts.length > 0 && (!p.roast || !roasts.includes(p.roast))) {
        return false;
      }
      if (p.price / 100 > maxPrice) {
        return false;
      }
      if (flavors.length > 0 && !flavors.some((f) => p.flavors.includes(f))) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered];
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // 推荐:畅销优先,其次评分。
        sorted.sort((a, b) => {
          const bs = Number(b.bestSeller ?? false) - Number(a.bestSeller ?? false);
          return bs !== 0 ? bs : b.rating - a.rating;
        });
        break;
    }
    return sorted;
  }, [categories, roasts, maxPrice, flavors, sort]);

  return (
    <section className="db-section db-container">
      <Breadcrumb
        items={[
          { label: '首页', href: '#/' },
          { label: '全部商品', current: true },
        ]}
        onItemClick={(item, _index, event) => {
          if (item.href) {
            event.preventDefault();
            navigate(item.href.replace(/^#/, ''));
          }
        }}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 'var(--ms-space-4)',
          marginBlock: 'var(--ms-space-4) var(--ms-space-6)',
        }}
      >
        <div style={{ display: 'grid', gap: '0.35rem', minInlineSize: 0 }}>
          <h1 className="db-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', margin: 0 }}>
            全部商品
          </h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--ms-color-fg-muted)' }}>
            共 {results.length} 件
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{ fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)', whiteSpace: 'nowrap' }}
          >
            排序
          </span>
          <Select
            value={sort}
            onChange={(value) => setSort(value as SortKey)}
            options={SORT_OPTIONS}
            size="sm"
            aria-label="排序方式"
            style={{ minInlineSize: '11rem' }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: 'var(--ms-space-6)',
        }}
      >
        <aside
          style={{
            flex: '1 1 220px',
            minInlineSize: 0,
            maxInlineSize: '260px',
            position: 'sticky',
            insetBlockStart: 'var(--ms-space-4)',
            display: 'grid',
            gap: 'var(--ms-space-5)',
          }}
        >
          <FilterBlock title="分类">
            <CheckboxGroup value={categories} onChange={setCategories}>
              {CATEGORY_KEYS.map((key) => (
                <Checkbox key={key} value={key}>
                  {CATEGORY_LABEL[key]}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </FilterBlock>

          <FilterBlock title="烘焙度">
            <CheckboxGroup value={roasts} onChange={setRoasts}>
              {ROAST_KEYS.map((key) => (
                <Checkbox key={key} value={key}>
                  {ROAST_LABEL[key]}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </FilterBlock>

          <FilterBlock title="价格上限">
            <Slider
              value={maxPrice}
              onValueChange={setMaxPrice}
              min={0}
              max={PRICE_CEILING}
              step={10}
              showValue
              formatValue={(n) => `≤ ¥${n}`}
              aria-label="价格上限"
            />
          </FilterBlock>

          <FilterBlock title="风味">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {flavorFilters.map((flavor) => {
                const selected = flavors.includes(flavor);
                return (
                  <Tag
                    key={flavor}
                    checkable
                    selected={selected}
                    tone={selected ? 'primary' : 'neutral'}
                    onClick={() => toggleFlavor(flavor)}
                  >
                    {flavor}
                  </Tag>
                );
              })}
            </div>
          </FilterBlock>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              清除全部筛选
            </Button>
          )}
        </aside>

        <div style={{ flex: '999 1 320px', minInlineSize: 0 }}>
          {results.length > 0 ? (
            <div className="db-grid db-grid--products">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="db-card" style={{ padding: 'var(--ms-space-8) var(--ms-space-4)' }}>
              <Empty image="simple" description="没有符合条件的商品">
                <Button variant="soft" onClick={resetFilters}>
                  清除筛选
                </Button>
              </Empty>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface FilterBlockProps {
  title: string;
  children: React.ReactNode;
}

function FilterBlock({ title, children }: FilterBlockProps) {
  return (
    <div style={{ display: 'grid', gap: '0.7rem' }}>
      <h2 className="db-eyebrow" style={{ margin: 0, fontSize: '0.72rem' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
