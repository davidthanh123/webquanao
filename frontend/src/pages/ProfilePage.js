// src/pages/ProfilePage.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import { User, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(form);
      setUser(res.data.user);
      toast.success('Cập nhật thành công!');
    } catch { toast.error('Có lỗi xảy ra'); }
    finally { setLoading(false); }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="profile-title">Tài Khoản Của Tôi</h1>
        <div className="profile-layout">
          {/* Avatar Section */}
          <div className="profile-avatar-card">
            <div className="avatar-wrapper">
              {user?.avatar
                ? <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.avatar}`} alt={user.name} className="profile-avatar-img" />
                /* 📷 AVATAR USER: 120x120px - hiển thị trong trang profile */
                : <div className="avatar-placeholder"><User size={50} /></div>
              }
              <button className="change-avatar-btn" title="Thay avatar">
                {/* 📷 NÚT ĐỔI AVATAR: Khi click sẽ cho chọn ảnh mới từ máy tính */}
                <Camera size={16} />
              </button>
            </div>
            <h3 className="avatar-name">{user?.name}</h3>
            <p className="avatar-email">{user?.email}</p>
            <span className="user-role-badge">{user?.role === 'admin' ? '👑 Admin' : '👤 Thành viên'}</span>
          </div>

          {/* Form */}
          <div className="profile-form-card">
            <h3>Thông tin cá nhân</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ và tên</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-input" value={user?.email} disabled style={{ background: '#f5f5f5', color: 'var(--text-light)' }} />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901234567" />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}