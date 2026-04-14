// src/components/Navbar.jsx
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
          <Link to="/" className="navbar-logo">
            <span className="logo-text">Fashion<span>Store</span></span>
          </Link>

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

          <div className="navbar-actions">
            <Link to="/cart" className="action-btn cart-btn">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="user-menu-wrapper">
                <button className="action-btn user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="user-avatar" />
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

            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

     {/* ── Categories bar — Desktop với dropdown ──────────────────────────── */}
<nav className="navbar-cats">
  <div className="container navbar-cats-inner">

    <Link to="/products" className="nav-cat-link">Tất cả</Link>

    {/* Áo Nam */}
<div className="nav-dropdown-wrap">
  <span className="nav-cat-trigger">
    <Link to="/products?category=ao-nam" className="nav-cat-label">
      Áo Nam
    </Link>
    <ChevronDown size={12} className="nav-cat-arrow" />
  </span>
  <div className="nav-dropdown">
    <Link to="/products?category=ao-thun-nam">Áo Thun Nam</Link>
    <Link to="/products?category=ao-so-mi-nam">Áo Sơ Mi Nam</Link>
    <Link to="/products?category=ao-khoac-nam">Áo Khoác Nam</Link>
  </div>
</div>

{/* Quần Nam */}
<div className="nav-dropdown-wrap">
  <span className="nav-cat-trigger">
    <Link to="/products?category=quan-nam" className="nav-cat-label">
      Quần Nam
    </Link>
    <ChevronDown size={12} className="nav-cat-arrow" />
  </span>
  <div className="nav-dropdown">
    <Link to="/products?category=quan-nam">Quần Jean / Kaki</Link>
  </div>
</div>

{/* Áo Nữ */}
<div className="nav-dropdown-wrap">
  <span className="nav-cat-trigger">
    <Link to="/products?category=ao-nu" className="nav-cat-label">
      Áo Nữ
    </Link>
    <ChevronDown size={12} className="nav-cat-arrow" />
  </span>
  <div className="nav-dropdown">
    <Link to="/products?category=ao-thun-nu">Áo Thun Nữ</Link>
    <Link to="/products?category=ao-so-mi-nu">Áo Sơ Mi Nữ</Link>
    <Link to="/products?category=ao-khoac-nu">Áo Khoác Nữ</Link>
  </div>
</div>

{/* Váy Đầm */}
<div className="nav-dropdown-wrap">
  <span className="nav-cat-trigger">
    <Link to="/products?category=vay-dam" className="nav-cat-label">
      Váy Đầm
    </Link>
    <ChevronDown size={12} className="nav-cat-arrow" />
  </span>
  <div className="nav-dropdown">
    <Link to="/products?category=quan-nu">Quần Nữ</Link>
    <Link to="/products?category=vay">Váy</Link>
    <Link to="/products?category=dam-nu">Đầm Nữ</Link>
  </div>
</div>

{/* Phụ Kiện */}
<div className="nav-dropdown-wrap">
  <span className="nav-cat-trigger">
    <Link to="/products?category=phu-kien-cha" className="nav-cat-label">
      Phụ Kiện
    </Link>
    <ChevronDown size={12} className="nav-cat-arrow" />
  </span>
  <div className="nav-dropdown">
    <Link to="/products?category=tui-xach">Túi Xách</Link>
    <Link to="/products?category=giay-nam">Giày Nam</Link>
    <Link to="/products?category=giay-nu">Giày Nữ</Link>
    <Link to="/products?category=phu-kien">Phụ Kiện</Link>
  </div>
</div>

    <Link to="/products?category=do-the-thao" className="nav-cat-link">Thể Thao</Link>

    <Link to="/products?tag=sale" className="nav-cat-link nav-sale">
      🔥 Flash Sale
    </Link>

  </div>
</nav>

      {/* ── Mobile menu ────────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch} style={{ padding: '12px 16px' }}>
            <input
              className="form-input"
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="mobile-menu-section">Áo Nam</div>
          <Link to="/products?category=ao-thun-nam" onClick={() => setMenuOpen(false)}>↳ Áo Thun Nam</Link>
          <Link to="/products?category=ao-so-mi-nam" onClick={() => setMenuOpen(false)}>↳ Áo Sơ Mi Nam</Link>
          <Link to="/products?category=ao-khoac-nam" onClick={() => setMenuOpen(false)}>↳ Áo Khoác Nam</Link>

          <div className="mobile-menu-section">Quần Nam</div>
          <Link to="/products?category=quan-nam" onClick={() => setMenuOpen(false)}>↳ Quần Jean / Kaki</Link>

          <div className="mobile-menu-section">Áo Nữ</div>
          <Link to="/products?category=ao-thun-nu" onClick={() => setMenuOpen(false)}>↳ Áo Thun Nữ</Link>
          <Link to="/products?category=ao-so-mi-nu" onClick={() => setMenuOpen(false)}>↳ Áo Sơ Mi Nữ</Link>
          <Link to="/products?category=ao-khoac-nu" onClick={() => setMenuOpen(false)}>↳ Áo Khoác Nữ</Link>

          <div className="mobile-menu-section">Váy & Đầm</div>
          <Link to="/products?category=quan-nu" onClick={() => setMenuOpen(false)}>↳ Quần Nữ</Link>
          <Link to="/products?category=vay" onClick={() => setMenuOpen(false)}>↳ Váy</Link>
          <Link to="/products?category=dam-nu" onClick={() => setMenuOpen(false)}>↳ Đầm Nữ</Link>

          <div className="mobile-menu-section">Phụ Kiện</div>
          <Link to="/products?category=tui-xach" onClick={() => setMenuOpen(false)}>↳ Túi Xách</Link>
          <Link to="/products?category=giay-nam" onClick={() => setMenuOpen(false)}>↳ Giày Nam</Link>
          <Link to="/products?category=giay-nu" onClick={() => setMenuOpen(false)}>↳ Giày Nữ</Link>
          <Link to="/products?category=phu-kien" onClick={() => setMenuOpen(false)}>↳ Phụ Kiện</Link>

          <Link to="/products?category=do-the-thao" onClick={() => setMenuOpen(false)}>🏃 Thể Thao</Link>
          <Link to="/products?tag=sale" onClick={() => setMenuOpen(false)}>🔥 Flash Sale</Link>

          <hr style={{ border: '1px solid #eee', margin: 0 }} />
          <Link to="/cart" onClick={() => setMenuOpen(false)}>🛒 Giỏ hàng ({cartCount})</Link>

          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>👤 Tài khoản</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>📦 Đơn hàng</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}>🚪 Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>🔑 Đăng nhập</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>📝 Đăng ký</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}