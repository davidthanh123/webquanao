// src/pages/LoginPage.js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      toast.success(`Chào mừng ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* 📷 LOGO AUTH: Thay bằng <img src="/images/logo.png" alt="Logo" style={{height:48, margin:'0 auto 8px', display:'block'}} /> */}
        <h1 className="auth-logo">Fashion<span>Store</span></h1>
        <h2 className="auth-title">Đăng Nhập</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" placeholder="example@email.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="auth-social">
          <p>Hoặc đăng nhập với</p>
          <a href="https://webquanao-production.up.railway.app/api/auth/google" className="btn-google">
            <img src="https://www.google.com/favicon.ico" alt="Google" width={20} />
            Tiếp tục với Google
          </a>

<a href="https://webquanao-production.up.railway.app/api/auth/facebook" className="btn-facebook">
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook" width={20} />
            Tiếp tục với Facebook
          </a>
        </div>

        <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </div>
    </div>
  );
}