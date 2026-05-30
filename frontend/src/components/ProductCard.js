// src/components/ProductCard.js
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const BASE_URL = 'https://webquanao-pe7a.onrender.com';

function getImageUrl(img) {
  if (!img) return null;
  // Ảnh đã được cache về server (local path)
  if (img.startsWith('/images/')) return `${BASE_URL}${img}`;
  // Ảnh Shopee còn sót → dùng proxy
  if (img.includes('susercontent.com') || img.includes('shopee')) {
    return `${BASE_URL}/api/proxy-image?url=${encodeURIComponent(img)}`;
  }
  // URL tuyệt đối khác
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  return `${BASE_URL}/images/${img}`;
}

const PLACEHOLDER = 'https://placehold.co/300x400?text=No+Image';

// Component ảnh có fallback thông minh: thử từng ảnh trong list trước khi dùng placeholder
function ProductImage({ imageList, name }) {
  const [idx, setIdx] = useState(0);

  const src = getImageUrl(imageList[idx]) || PLACEHOLDER;

  const handleError = () => {
    if (idx + 1 < imageList.length) {
      // Thử ảnh tiếp theo trong danh sách
      setIdx(idx + 1);
    } else {
      // Hết ảnh → dùng placeholder, không retry nữa
      setIdx(-1);
    }
  };

  return (
    <img
      src={idx === -1 ? PLACEHOLDER : src}
      alt={name}
      className="product-card-img"
      loading="lazy"
      onError={idx === -1 ? undefined : handleError}
    />
  );
}

export default function ProductCard({ product, dark = false }) {
  const { addItem } = useCart();
  const { id, slug, name, price, originalPrice, images, rating, sold, tags } = product;

  const imageList = Array.isArray(images) ? images.filter(Boolean) : [];
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
        <ProductImage imageList={imageList} name={name} />

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