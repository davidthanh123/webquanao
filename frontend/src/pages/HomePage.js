// src/pages/HomePage.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Shield, RefreshCw, Headphones, ShoppingBag } from 'lucide-react';
import { getBanners, getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [flashSale, setFlashSale] = useState([]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(() => {});
    getProducts({ sort: 'bestseller', limit: 8 }).then(r => setBestsellers(r.data.products)).catch(() => {});
    getProducts({ tag: 'new', limit: 8 }).then(r => setNewArrivals(r.data.products)).catch(() => {});
    getProducts({ tag: 'sale', limit: 4 }).then(r => setFlashSale(r.data.products)).catch(() => {});
  }, []);

  return (
    <div className="homepage">

      {/* ====== HERO SECTION - REDESIGNED ====== */}
      <section className="hero-section">
        <div className="hero-bg-glow" />
        <div className="hero-grid-lines" />

        <div className="hero-inner">
          {/* Left: Text Content */}
          <div className="hero-left">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Bộ sưu tập mới 2025
            </div>

            <h1 className="hero-headline">
              Thời Trang<br />
              <span className="hero-headline-accent">Đỉnh Cao</span><br />
              Phong Cách
            </h1>

            <p className="hero-subtitle">
              Khám phá hàng ngàn mẫu thiết kế độc đáo — từ casual đến formal.
              Phong cách của bạn, câu chuyện của bạn.
            </p>

            <div className="hero-cta-group">
              <Link to="/products" className="hero-btn-primary">
                <ShoppingBag size={18} />
                Mua Ngay
              </Link>
              <Link to="/products" className="hero-btn-ghost">
                Xem bộ sưu tập →
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-num">12K+</div>
                <div className="hero-stat-label">Sản phẩm</div>
              </div>
              <div>
                <div className="hero-stat-num">50K+</div>
                <div className="hero-stat-label">Khách hàng</div>
              </div>
              <div>
                <div className="hero-stat-num">4.9★</div>
                <div className="hero-stat-label">Đánh giá</div>
              </div>
            </div>
          </div>

          {/* Right: Visual Element */}
          <div className="hero-visual">
            <div className="hero-ring-outer" />
            <div className="hero-ring-inner" />

            {/* Floating card: Flash Sale */}
            <div className="hero-float-card hero-float-card--top-right">
              <div className="hero-float-icon hero-float-icon--red">🏷️</div>
              <div>
                <div className="hero-float-title">Flash Sale</div>
                <div className="hero-float-desc">Giảm đến 50%</div>
              </div>
            </div>

            {/* Floating card: New arrivals */}
            <div className="hero-float-card hero-float-card--bottom-left">
              <div className="hero-float-icon hero-float-icon--amber">⭐</div>
              <div>
                <div className="hero-float-title">Hàng mới về</div>
                <div className="hero-float-desc">Cập nhật hàng ngày</div>
              </div>
            </div>

            {/* Floating card: Trending bars */}
            <div className="hero-float-card hero-float-card--mid-left">
              <div className="hero-trend-label">Bán chạy nhất</div>
              {[80, 65, 42].map((pct, i) => (
                <div key={i} className="hero-trend-row">
                  <div className="hero-trend-track">
                    <div className="hero-trend-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="hero-trend-val">{pct}%</span>
                </div>
              ))}
            </div>

            {/* Center decorative */}
            <div className="hero-center-icon">👗</div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES BAR ====== */}
      <section className="features-bar">
        <div className="container features-grid">
          <div className="feature-item">
            <div className="feature-icon-wrap"><Truck size={22} /></div>
            <div><strong>Miễn phí vận chuyển</strong><span>Đơn từ 500.000đ</span></div>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrap"><Shield size={22} /></div>
            <div><strong>Bảo đảm chính hãng</strong><span>100% hàng thật</span></div>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrap"><RefreshCw size={22} /></div>
            <div><strong>Đổi trả 30 ngày</strong><span>Không phát sinh phí</span></div>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrap"><Headphones size={22} /></div>
            <div><strong>Hỗ trợ 24/7</strong><span>Luôn sẵn sàng giúp đỡ</span></div>
          </div>
        </div>
      </section>

      {/* ====== CATEGORIES ====== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Danh Mục Sản Phẩm</h2>
            <Link to="/products" className="see-all">Xem tất cả →</Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="category-card">
                <img
                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${cat.image}`}
                  alt={cat.name}
                  className="category-img"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FLASH SALE ====== */}
      {flashSale.length > 0 && (
        <section className="flash-sale-section">
          <div className="container">
            <div className="flash-sale-header">
              <h2>⚡ Flash Sale</h2>
              <Link to="/products?tag=sale" className="see-all-white">Xem tất cả →</Link>
            </div>
            <div className="product-grid">
              {flashSale.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ====== BESTSELLERS ====== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🔥 Bán Chạy Nhất</h2>
            <Link to="/products?sort=bestseller" className="see-all">Xem tất cả →</Link>
          </div>
          <div className="product-grid">
            {bestsellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ====== BANNER QUẢNG CÁO GIỮA TRANG ====== */}
      <section className="mid-banner-section">
        <div className="container mid-banner-grid">
          <Link to="/products?category=ao-nu" className="mid-banner">
            <img src="https://webquanao-pe7a.onrender.com/images/banners/mid-banner-left.jpg" alt="Thời trang nữ"
              onError={e => { e.target.parentElement.style.background = 'linear-gradient(135deg,#f093fb,#f5576c)'; e.target.style.display = 'none'; }}
            />
            <div className="mid-banner-text"><h3>Thời Trang Nữ</h3><p>Mới về mỗi ngày</p></div>
          </Link>
          <Link to="/products?category=ao-nam" className="mid-banner">
            <img src="https://webquanao-pe7a.onrender.com/images/banners/mid-banner-right.jpg" alt="Thời trang nam"
              onError={e => { e.target.parentElement.style.background = 'linear-gradient(135deg,#4facfe,#00f2fe)'; e.target.style.display = 'none'; }}
            />
            <div className="mid-banner-text"><h3>Thời Trang Nam</h3><p>Phong cách lịch lãm</p></div>
          </Link>
        </div>
      </section>

      {/* ====== NEW ARRIVALS ====== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">✨ Hàng Mới Về</h2>
            <Link to="/products?tag=new" className="see-all">Xem tất cả →</Link>
          </div>
          <div className="product-grid">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </div>
  );
}