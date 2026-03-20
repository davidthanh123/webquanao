// src/pages/OrdersPage.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { getMyOrders, cancelOrder } from '../services/api';
import toast from 'react-hot-toast';
import './OrdersPage.css';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', color: '#f5a623', bg: '#fff8ed' },
  confirmed: { label: 'Đã xác nhận', color: '#4a90d9', bg: '#eef5ff' },
  shipping: { label: 'Đang giao', color: '#9b59b6', bg: '#f8f0ff' },
  delivered: { label: 'Đã giao', color: '#2ebb77', bg: '#edfaf4' },
  cancelled: { label: 'Đã hủy', color: '#999', bg: '#f5f5f5' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    getMyOrders().then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      await cancelOrder(id);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
      toast.success('Đã hủy đơn hàng');
    } catch (err) { toast.error(err.response?.data?.message || 'Không thể hủy'); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-title">Đơn Hàng Của Tôi</h1>
        {orders.length === 0 ? (
          <div className="empty-state">
            <Package size={64} style={{ color: 'var(--border)', margin: '0 auto 16px', display: 'block' }} />
            {/* 📷 ẢNH ĐỀN HÀNG TRỐNG: empty-orders.png (240x240px) */}
            <p>Bạn chưa có đơn hàng nào</p>
            <Link to="/products" className="btn-primary">Mua sắm ngay</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const expanded = expandedId === order.id;
              return (
                <div key={order.id} className="order-card">
                  <div className="order-header" onClick={() => setExpandedId(expanded ? null : order.id)}>
                    <div className="order-id-block">
                      <span className="order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="order-date">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <span className="order-status" style={{ color: status.color, background: status.bg }}>{status.label}</span>
                    <span className="order-total">{formatPrice(order.total)}</span>
                    <button className="expand-btn">{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
                  </div>

                  {expanded && (
                    <div className="order-details">
                      <div className="order-items-list">
                        {order.items.map((item, i) => (
                          <div key={i} className="order-item">
                            {/* 📷 ẢNH SẢN PHẨM TRONG ĐƠN: 64x64px */}
                            <img src={item.image ? `http://localhost:5000${item.image}` : '/images/placeholder.jpg'} alt={item.productName} />
                            <div style={{ flex: 1 }}>
                              <p className="item-name">{item.productName}</p>
                              <p className="item-variant">{item.color} / {item.size} × {item.quantity}</p>
                            </div>
                            <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-info-grid">
                        <div>
                          <h4>Địa chỉ giao hàng</h4>
                          <p>{order.shippingAddress?.name} - {order.shippingAddress?.phone}</p>
                          <p>{order.shippingAddress?.address}</p>
                        </div>
                        <div>
                          <h4>Thanh toán</h4>
                          <p>{order.paymentMethod === 'COD' ? '💵 Tiền mặt khi nhận' : order.paymentMethod === 'BANK' ? '🏦 Chuyển khoản' : '💜 MoMo'}</p>
                          {order.note && <p>Ghi chú: {order.note}</p>}
                        </div>
                        <div className="order-pricing">
                          <div className="summary-row"><span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
                          <div className="summary-row"><span>Vận chuyển</span><span>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span></div>
                          <div className="summary-row" style={{ fontWeight: 700 }}><span>Tổng</span><span className="price-current">{formatPrice(order.total)}</span></div>
                        </div>
                      </div>
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button className="btn-outline" style={{ color: 'var(--primary)', marginTop: 12 }} onClick={() => handleCancel(order.id)}>
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}