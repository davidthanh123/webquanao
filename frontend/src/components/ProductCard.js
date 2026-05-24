// src/components/ProductCard.js
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

function getImageUrl(img) {
  if (!img) return 'https://placehold.co/300x400?text=No+Image';
  if (img.includes('susercontent.com') || img.includes('shopee')) {
    return `https://webquanao-pe7a.onrender.com/api/proxy-image?url=${encodeURIComponent(img)}`;
  }
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  const base = 'https://webquanao-pe7a.onrender.com';
  const path = img.startsWith('/images/') ? img : `/images/${img}`;
  return `${base}${path}`;
}

export default function ProductCard({ product, dark = false }) {
  const { addItem } = useCart();
  const { id, slug, name, price, originalPrice, images, rating, sold, tags } = product;

  const imageList = Array.isArray(images) ? images : [];
  const tagList   = Array.isArray(tags)   ? tags   : [];

  const discount     = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
  const isSale       = discount > 0 || tagList.includes('sale');
  const isNew        = tagList.includes('new');
  const isBestseller = tagList.includes('bestseller');

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(id, 1);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const productLink = `/products/${slug || id}`;

  return (
    <Link to={productLink} className={`product-card${dark ? ' dark' : ''}`}>
      <div className="product-card-img-wrapper">
        <img
          src={getImageUrl(imageList[0])}
          alt={name}
          className="product-card-img"
          loading="lazy"
          onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400?text=No+Image'; }}
        />

        {/* Badges */}
        <div className="product-badges">
          {discount > 0 && <span className="badge badge-red">-{discount}%</span>}
          {isNew && !isSale && <span className="badge badge-green">MỚI</span>}
          {isBestseller && <span className="badge badge-orange">BÁN CHẠY</span>}
        </div>

        {/* Quick add */}
        <button className="product-card-quick-add" onClick={handleAddToCart} title="Thêm vào giỏ">
          <ShoppingCart size={14} />
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
            <Star size={11} fill="#f5a623" stroke="none" /> {rating}
          </span>
          <span className="sold-count">Đã bán {sold?.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}