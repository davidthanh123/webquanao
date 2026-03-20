// src/pages/RegisterPage.js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Mật khẩu không khớp'); return; }
    if (form.password.length < 6) { toast.error('Mật khẩu tối thiểu 6 ký tự'); return; }
    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      loginUser(res.data.token, res.data.user);
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">Fashion<span>Store</span></h1>
        <h2 className="auth-title">Tạo Tài Khoản</h2>
        <form onSubmit={handleSubmit}>
          {[['name','text','Họ và tên','Nguyễn Văn A'],['email','email','Email','example@email.com'],['phone','tel','Số điện thoại','0901234567'],['password','password','Mật khẩu','Tối thiểu 6 ký tự'],['confirmPassword','password','Xác nhận mật khẩu','Nhập lại mật khẩu']].map(([key, type, label, ph]) => (
            <div className="form-group" key={key}>
              <label>{label}</label>
              <input className="form-input" type={type} placeholder={ph} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={key !== 'phone'} />
            </div>
          ))}
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký'}
          </button>
        </form>
        <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </div>
    </div>
  );
}