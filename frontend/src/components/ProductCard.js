// src/components/ProductCard.jsx
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Parse images: có thể là array hoặc JSON string từ MySQL
function getImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try { return JSON.parse(images); } catch { return []; }
}

// Trả về src ảnh đúng:
// - URL đầy đủ (http/https) → dùng thẳng
// - Path nội bộ (/images/...) → prefix Railway backend
// - Không có ảnh → placeholder
const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://webquanao-production.up.railway.app';

function getImageSrc(img) {
  if (!img) return '/images/placeholder.jpg';
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  return `${BACKEND}${img}`;
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const images   = getImages(product.images);
  const firstImg = getImageSrc(images[0]);

  // Parse tags/sizes/colors nếu là JSON string
  const tags   = Array.isArray(product.tags)   ? product.tags   : (() => { try { return JSON.parse(product.tags);   } catch { return []; } })();
  const sizes  = Array.isArray(product.sizes)  ? product.sizes  : (() => { try { return JSON.parse(product.sizes);  } catch { return []; } })();
  const colors = Array.isArray(product.colors) ? product.colors : (() => { try { return JSON.parse(product.colors); } catch { return []; } })();

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    addItem(product.id, 1, sizes[0] || 'M', colors[0] || '');
  };

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-image-wrapper">
        <img
          src={firstImg}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
          onError={e => { e.currentTarget.src = '/images/placeholder.jpg'; }}
        />

        <div className="product-card-badges">
          {discount > 0 && <span className="badge badge-red">-{discount}%</span>}
          {tags.includes('new')        && <span className="badge badge-orange">Mới</span>}
          {tags.includes('bestseller') && <span className="badge badge-green">Bán chạy</span>}
        </div>

        <button className="quick-add-btn" onClick={handleQuickAdd}>
          <ShoppingCart size={16} /> Thêm vào giỏ
        </button>
      </div>

      <div className="product-card-info">
        <p className="product-card-name">{product.name}</p>
        <div className="product-card-price">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="price-original">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        <div className="product-card-meta">
          <span className="stars">
            <Star size={12} fill="#f5a623" stroke="none" />
            {product.rating?.toFixed(1)}
          </span>
          <span className="sold-count">Đã bán {product.sold?.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}