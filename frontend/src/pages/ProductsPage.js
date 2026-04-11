// src/pages/ProductsPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

// ── Pagination thông minh ────────────────────────────────────────────────────
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
      <button
        className="page-btn page-nav"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={15} />
      </button>
      {pages.map((p) =>
        typeof p === 'string'
          ? <span key={p} className="page-ellipsis">…</span>
          : <button
              key={p}
              className={`page-btn ${page === p ? 'active' : ''}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
      )}
      <button
        className="page-btn page-nav"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ── FIX BUG 1: Nhóm danh mục dựa theo tên thay vì hardcode slug ─────────────
// Vì slug trong DB có thể khác với những gì hardcode,
// chúng ta nhóm theo keyword trong tên category.
const GROUP_MATCHERS = [
  {
    label: 'Nam',
    match: (name) =>
      /nam/i.test(name) && !/nữ|nu|tre em|trẻ|baby|bé/i.test(name),
  },
  {
    label: 'Nữ',
    match: (name) =>
      /nữ|nu/i.test(name) && !/nam|tre em|trẻ|baby|bé/i.test(name),
  },
  {
    label: 'Trẻ em',
    match: (name) => /trẻ|tre|em|bé|be|baby|kids/i.test(name),
  },
  {
    label: 'Phụ kiện',
    match: (name) => /túi|tui|giày|giay|phụ|phu|kiện|kien|bag|shoe/i.test(name),
  },
  {
    label: 'Thể thao',
    match: (name) => /thể|the|thao|sport|gym|fitness/i.test(name),
  },
];

function groupCategories(categories) {
  const groups = GROUP_MATCHERS.map(g => ({ label: g.label, cats: [] }));
  const ungrouped = [];

  categories.forEach(cat => {
    let matched = false;
    for (let i = 0; i < GROUP_MATCHERS.length; i++) {
      if (GROUP_MATCHERS[i].match(cat.name)) {
        groups[i].cats.push(cat);
        matched = true;
        break;
      }
    }
    if (!matched) ungrouped.push(cat);
  });

  // Thêm ungrouped vào cuối nếu có
  if (ungrouped.length > 0) {
    groups.push({ label: 'Khác', cats: ungrouped });
  }

  return groups.filter(g => g.cats.length > 0);
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [catGroups, setCatGroups]       = useState([]);
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

  // ── Load categories 1 lần, rồi nhóm lại ──────────────────────────────────
  useEffect(() => {
    getCategories()
      .then(r => {
        const cats = r.data || [];
        setCategories(cats);
        setCatGroups(groupCategories(cats));
      })
      .catch(err => console.error('getCategories error:', err));
  }, []);

  // ── Load products khi filter thay đổi ────────────────────────────────────
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
    p.delete('page'); // Reset về trang 1 khi đổi filter
    setSearchParams(p);
  };

  // ── FIX: setParam nhiều key cùng lúc (dùng cho price range) ──────────────
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
            {!loading && (
              <p className="products-count">{total.toLocaleString()} sản phẩm</p>
            )}
          </div>
          <div className="products-toolbar">
            <button
              className="filter-toggle-btn"
              onClick={() => setShowFilter(!showFilter)}
            >
              <SlidersHorizontal size={15} />
              Bộ lọc
              {activeCount > 0 && (
                <span className="filter-count">{activeCount}</span>
              )}
            </button>
            <select
              className="sort-select"
              value={sort}
              onChange={e => setParam('sort', e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="bestseller">Bán chạy</option>
              <option value="rating">Đánh giá cao</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className={`filter-sidebar ${showFilter ? 'open' : ''}`}>
            <div className="filter-header">
              <h3>Bộ lọc</h3>
              <button onClick={() => setShowFilter(false)}>
                <X size={18} />
              </button>
            </div>

            {activeCount > 0 && (
              <button className="clear-filter-btn" onClick={clearFilters}>
                <X size={13} /> Xóa bộ lọc
              </button>
            )}

            {/* ── FIX BUG 1: Danh mục từ DB, nhóm động ── */}
            <div className="filter-group">
              <h4>Danh mục</h4>
              <button
                className={`filter-option ${!category ? 'active' : ''}`}
                onClick={() => setParam('category', '')}
              >
                Tất cả
              </button>

              {catGroups.map(group => (
                <div key={group.label} className="cat-group">
                  <span className="cat-group-label">{group.label}</span>
                  {group.cats.map(c => (
                    <button
                      key={c.id}
                      className={`filter-option filter-option-sub ${category === c.slug ? 'active' : ''}`}
                      onClick={() => setParam('category', c.slug)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              ))}

              {/* Fallback: nếu catGroups chưa load, hiện flat list */}
              {catGroups.length === 0 && categories.map(c => (
                <button
                  key={c.id}
                  className={`filter-option ${category === c.slug ? 'active' : ''}`}
                  onClick={() => setParam('category', c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* ── Khoảng giá ──────────────────────────────────────────────── */}
            <div className="filter-group">
              <h4>Khoảng giá</h4>
              {[
                ['', '',        'Tất cả'],
                ['0', '200000', 'Dưới 200K'],
                ['200000', '500000', '200K – 500K'],
                ['500000', '1000000', '500K – 1tr'],
                ['1000000', '', 'Trên 1tr'],
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

            {/* ── Tags ─────────────────────────────────────────────────────── */}
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

          {/* ── Products ─────────────────────────────────────────────────── */}
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
                <button className="btn-primary" onClick={() => window.location.reload()}>
                  Thử lại
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: 48 }}>😔</p>
                <p>Không tìm thấy sản phẩm nào</p>
                <button className="btn-primary" onClick={clearFilters}>
                  Xóa bộ lọc
                </button>
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