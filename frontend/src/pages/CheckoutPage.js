// src/pages/CheckoutPage.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function CheckoutPage() {
  const { cart, cartTotal, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.address?.[0]?.phone || '',
    address: user?.address?.[0]?.address || '', note: '', paymentMethod: 'COD'
  });

  const shippingFee = cartTotal >= 500000 ? 0 : 30000;

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
    setLoading(true);
    try {
      const items = cart.map(i => ({ productId: i.productId, quantity: i.quantity, size: i.size, color: i.color }));
      const res = await createOrder({ items, shippingAddress: { name: form.name, phone: form.phone, address: form.address }, paymentMethod: form.paymentMethod, note: form.note });
      toast.success('Đặt hàng thành công! 🎉');
      await fetchCart();
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Thanh Toán</h1>
        <form onSubmit={handleSubmit} className="checkout-layout">
          {/* Left: Form */}
          <div className="checkout-form">
            <div className="checkout-section">
              <h3>Thông tin giao hàng</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ tên *</label>
                  <input name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" required />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="0901234567" required />
                </div>
              </div>
              <div className="form-group">
                <label>Địa chỉ *</label>
                <input name="address" className="form-input" value={form.address} onChange={handleChange} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" required />
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea name="note" className="form-input" rows={3} value={form.note} onChange={handleChange} placeholder="Ghi chú cho đơn hàng (không bắt buộc)" />
              </div>
            </div>

            <div className="checkout-section">
              <h3>Phương thức thanh toán</h3>
              <div className="payment-options">
                {[['COD', '💵', 'Thanh toán khi nhận hàng', 'Trả tiền mặt khi nhận được hàng'],
                  ['BANK', '🏦', 'Chuyển khoản ngân hàng', 'Chuyển khoản trước khi giao hàng'],
                  ['MOMO', '💜', 'Ví MoMo', 'Thanh toán qua ứng dụng MoMo']
                ].map(([val, icon, label, desc]) => (
                  <label key={val} className={`payment-option ${form.paymentMethod === val ? 'active' : ''}`}>
                    <input type="radio" name="paymentMethod" value={val} checked={form.paymentMethod === val} onChange={handleChange} hidden />
                    <span className="payment-icon">{icon}</span>
                    <div><strong>{label}</strong><p>{desc}</p></div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary">
            <h3>Đơn hàng của bạn</h3>
            <div className="checkout-items">
              {cart.map(item => (
                <div key={`${item.productId}-${item.size}`} className="checkout-item">
                  <div className="checkout-item-img-wrapper">
                    {/* 📷 ẢNH SẢN PHẨM KHI CHECKOUT: 60x60px */}
                    <img src={item.product?.images?.[0] ? `http://localhost:5000${item.product.images[0]}` : '/images/placeholder.jpg'} alt={item.product?.name} />
                    <span className="item-qty-badge">{item.quantity}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="checkout-item-name">{item.product?.name}</p>
                    <p className="checkout-item-variant">{item.color} / {item.size}</p>
                  </div>
                  <span className="checkout-item-price">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <hr className="divider" />
            <div className="summary-row"><span>Tạm tính</span><span>{formatPrice(cartTotal)}</span></div>
            <div className="summary-row"><span>Vận chuyển</span><span>{shippingFee === 0 ? <span style={{color:'var(--success)'}}>Miễn phí</span> : formatPrice(shippingFee)}</span></div>
            <hr className="divider" />
            <div className="summary-row" style={{ fontWeight: 700, fontSize: 16 }}>
              <span>Tổng cộng</span>
              <span className="price-current" style={{ fontSize: 20 }}>{formatPrice(cartTotal + shippingFee)}</span>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14, fontSize: 16, marginTop: 20 }} disabled={loading}>
              {loading ? 'Đang xử lý...' : '✅ Đặt hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}