// src/components/Navbar.js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${searchQuery}`);
  };

  const handleLogout = () => {
    logoutUser();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      {/* Top bar */}
      <div className="navbar-top">
        <div className="container navbar-top-inner">
          <span>Kênh Người Bán</span>
          <span>|</span>
          <span>Tải ứng dụng</span>
          <span style={{ marginLeft: 'auto' }}>Kết nối: FB · IG</span>
        </div>
      </div>

      {/* Main bar */}
      <div className="navbar-main">
        <div className="container navbar-main-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            {/* 📷 ẢNH LOGO: Thay thẻ <span> bằng <img src="/images/logo.png" alt="Logo" style={{height:40}} /> */}
            <span className="logo-text">Fashion<span>Store</span></span>
          </Link>

          {/* Search */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <Search size={18} />
            </button>
          </form>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Cart */}
            <Link to="/cart" className="action-btn cart-btn">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="user-menu-wrapper">
                <button className="action-btn user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  {user.avatar
                    ? <img src={`http://localhost:5000${user.avatar}`} alt={user.name} className="user-avatar" />
                    /* 📷 ẢNH: Avatar user hiển thị trên navbar */
                    : <User size={22} />
                  }
                  <span className="user-name-short">{user.name.split(' ').pop()}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}><User size={14} /> Tài khoản</Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)}><Package size={14} /> Đơn hàng</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}><Settings size={14} /> Quản trị</Link>
                    )}
                    <hr />
                    <button onClick={handleLogout}><LogOut size={14} /> Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/register">Đăng Ký</Link>
                <span>|</span>
                <Link to="/login">Đăng Nhập</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories bar */}
      <div className="navbar-cats">
        <div className="container navbar-cats-inner">
          <Link to="/products">Tất cả</Link>
          <Link to="/products?category=ao-nam">Áo Nam</Link>
          <Link to="/products?category=quan-nam">Quần Nam</Link>
          <Link to="/products?category=ao-nu">Áo Nữ</Link>
          <Link to="/products?category=quan-nu">Quần Nữ</Link>
          <Link to="/products?category=vay-dam">Váy Đầm</Link>
          <Link to="/products?category=phu-kien">Phụ Kiện</Link>
          <Link to="/products?tag=sale" style={{ color: '#ee4d2d', fontWeight: 700 }}>🔥 Flash Sale</Link>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch} style={{ padding: '12px 16px' }}>
            <input className="form-input" type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </form>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Sản phẩm</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>Giỏ hàng ({cartCount})</Link>
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Tài khoản</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>Đơn hàng</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}