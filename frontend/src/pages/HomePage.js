// src/pages/HomePage.js
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { getBanners, getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const timerRef = useRef();

  useEffect(() => {
    getBanners().then(r => setBanners(r.data)).catch(() => {});
    getCategories().then(r => setCategories(r.data)).catch(() => {});
    getProducts({ sort: 'bestseller', limit: 8 }).then(r => setBestsellers(r.data.products)).catch(() => {});
    getProducts({ tag: 'new', limit: 8 }).then(r => setNewArrivals(r.data.products)).catch(() => {});
    getProducts({ tag: 'sale', limit: 4 }).then(r => setFlashSale(r.data.products)).catch(() => {});
  }, []);

  // Auto slide banner
  useEffect(() => {
    if (banners.length === 0) return;
    timerRef.current = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 4000);
    return () => clearInterval(timerRef.current);
  }, [banners]);

  const prevBanner = () => { clearInterval(timerRef.current); setBannerIdx(i => (i - 1 + banners.length) % banners.length); };
  const nextBanner = () => { clearInterval(timerRef.current); setBannerIdx(i => (i + 1) % banners.length); };

  return (
    <div className="homepage">
      {/* ====== BANNER SLIDER ====== */}
      <section className="banner-section">
        <div className="banner-slider">
          {banners.length > 0 ? banners.map((b, i) => (
            <div key={b.id} className={`banner-slide ${i === bannerIdx ? 'active' : ''}`}>
              {/* 📷 BANNER: Ảnh banner lớn (1200x400px) - đặt trong /public/images/banners/ */}
              <img src={`http://localhost:5000${b.image}`} alt={b.title} className="banner-img" />
              <div className="banner-overlay">
                <h2>{b.title}</h2>
                <p>{b.subtitle}</p>
                <Link to={b.link} className="btn-primary">Mua Ngay</Link>
              </div>
            </div>
          )) : (
            /* 📷 BANNER PLACEHOLDER: Hiển thị khi chưa có ảnh */
            <div className="banner-placeholder">
              <div className="banner-overlay">
                <h2>Bộ Sưu Tập Hè 2025</h2>
                <p>Giảm đến 50% toàn bộ sản phẩm</p>
                <Link to="/products" className="btn-primary">Mua Ngay</Link>
              </div>
            </div>
          )}
          <button className="banner-btn prev" onClick={prevBanner}><ChevronLeft size={24} /></button>
          <button className="banner-btn next" onClick={nextBanner}><ChevronRight size={24} /></button>
          <div className="banner-dots">
            {banners.map((_, i) => <button key={i} className={`dot ${i === bannerIdx ? 'active' : ''}`} onClick={() => setBannerIdx(i)} />)}
          </div>
        </div>
      </section>

      {/* ====== FEATURES BAR ====== */}
      <section className="features-bar">
        <div className="container features-grid">
          <div className="feature-item"><Truck size={28} /><div><strong>Miễn phí vận chuyển</strong><span>Đơn từ 500.000đ</span></div></div>
          <div className="feature-item"><Shield size={28} /><div><strong>Bảo đảm chính hãng</strong><span>100% hàng thật</span></div></div>
          <div className="feature-item"><RefreshCw size={28} /><div><strong>Đổi trả 30 ngày</strong><span>Không phát sinh phí</span></div></div>
          <div className="feature-item"><Headphones size={28} /><div><strong>Hỗ trợ 24/7</strong><span>Luôn sẵn sàng giúp đỡ</span></div></div>
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
                {/* 📷 ẢNH DANH MỤC: 200x200px - đặt trong /public/images/categories/ */}
                <img
                  src={`http://localhost:5000${cat.image}`}
                  alt={cat.name}
                  className="category-img"
                  onError={e => { e.target.style.display='none'; }}
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
          {/* 📷 BANNER QUẢNG CÁO TRÁI: 580x200px - đặt trong /public/images/banners/mid-banner-left.jpg */}
          <Link to="/products?category=ao-nu" className="mid-banner">
            <img src="http://localhost:5000/images/banners/mid-banner-left.jpg" alt="Thời trang nữ"
              onError={e => { e.target.parentElement.style.background='linear-gradient(135deg,#f093fb,#f5576c)'; e.target.style.display='none'; }}
            />
            <div className="mid-banner-text"><h3>Thời Trang Nữ</h3><p>Mới về mỗi ngày</p></div>
          </Link>
          {/* 📷 BANNER QUẢNG CÁO PHẢI: 580x200px - đặt trong /public/images/banners/mid-banner-right.jpg */}
          <Link to="/products?category=ao-nam" className="mid-banner">
            <img src="http://localhost:5000/images/banners/mid-banner-right.jpg" alt="Thời trang nam"
              onError={e => { e.target.parentElement.style.background='linear-gradient(135deg,#4facfe,#00f2fe)'; e.target.style.display='none'; }}
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