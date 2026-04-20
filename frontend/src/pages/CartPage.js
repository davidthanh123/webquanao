// src/pages/CartPage.js
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartPage.css';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function CartPage() {
  const { cart, cartTotal, updateItem, removeItem } = useCart();
  const navigate = useNavigate();
  const shippingFee = cartTotal >= 500000 ? 0 : 30000;

  if (cart.length === 0) return (
    <div className="container empty-cart">
      {/* 📷 ẢNH GIỎ HÀNG TRỐNG: empty-cart.png (280x280px) */}
      <ShoppingBag size={80} style={{ color: 'var(--border)', margin: '0 auto 16px', display: 'block' }} />
      <h2>Giỏ hàng trống</h2>
      <p>Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
      <Link to="/products" className="btn-primary">Mua sắm ngay</Link>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">Giỏ hàng ({cart.length} sản phẩm)</h1>
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            <div className="cart-header-row">
              <span style={{ flex: 3 }}>Sản phẩm</span>
              <span>Đơn giá</span>
              <span>Số lượng</span>
              <span>Thành tiền</span>
              <span></span>
            </div>
            {cart.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="cart-item">
                {/* 📷 ẢNH SẢN PHẨM TRONG GIỎ: 80x80px - thumbnail */}
                <img
                  src={item.product?.images?.[0] ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.product.images[0]}` : '/images/placeholder.jpg'}
                  alt={item.product?.name}
                  className="cart-item-img"
                />
                <div className="cart-item-info" style={{ flex: 2 }}>
                  <Link to={`/products/${item.product?.slug}`} className="cart-item-name">{item.product?.name}</Link>
                  <div className="cart-item-variant">
                    {item.color && <span>Màu: {item.color}</span>}
                    {item.size && <span>Size: {item.size}</span>}
                  </div>
                </div>
                <span className="price-current">{formatPrice(item.product?.price)}</span>
                <div className="quantity-control">
                  <button onClick={() => updateItem(item.productId, item.quantity - 1, item.size, item.color)}><Minus size={13} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateItem(item.productId, item.quantity + 1, item.size, item.color)}><Plus size={13} /></button>
                </div>
                <span className="item-subtotal">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                <button className="remove-btn" onClick={() => removeItem(item.productId, item.size, item.color)}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="summary-row"><span>Tạm tính</span><span>{formatPrice(cartTotal)}</span></div>
            <div className="summary-row">
              <span>Vận chuyển</span>
              <span>{shippingFee === 0 ? <span style={{ color: 'var(--success)' }}>Miễn phí</span> : formatPrice(shippingFee)}</span>
            </div>
            {shippingFee > 0 && <p className="free-ship-note">Mua thêm {formatPrice(500000 - cartTotal)} để được miễn phí vận chuyển</p>}
            <hr className="divider" />
            <div className="summary-row total-row">
              <span>Tổng cộng</span>
              <span className="price-current" style={{ fontSize: 20 }}>{formatPrice(cartTotal + shippingFee)}</span>
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: 14, fontSize: 16, marginTop: 16 }} onClick={() => navigate('/checkout')}>
              Tiến hành thanh toán
            </button>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: 'var(--primary)', fontSize: 14, fontWeight: 600 }}>
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}