// src/components/ProductCard.js
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    addItem(product.id, 1, product.sizes?.[0] || 'M', product.colors?.[0] || '');
  };

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-image-wrapper">
        {/* 📷 ẢNH SẢN PHẨM: hiển thị ảnh đầu tiên của sản phẩm (600x600px) */}
        <img
          src={product.images?.[0]
            ? `http://localhost:5000${product.images[0]}`
            : '/images/placeholder.jpg' /* 📷 ẢNH PLACEHOLDER: 600x600px khi chưa có ảnh */
          }
          alt={product.name}
          className="product-card-img"
          loading="lazy"
        />

        {/* Badges */}
        <div className="product-card-badges">
          {discount > 0 && <span className="badge badge-red">-{discount}%</span>}
          {product.tags?.includes('new') && <span className="badge badge-orange">Mới</span>}
          {product.tags?.includes('bestseller') && <span className="badge badge-green">Bán chạy</span>}
        </div>

        {/* Quick add button */}
        <button className="quick-add-btn" onClick={handleQuickAdd}>
          <ShoppingCart size={16} />
          Thêm vào giỏ
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