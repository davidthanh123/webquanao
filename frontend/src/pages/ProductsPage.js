// src/pages/ProductsPage.js
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const tag = searchParams.get('tag') || '';
  const page = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12, sort };
    if (category) params.category = category;
    if (search) params.search = search;
    if (tag) params.tag = tag;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    getProducts(params)
      .then(r => { setProducts(r.data.products); setTotalPages(r.data.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search, sort, tag, page, minPrice, maxPrice]);

  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});

  const activeFiltersCount = [category, minPrice, maxPrice, tag].filter(Boolean).length;

  return (
    <div className="products-page">
      <div className="container">
        {/* Header */}
        <div className="products-header">
          <h1 className="products-title">
            {search ? `Kết quả: "${search}"` : category ? categories.find(c => c.slug === category)?.name || 'Sản phẩm' : tag === 'sale' ? '⚡ Flash Sale' : 'Tất Cả Sản Phẩm'}
          </h1>
          <div className="products-toolbar">
            <button className="filter-toggle-btn" onClick={() => setShowFilter(!showFilter)}>
              <SlidersHorizontal size={16} /> Bộ lọc {activeFiltersCount > 0 && <span className="filter-count">{activeFiltersCount}</span>}
            </button>
            <select className="sort-select" value={sort} onChange={e => updateParam('sort', e.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="bestseller">Bán chạy nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar Filter */}
          <aside className={`filter-sidebar ${showFilter ? 'open' : ''}`}>
            <div className="filter-header">
              <h3>Bộ lọc</h3>
              <button onClick={() => setShowFilter(false)}><X size={18} /></button>
            </div>

            {activeFiltersCount > 0 && (
              <button className="clear-filter-btn" onClick={clearFilters}>
                <X size={14} /> Xóa tất cả bộ lọc
              </button>
            )}

            {/* Categories */}
            <div className="filter-group">
              <h4>Danh mục</h4>
              <button className={`filter-option ${!category ? 'active' : ''}`} onClick={() => updateParam('category', '')}>Tất cả</button>
              {categories.map(c => (
                <button key={c.id} className={`filter-option ${category === c.slug ? 'active' : ''}`} onClick={() => updateParam('category', c.slug)}>
                  {c.name}
                </button>
              ))}
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <h4>Khoảng giá</h4>
              {[['', '', 'Tất cả'], ['0', '200000', 'Dưới 200K'], ['200000', '500000', '200K - 500K'], ['500000', '1000000', '500K - 1tr'], ['1000000', '', 'Trên 1tr']].map(([min, max, label]) => (
                <button key={label}
                  className={`filter-option ${minPrice === min && maxPrice === max ? 'active' : ''}`}
                  onClick={() => { updateParam('minPrice', min); updateParam('maxPrice', max); }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Tags */}
            <div className="filter-group">
              <h4>Sản phẩm</h4>
              {[['', 'Tất cả'], ['sale', '🔥 Đang sale'], ['new', '✨ Mới về'], ['bestseller', '⭐ Bán chạy']].map(([t, label]) => (
                <button key={label} className={`filter-option ${tag === t ? 'active' : ''}`} onClick={() => updateParam('tag', t)}>{label}</button>
              ))}
            </div>
          </aside>

          {/* Products */}
          <div className="products-content">
            {loading ? <div className="spinner" /> : products.length === 0 ? (
              <div className="empty-state">
                {/* 📷 ẢNH TRỐNG: empty-state.png (300x300px) - minh họa không có sản phẩm */}
                <p>😔 Không tìm thấy sản phẩm nào</p>
                <button className="btn-primary" onClick={clearFilters}>Xóa bộ lọc</button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => updateParam('page', p)}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}