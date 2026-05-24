// src/pages/HomePage.js
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Shield, RefreshCw, Headphones, ArrowRight } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [timer, setTimer] = useState({ h: '02', m: '34', s: '17' });
  const totalSecsRef = useRef(2 * 3600 + 34 * 60 + 17);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(() => {});

    // Bestseller: chỉ lấy 5 để vừa 1 hàng grid 5 cột
    getProducts({ sort: 'bestseller', limit: 5 })
      .then(r => setBestsellers(r.data.products))
      .catch(() => {});

    // Hàng mới về: lấy 4 sản phẩm mới nhất
    getProducts({ sort: 'newest', limit: 4 })
      .then(r => setNewArrivals(r.data.products))
      .catch(() => {});

    // Flash Sale: thử tag=sale trước, nếu rỗng thì fallback sang sản phẩm có discount (originalPrice > price)
    getProducts({ tag: 'sale', limit: 4 })
      .then(r => {
        if (r.data.products && r.data.products.length > 0) {
          setFlashSale(r.data.products);
        } else {
          // Fallback: lấy 4 sản phẩm bán chạy nhất làm flash sale
          return getProducts({ sort: 'bestseller', limit: 4 })
            .then(r2 => setFlashSale(r2.data.products || []));
        }
      })
      .catch(() => {});
  }, []);

  // Đồng hồ đếm ngược flash sale
  useEffect(() => {
    const id = setInterval(() => {
      if (totalSecsRef.current <= 0) { clearInterval(id); return; }
      totalSecsRef.current--;
      const t = totalSecsRef.current;
      const pad = n => String(n).padStart(2, '0');
      setTimer({
        h: pad(Math.floor(t / 3600)),
        m: pad(Math.floor((t % 3600) / 60)),
        s: pad(t % 60),
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="homepage">

      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-season">Bộ sưu tập SS 2025</div>
          <h1 className="hero-headline">
            Mặc Đẹp.<br />
            <em>Sống Chất.</em><br />
            Mỗi Ngày.
          </h1>
          <p className="hero-desc">
            Phong cách thời thượng từ casual đến formal. Hơn 12.000 sản phẩm, cập nhật mỗi ngày.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="hero-btn-solid">Khám phá ngay</Link>
            <Link to="/products?tag=sale" className="hero-btn-text">
              Xem Flash Sale <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-right-placeholder">👗</div>
          <div className="hero-bottom-info">
            <div className="hero-tag">MỚI VỀ MỖI NGÀY</div>
            <div className="hero-stats-row">
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
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features-bar">
        <div className="container features-grid">
          <div className="feature-item">
            <div className="feature-icon-box"><Truck size={20} /></div>
            <div><strong>Miễn phí vận chuyển</strong><span>Đơn từ 500.000đ</span></div>
          </div>
          <div className="feature-item">
            <div className="feature-icon-box"><Shield size={20} /></div>
            <div><strong>Bảo đảm chính hãng</strong><span>100% hàng thật</span></div>
          </div>
          <div className="feature-item">
            <div className="feature-icon-box"><RefreshCw size={20} /></div>
            <div><strong>Đổi trả 30 ngày</strong><span>Không phát sinh phí</span></div>
          </div>
          <div className="feature-item">
            <div className="feature-icon-box"><Headphones size={20} /></div>
            <div><strong>Hỗ trợ 24/7</strong><span>Luôn sẵn sàng giúp đỡ</span></div>
          </div>
        </div>
      </section>

      {/* ===== DANH MỤC SẢN PHẨM ===== */}
      <section className="section section-bg-white">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Danh Mục Sản Phẩm</h2>
            <Link to="/products" className="see-all">Xem tất cả →</Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="category-card">
                <img
                  src={`https://webquanao-pe7a.onrender.com${cat.image}`}
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

      {/* ===== FLASH SALE — luôn hiện, fallback sang bestseller nếu ko có tag sale ===== */}
      {flashSale.length > 0 && (
        <section className="section section-bg-dark">
          <div className="container">
            <div className="flash-sale-header">
              <div className="flash-sale-title-group">
                <div className="flash-sale-badge">FLASH</div>
                <div className="flash-sale-label">Sale Hôm Nay</div>
              </div>
              <div className="flash-sale-right">
                <div className="flash-timer">
                  <div className="timer-box">{timer.h}</div>
                  <span className="timer-sep">:</span>
                  <div className="timer-box">{timer.m}</div>
                  <span className="timer-sep">:</span>
                  <div className="timer-box">{timer.s}</div>
                </div>
                <Link to="/products?tag=sale" className="see-all-dark">Xem tất cả →</Link>
              </div>
            </div>
            <div className="product-grid-4">
              {flashSale.map(p => <ProductCard key={p.id} product={p} dark />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== BÁN CHẠY NHẤT — limit 5 để vừa 1 hàng ===== */}
      <section className="section section-bg-white">
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

      {/* ===== MID BANNERS ===== */}
      <div className="mid-banner-section">
        <div className="container mid-banner-grid">
          <Link to="/products?category=ao-nu" className="mid-banner">
            <div className="mid-banner-fallback mid-banner-fallback-nu">👗</div>
            <img
              src="https://webquanao-pe7a.onrender.com/images/banners/mid-banner-left.jpg"
              alt="Thời trang nữ"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div className="mid-banner-content">
              <div className="mid-banner-label">Dành cho nàng</div>
              <div className="mid-banner-title">Thời Trang Nữ</div>
              <button className="mid-banner-btn">Khám phá →</button>
            </div>
          </Link>

          <Link to="/products?category=ao-nam" className="mid-banner">
            <div className="mid-banner-fallback mid-banner-fallback-nam">👔</div>
            <img
              src="https://webquanao-pe7a.onrender.com/images/banners/mid-banner-right.jpg"
              alt="Thời trang nam"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div className="mid-banner-content">
              <div className="mid-banner-label">Dành cho chàng</div>
              <div className="mid-banner-title">Thời Trang Nam</div>
              <button className="mid-banner-btn">Khám phá →</button>
            </div>
          </Link>
        </div>
      </div>

      {/* ===== HÀNG MỚI VỀ ===== */}
      <section className="section section-bg-light">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">✨ Hàng Mới Về</h2>
            <Link to="/products?tag=new" className="see-all">Xem tất cả →</Link>
          </div>
          <div className="product-grid-4">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

    </div>
  );
}