// src/pages/ProductDetailPage.js
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, ChevronRight, Minus, Plus } from 'lucide-react';
import { getProduct, addReview } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    setLoading(true);
    getProduct(slug)
      .then(r => { setProduct(r.data); setSelectedSize(r.data.sizes?.[0] || ''); setSelectedColor(r.data.colors?.[0] || ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Vui lòng chọn kích cỡ'); return; }
    addItem(product.id, quantity, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // navigate to checkout after adding
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Vui lòng đăng nhập để đánh giá'); return; }
    try {
      await addReview(product.id, { userId: user.id, ...reviewForm });
      toast.success('Cảm ơn đánh giá của bạn!');
      const res = await getProduct(slug);
      setProduct(res.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  if (loading) return <div className="spinner" />;
  if (!product) return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>Không tìm thấy sản phẩm</div>;

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Trang chủ</Link><ChevronRight size={14} />
          <Link to="/products">Sản phẩm</Link><ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        {/* Main */}
        <div className="detail-main">
          {/* Images */}
          <div className="detail-images">
            <div className="main-img-wrapper">
              {/* 📷 ẢNH CHÍNH SẢN PHẨM: 600x600px - zoom khi hover */}
              <img
                src={product.images?.[selectedImg] ? `http://localhost:5000${product.images[selectedImg]}` : '/images/placeholder.jpg'}
                alt={product.name}
                className="main-img"
              />
              {discount > 0 && <span className="detail-badge badge badge-red">-{discount}%</span>}
            </div>
            <div className="thumb-list">
              {product.images?.map((img, i) => (
                <button key={i} className={`thumb-btn ${i === selectedImg ? 'active' : ''}`} onClick={() => setSelectedImg(i)}>
                  {/* 📷 ẢNH THU NHỎ: 80x80px - ảnh phụ của sản phẩm */}
                  <img src={`http://localhost:5000${img}`} alt={`Ảnh ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="detail-info">
            <h1 className="detail-name">{product.name}</h1>
            <div className="detail-meta">
              <span className="stars"><Star size={14} fill="#f5a623" stroke="none" /> {product.rating}</span>
              <span className="divider-v">|</span>
              <span>{product.reviewCount} đánh giá</span>
              <span className="divider-v">|</span>
              <span>Đã bán {product.sold?.toLocaleString()}</span>
            </div>

            <div className="detail-price-box">
              <span className="price-current" style={{ fontSize: 28 }}>{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <><span className="price-original" style={{ fontSize: 16 }}>{formatPrice(product.originalPrice)}</span>
                <span className="badge badge-red">{discount}% giảm</span></>
              )}
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="option-group">
                <label>Màu sắc: <strong>{selectedColor}</strong></label>
                <div className="option-list">
                  {product.colors.map(c => (
                    <button key={c} className={`option-btn ${selectedColor === c ? 'active' : ''}`} onClick={() => setSelectedColor(c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="option-group">
                <label>Kích cỡ: <strong>{selectedSize}</strong></label>
                <div className="option-list">
                  {product.sizes.map(s => (
                    <button key={s} className={`option-btn size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="option-group">
              <label>Số lượng:</label>
              <div className="quantity-control">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={14} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}><Plus size={14} /></button>
                <span className="stock-info">{product.stock} sản phẩm có sẵn</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="detail-actions">
              <button className="btn-outline" style={{ flex: 1 }} onClick={handleAddToCart}>
                <ShoppingCart size={18} /> Thêm vào giỏ
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleBuyNow}>
                Mua ngay
              </button>
              <button className="btn-ghost wishlist-btn"><Heart size={20} /></button>
            </div>

            {/* Shipping info */}
            <div className="shipping-info">
              <p>🚚 Miễn phí vận chuyển cho đơn từ <strong>500.000đ</strong></p>
              <p>🔄 Đổi trả trong <strong>30 ngày</strong> nếu có lỗi từ nhà sản xuất</p>
              <p>✅ Hàng chính hãng 100%</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <div className="tab-buttons">
            {[['desc', 'Mô tả sản phẩm'], ['reviews', `Đánh giá (${product.reviewCount})`]].map(([t, l]) => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{l}</button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'desc' && (
              <div className="product-description">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-section">
                {/* Review form */}
                <div className="review-form-wrapper">
                  <h4>Viết đánh giá</h4>
                  <form onSubmit={handleReview}>
                    <div className="rating-select">
                      {[5,4,3,2,1].map(r => (
                        <button type="button" key={r} className={`star-btn ${reviewForm.rating >= r ? 'active' : ''}`}
                          onClick={() => setReviewForm(f => ({ ...f, rating: r }))}>★</button>
                      ))}
                    </div>
                    <textarea className="form-input" rows={3} placeholder="Chia sẻ cảm nhận của bạn..."
                      value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
                    <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>Gửi đánh giá</button>
                  </form>
                </div>

                {/* Reviews list */}
                {product.reviews?.length === 0 ? <p style={{ color: 'var(--text-light)', padding: '20px 0' }}>Chưa có đánh giá nào</p> :
                  product.reviews?.map(r => (
                    <div key={r.id} className="review-item">
                      <div className="review-header">
                        {/* 📷 AVATAR REVIEWER: 40x40px - avatar người đánh giá */}
                        <div className="review-avatar">{r.userName?.[0]?.toUpperCase()}</div>
                        <div>
                          <strong>{r.userName}</strong>
                          <div className="stars" style={{ fontSize: 12 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                        </div>
                        <span className="review-date">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="review-comment">{r.comment}</p>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}