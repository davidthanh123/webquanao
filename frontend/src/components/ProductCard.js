// src/components/ProductCard.jsx
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

// ── FIX BUG 2: Helper URL ảnh ─────────────────────────────────────────────
// Nếu img đã là URL đầy đủ (https://images.unsplash.com/...) → dùng thẳng
// Nếu là path tương đối → prefix backend
function getImageUrl(img) {
  if (!img) return '/images/placeholder.jpg';
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  return `http://localhost:5000${img}`;
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const {
    id,
    slug,
    name,
    price,
    originalPrice,
    images,
    rating,
    sold,
    tags,
  } = product;

  const imageList = Array.isArray(images) ? images : [];
  const tagList   = Array.isArray(tags)   ? tags   : [];

  const discount = originalPrice > price
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  const isSale       = discount > 0 || tagList.includes('sale');
  const isNew        = tagList.includes('new');
  const isBestseller = tagList.includes('bestseller');

  const handleAddToCart = (e) => {
    e.preventDefault(); // không navigate khi click nút
    addItem(id, 1);
    toast.success('Đã thêm vào giỏ hàng');
  };

  // Dùng slug nếu có, fallback sang id
  const productLink = `/products/${slug || id}`;

  return (
    <Link to={productLink} className="product-card">
      <div className="product-card-img-wrapper">
        {/* ── FIX BUG 2: dùng getImageUrl ── */}
        <img
          src={getImageUrl(imageList[0])}
          alt={name}
          className="product-card-img"
          loading="lazy"
          onError={e => { e.target.src = '/images/placeholder.jpg'; }}
        />

        {/* Badges */}
        <div className="product-badges">
          {discount > 0 && (
            <span className="badge badge-red">-{discount}%</span>
          )}
          {isNew && !isSale && (
            <span className="badge badge-green">MỚI</span>
          )}
          {isBestseller && (
            <span className="badge badge-orange">BÁN CHẠY</span>
          )}
        </div>

        {/* Quick add to cart */}
        <button
          className="product-card-quick-add"
          onClick={handleAddToCart}
          title="Thêm vào giỏ"
        >
          <ShoppingCart size={16} />
          Thêm vào giỏ
        </button>
      </div>

      <div className="product-card-info">
        <h3 className="product-card-name">{name}</h3>

        <div className="product-card-price">
          <span className="price-current">{formatPrice(price)}</span>
          {originalPrice > price && (
            <span className="price-original">{formatPrice(originalPrice)}</span>
          )}
        </div>

        <div className="product-card-meta">
          <span className="stars">
            <Star size={12} fill="#f5a623" stroke="none" /> {rating}
          </span>
          <span className="sold-count">Đã bán {sold?.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}