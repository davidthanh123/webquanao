// src/pages/ProductsPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

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

// ── 18 slugs chính xác từ DB Railway ─────────────────────────────────────────
// Page1: c1=ao-thun-nam, c10=dam-nu, c11=ao-tre-em, c12=quan-tre-em, c13=dam-be-gai
// Page2: c14=tui-xach, c15=giay-nam, c16=giay-nu, c17=phu-kien, c18=do-the-thao
// Page3: c2=ao-so-mi-nam, c3=quan-nam, c4=ao-khoac-nam, c5=ao-thun-nu, c6=ao-so-mi-nu
// Page4: c7=quan-nu, c8=vay, c9=ao-khoac-nu
const CAT_GROUPS = [
  {
    label: 'Nam',
    slugs: ['ao-thun-nam', 'ao-so-mi-nam', 'quan-nam', 'ao-khoac-nam'],
  },
  {
    label: 'Nữ',
    slugs: ['ao-thun-nu', 'ao-so-mi-nu', 'quan-nu', 'vay', 'ao-khoac-nu', 'dam-nu'],
  },
  {
    label: 'Trẻ em',
    slugs: ['ao-tre-em', 'quan-tre-em', 'dam-be-gai'],
  },
  {
    label: 'Phụ kiện',
    slugs: ['tui-xach', 'giay-nam', 'giay-nu', 'phu-kien'],
  },
  {
    label: 'Thể thao',
    slugs: ['do-the-thao'],
  },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [showFilter, setShowFilter]     = useState(false);
  const [fetchError, setFetchError]     = useState(null);

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

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const setParams = (kvPairs) => {
    const p = new URLSearchParams(searchParams);
    kvPairs.forEach(([key, val]) => {
      if (val) p.set(key, val); else p.delete(key);
    });
    p.delete('page');
    setSearchParams(p);
  };

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

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <div>
            <h1 className="products-title">{pageTitle}</h1>
            {!loading && <p className="products-count">{total.toLocaleString()} sản phẩm</p>}
          </div>
          <div className="products-toolbar">
            <button className="filter-toggle-btn" onClick={() => setShowFilter(!showFilter)}>
              <SlidersHorizontal size={15} />
              Bộ lọc
              {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
            </button>
            <select className="sort-select" value={sort} onChange={e => setParam('sort', e.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="bestseller">Bán chạy</option>
              <option value="rating">Đánh giá cao</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          {/* ── Sidebar ── */}
          <aside className={`filter-sidebar ${showFilter ? 'open' : ''}`}>
            <div className="filter-header">
              <h3>Bộ lọc</h3>
              <button onClick={() => setShowFilter(false)}><X size={18} /></button>
            </div>

            {activeCount > 0 && (
              <button className="clear-filter-btn" onClick={clearFilters}>
                <X size={13} /> Xóa bộ lọc
              </button>
            )}

            {/* Danh mục — slugs khớp 100% với DB */}
            <div className="filter-group">
              <h4>Danh mục</h4>
              <button
                className={`filter-option ${!category ? 'active' : ''}`}
                onClick={() => setParam('category', '')}
              >
                Tất cả
              </button>

              {CAT_GROUPS.map(group => {
                const groupCats = categories.filter(c => group.slugs.includes(c.slug));
                // Fallback: nếu categories API chưa load xong, render từ slugs hardcode
                const items = groupCats.length > 0
                  ? groupCats
                  : group.slugs.map(s => ({
                      slug: s,
                      id: s,
                      name: s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    }));

                return (
                  <div key={group.label} className="cat-group">
                    <span className="cat-group-label">{group.label}</span>
                    {items.map(c => (
                      <button
                        key={c.slug}
                        className={`filter-option filter-option-sub ${category === c.slug ? 'active' : ''}`}
                        onClick={() => setParam('category', c.slug)}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Khoảng giá */}
            <div className="filter-group">
              <h4>Khoảng giá</h4>
              {[
                ['', '',          'Tất cả'],
                ['0', '200000',   'Dưới 200K'],
                ['200000', '500000',  '200K – 500K'],
                ['500000', '1000000', '500K – 1tr'],
                ['1000000', '',   'Trên 1tr'],
              ].map(([min, max, label]) => (
                <button
                  key={label}
                  className={`filter-option ${minPrice === min && maxPrice === max ? 'active' : ''}`}
                  onClick={() => setParams([['minPrice', min], ['maxPrice', max]])}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tags */}
            <div className="filter-group">
              <h4>Loại sản phẩm</h4>
              {[
                ['', 'Tất cả'],
                ['sale', '🔥 Đang sale'],
                ['new', '✨ Mới về'],
                ['bestseller', '⭐ Bán chạy'],
              ].map(([t, label]) => (
                <button
                  key={label}
                  className={`filter-option ${tag === t ? 'active' : ''}`}
                  onClick={() => setParam('tag', t)}
                >
                  {label}
                </button>
              ))}
            </div>
          </aside>

          {/* ── Products ── */}
          <div className="products-content">
            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="product-skeleton" />
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