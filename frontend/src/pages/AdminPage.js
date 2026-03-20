// src/pages/AdminPage.js
import { useState, useEffect } from 'react';
import { Package, Users, ShoppingBag, TrendingUp, Edit2, Trash2, Plus, X } from 'lucide-react';
import { getAllOrders, updateOrderStatus, getAllUsers, getProducts, addProduct, updateProduct, deleteProduct } from '../services/api';
import toast from 'react-hot-toast';
import './AdminPage.css';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const STATUS_OPTIONS = ['pending','confirmed','shipping','delivered','cancelled'];
const STATUS_LABELS = { pending:'Chờ xác nhận', confirmed:'Đã xác nhận', shipping:'Đang giao', delivered:'Đã giao', cancelled:'Đã hủy' };

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0 });
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', slug: '', categoryId: 'c1', price: '', originalPrice: '', stock: '', description: '', sizes: 'S,M,L,XL', colors: 'Đen,Trắng', images: '' });

  useEffect(() => {
    getAllOrders({ limit: 100 }).then(r => {
      setOrders(r.data.orders);
      const revenue = r.data.orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
      setStats(prev => ({ ...prev, totalOrders: r.data.total, totalRevenue: revenue }));
    }).catch(() => {});
    getAllUsers().then(r => { setUsers(r.data); setStats(prev => ({ ...prev, totalUsers: r.data.length })); }).catch(() => {});
    getProducts({ limit: 100 }).then(r => { setProducts(r.data.products); setStats(prev => ({ ...prev, totalProducts: r.data.total })); }).catch(() => {});
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success('Cập nhật trạng thái thành công');
    } catch { toast.error('Có lỗi'); }
  };

  const openProductForm = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setProductForm({ ...product, sizes: product.sizes?.join(',') || '', colors: product.colors?.join(',') || '', images: product.images?.join(',') || '' });
    } else {
      setProductForm({ name: '', slug: '', categoryId: 'c1', price: '', originalPrice: '', stock: '', description: '', sizes: 'S,M,L,XL', colors: 'Đen,Trắng', images: '' });
    }
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...productForm, price: Number(productForm.price), originalPrice: Number(productForm.originalPrice),
      stock: Number(productForm.stock), sizes: productForm.sizes.split(',').map(s => s.trim()),
      colors: productForm.colors.split(',').map(c => c.trim()), images: productForm.images.split(',').map(i => i.trim()).filter(Boolean)
    };
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        const res = await addProduct(data);
        setProducts(prev => [res.data, ...prev]);
        toast.success('Thêm sản phẩm thành công');
      }
      setShowProductForm(false);
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    try { await deleteProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); toast.success('Đã xóa'); }
    catch { toast.error('Có lỗi xảy ra'); }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <h1 className="admin-title">👑 Quản Trị Hệ Thống</h1>

        {/* Tabs */}
        <div className="admin-tabs">
          {[['dashboard','📊 Dashboard'],['orders','📦 Đơn hàng'],['products','👕 Sản phẩm'],['users','👥 Người dùng']].map(([t,l]) => (
            <button key={t} className={`admin-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{l}</button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="admin-stats">
            {[
              [TrendingUp, 'Doanh thu', formatPrice(stats.totalRevenue), 'var(--success)'],
              [ShoppingBag, 'Tổng đơn hàng', stats.totalOrders, '#4a90d9'],
              [Package, 'Sản phẩm', stats.totalProducts, 'var(--secondary)'],
              [Users, 'Người dùng', stats.totalUsers, 'var(--primary)'],
            ].map(([Icon, label, val, color]) => (
              <div key={label} className="stat-card">
                <div className="stat-icon" style={{ background: color + '20', color }}><Icon size={28} /></div>
                <div><p className="stat-label">{label}</p><p className="stat-value">{val}</p></div>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Ngày đặt</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td><code>#{order.id.slice(0,8).toUpperCase()}</code></td>
                    <td>{order.shippingAddress?.name}<br/><small>{order.shippingAddress?.phone}</small></td>
                    <td className="price-current">{formatPrice(order.total)}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <select className="status-select" value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
              <button className="btn-primary" onClick={() => openProductForm()}><Plus size={16} /> Thêm sản phẩm</button>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Giá</th><th>Kho</th><th>Đã bán</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        {/* 📷 ẢNH SẢN PHẨM TRONG ADMIN: 50x50px */}
                        <img src={p.images?.[0] ? `http://localhost:5000${p.images[0]}` : '/images/placeholder.jpg'} alt={p.name} style={{ width:50, height:50, objectFit:'cover', borderRadius:6 }} />
                      </td>
                      <td><strong>{p.name}</strong></td>
                      <td className="price-current">{formatPrice(p.price)}</td>
                      <td>{p.stock}</td>
                      <td>{p.sold}</td>
                      <td>
                        <div style={{ display:'flex', gap:8 }}>
                          <button className="icon-btn edit" onClick={() => openProductForm(p)}><Edit2 size={15} /></button>
                          <button className="icon-btn delete" onClick={() => handleDeleteProduct(p.id)}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowProductForm(false)}>
                <div className="modal-box">
                  <div className="modal-header">
                    <h3>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                    <button onClick={() => setShowProductForm(false)}><X size={20} /></button>
                  </div>
                  <form onSubmit={handleProductSubmit} className="product-form">
                    {[['name','text','Tên sản phẩm *'],['slug','text','Slug (vd: ao-thun-nam) *'],['price','number','Giá bán *'],['originalPrice','number','Giá gốc'],['stock','number','Tồn kho *']].map(([key,type,label]) => (
                      <div className="form-group" key={key}>
                        <label>{label}</label>
                        <input className="form-input" type={type} value={productForm[key]} onChange={e => setProductForm(f => ({...f,[key]:e.target.value}))} required={label.includes('*')} />
                      </div>
                    ))}
                    <div className="form-group">
                      <label>Mô tả</label>
                      <textarea className="form-input" rows={3} value={productForm.description} onChange={e => setProductForm(f => ({...f,description:e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label>Sizes (cách nhau bằng dấu phẩy)</label>
                      <input className="form-input" value={productForm.sizes} onChange={e => setProductForm(f => ({...f,sizes:e.target.value}))} placeholder="S,M,L,XL" />
                    </div>
                    <div className="form-group">
                      <label>Màu sắc (cách nhau bằng dấu phẩy)</label>
                      <input className="form-input" value={productForm.colors} onChange={e => setProductForm(f => ({...f,colors:e.target.value}))} placeholder="Đen,Trắng,Đỏ" />
                    </div>
                    <div className="form-group">
                      <label>
                        Đường dẫn ảnh (cách nhau bằng dấu phẩy)
                        {/* 📷 NHẬP ĐƯỜNG DẪN ẢNH: Nhập /images/products/ten-anh.jpg, cách nhau bởi dấu phẩy */}
                      </label>
                      <input className="form-input" value={productForm.images} onChange={e => setProductForm(f => ({...f,images:e.target.value}))} placeholder="/images/products/anh1.jpg,/images/products/anh2.jpg" />
                    </div>
                    <div style={{ display:'flex', gap:12, marginTop:8 }}>
                      <button type="submit" className="btn-primary" style={{ flex:1 }}>
                        {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                      </button>
                      <button type="button" className="btn-outline" onClick={() => setShowProductForm(false)}>Hủy</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Avatar</th><th>Tên</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Ngày đăng ký</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      {/* 📷 AVATAR ADMIN TABLE: 40x40px */}
                      {u.avatar ? <img src={`http://localhost:5000${u.avatar}`} alt={u.name} style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover' }} />
                        : <div style={{ width:40,height:40,borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700 }}>{u.name?.[0]}</div>}
                    </td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone || '-'}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role === 'admin' ? '👑 Admin' : '👤 User'}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}