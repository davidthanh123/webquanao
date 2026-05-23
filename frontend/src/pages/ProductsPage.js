// src/pages/ProductsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const delta = 2;
  const pages = [];
  const rangeStart = Math.max(2, page - delta);
  const rangeEnd   = Math.min(totalPages - 1, page + delta);
  pages.push(1);
  if (rangeStart > 2)            pages.push('l-dot');
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < totalPages - 1) pages.push('r-dot');
  if (totalPages > 1)            pages.push(totalPages);
  return (
    <div className="pagination">
      <button className="page-btn page-nav" onClick={() => onChange(page - 1)} disabled={page === 1}>
        <ChevronLeft size={15} />
      </button>
      {pages.map((p) =>
        typeof p === 'string'
          ? <span key={p} className="page-ellipsis">…</span>
          : <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => onChange(p)}>{p}</button>
      )}
      <button className="page-btn page-nav" onClick={() => onChange(page + 1)} disabled={page === totalPages}>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ── Accordion section trong sidebar ──────────────────────────────────────────
function FilterSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`fs-section ${open ? 'open' : ''}`}>
      <button className="fs-section-header" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <ChevronDown size={15} className="fs-chevron" />
      </button>
      <div className="fs-section-body">
        <div className="fs-section-inner">{children}</div>
      </div>
    </div>
  );
}

// ── 18 slugs khớp với DB ──────────────────────────────────────────────────────
const CAT_GROUPS = [
  { label: 'Nam',      slugs: ['ao-thun-nam', 'ao-so-mi-nam', 'quan-nam', 'ao-khoac-nam'] },
  { label: 'Nữ',       slugs: ['ao-thun-nu', 'ao-so-mi-nu', 'quan-nu', 'vay', 'ao-khoac-nu', 'dam-nu'] },
  { label: 'Trẻ em',   slugs: ['ao-tre-em', 'quan-tre-em', 'dam-be-gai'] },
  { label: 'Phụ kiện', slugs: ['tui-xach', 'giay-nam', 'giay-nu', 'phu-kien'] },
  { label: 'Thể thao', slugs: ['do-the-thao'] },
];

const PRICE_RANGES = [
  { label: 'Tất cả',   min: '',       max: '' },
  { label: 'Dưới 200K', min: '0',     max: '200000' },
  { label: '200K – 500K', min: '200000', max: '500000' },
  { label: '500K – 1tr', min: '500000', max: '1000000' },
  { label: 'Trên 1tr', min: '1000000', max: '' },
];

const TAG_OPTIONS = [
  { value: '',           label: 'Tất cả' },
  { value: 'sale',       label: '🔥 Đang sale' },
  { value: 'new',        label: '✨ Mới về' },
  { value: 'bestseller', label: '⭐ Bán chạy' },
];

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';
  const sort     = searchParams.get('sort')     || 'newest';
  const tag      = searchParams.get('tag')      || '';
  const page     = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    getCategories()
      .then(r => setCategories(r.data || []))
      .catch(err => console.error('getCategories error:', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    const params = { page, limit: 20, sort };
    if (category) params.category = category;
    if (search)   params.search   = search;
    if (tag)      params.tag      = tag;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    getProducts(params)
      .then(r => {
        setProducts(r.data.products || []);
        setTotalPages(r.data.totalPages || 1);
        setTotal(r.data.total || 0);
      })
      .catch(err => {
        console.error('getProducts error:', err);
        setFetchError('Không thể tải sản phẩm. Vui lòng thử lại.');
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [category, search, sort, tag, page, minPrice, maxPrice]);

  const setParam = useCallback((key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  }, [searchParams, setSearchParams]);

  const setParams = useCallback((kvPairs) => {
    const p = new URLSearchParams(searchParams);
    kvPairs.forEach(([key, val]) => {
      if (val) p.set(key, val); else p.delete(key);
    });
    p.delete('page');
    setSearchParams(p);
  }, [searchParams, setSearchParams]);

  const clearFilters = () => setSearchParams({});

  const onPageChange = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCount = [category, minPrice, maxPrice, tag].filter(Boolean).length;

  const pageTitle = search
    ? `Kết quả: "${search}"`
    : tag === 'sale' ? '⚡ Flash Sale'
    : category
      ? (categories.find(c => c.slug === category)?.name || 'Sản phẩm')
      : 'Tất Cả Sản Phẩm';

  // Active price label
  const activePriceLabel = PRICE_RANGES.find(r => r.min === minPrice && r.max === maxPrice)?.label || 'Tất cả';

  return (
    <div className="products-page">
      <div className="container">

        {/* ── Header ── */}
        <div className="products-header">
          <div className="products-header-left">
            <h1 className="products-title">{pageTitle}</h1>
            {!loading && (
              <p className="products-count">
                {total.toLocaleString()} sản phẩm
              </p>
            )}
          </div>
          <div className="products-toolbar">
            <button
              className={`filter-toggle-btn ${showFilter ? 'active' : ''}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <SlidersHorizontal size={15} />
              Bộ lọc
              {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
            </button>
            <div className="sort-wrapper">
              <select
                className="sort-select"
                value={sort}
                onChange={e => setParam('sort', e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="bestseller">Bán chạy nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price_asc">Giá: Thấp → Cao</option>
                <option value="price_desc">Giá: Cao → Thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {activeCount > 0 && (
          <div className="active-filters">
            {category && (
              <span className="active-chip">
                {categories.find(c => c.slug === category)?.name || category}
                <button onClick={() => setParam('category', '')}><X size={11} /></button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="active-chip">
                {activePriceLabel}
                <button onClick={() => setParams([['minPrice', ''], ['maxPrice', '']])}><X size={11} /></button>
              </span>
            )}
            {tag && (
              <span className="active-chip">
                {TAG_OPTIONS.find(t => t.value === tag)?.label || tag}
                <button onClick={() => setParam('tag', '')}><X size={11} /></button>
              </span>
            )}
            <button className="clear-all-btn" onClick={clearFilters}>Xóa tất cả</button>
          </div>
        )}

        <div className="products-layout">

          {/* ── Sidebar overlay (mobile) ── */}
          {showFilter && <div className="sidebar-overlay" onClick={() => setShowFilter(false)} />}

          {/* ── Sidebar ── */}
          <aside className={`filter-sidebar ${showFilter ? 'open' : ''}`}>
            <div className="fs-header">
              <span className="fs-title">
                Bộ lọc
                {activeCount > 0 && <em>{activeCount} đang dùng</em>}
              </span>
              <button className="fs-close-btn" onClick={() => setShowFilter(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Danh mục */}
            <FilterSection title="Danh mục" defaultOpen={true}>
              <button
                className={`fs-cat-all ${!category ? 'active' : ''}`}
                onClick={() => setParam('category', '')}
              >
                Tất cả sản phẩm
              </button>
              {CAT_GROUPS.map(group => {
                const groupCats = categories.filter(c => group.slugs.includes(c.slug));
                const items = groupCats.length > 0
                  ? groupCats
                  : group.slugs.map(s => ({
                      slug: s, id: s,
                      name: s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    }));
                return (
                  <div key={group.label} className="fs-cat-group">
                    <span className="fs-cat-group-label">{group.label}</span>
                    {items.map(c => (
                      <button
                        key={c.slug}
                        className={`fs-cat-item ${category === c.slug ? 'active' : ''}`}
                        onClick={() => setParam('category', c.slug)}
                      >
                        <span className="fs-cat-dot" />
                        {c.name}
                        {category === c.slug && <span className="fs-cat-check">✓</span>}
                      </button>
                    ))}
                  </div>
                );
              })}
            </FilterSection>

            <div className="fs-divider" />

            {/* Khoảng giá */}
            <FilterSection title="Khoảng giá" defaultOpen={true}>
              <div className="fs-price-chips">
                {PRICE_RANGES.map(({ label, min, max }) => (
                  <button
                    key={label}
                    className={`fs-price-chip ${minPrice === min && maxPrice === max ? 'active' : ''}`}
                    onClick={() => setParams([['minPrice', min], ['maxPrice', max]])}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </FilterSection>

            <div className="fs-divider" />

            {/* Loại sản phẩm */}
            <FilterSection title="Loại sản phẩm" defaultOpen={true}>
              <div className="fs-tag-list">
                {TAG_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`fs-tag-item ${tag === value ? 'active' : ''}`}
                    onClick={() => setParam('tag', value)}
                  >
                    {label}
                    {tag === value && <span className="fs-cat-check">✓</span>}
                  </button>
                ))}
              </div>
            </FilterSection>

            {activeCount > 0 && (
              <button className="fs-clear-btn" onClick={clearFilters}>
                <X size={13} /> Xóa bộ lọc ({activeCount})
              </button>
            )}
          </aside>

          {/* ── Products ── */}
          <div className="products-content">
            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="product-skeleton" style={{ animationDelay: `${i * 0.04}s` }} />
                ))}
              </div>
            ) : fetchError ? (
              <div className="empty-state">
                <p style={{ fontSize: 48 }}>⚠️</p>
                <p>{fetchError}</p>
                <button className="btn-primary" onClick={() => window.location.reload()}>Thử lại</button>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: 48 }}>😔</p>
                <p>Không tìm thấy sản phẩm nào</p>
                <button className="btn-primary" onClick={clearFilters}>Xóa bộ lọc</button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}