// src/context/CartContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart, updateCart, removeFromCart } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchCart();
    else { setCart([]); setCartCount(0); }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await getCart();
      setCart(res.data.items);
      setCartCount(res.data.items.reduce((sum, i) => sum + i.quantity, 0));
    } catch {}
  };

  const addItem = async (productId, quantity, size, color) => {
    if (!user) { toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng'); return; }
    try {
      await addToCart({ productId, quantity, size, color });
      await fetchCart();
      toast.success('Đã thêm vào giỏ hàng!');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const updateItem = async (productId, quantity, size, color) => {
    try {
      await updateCart({ productId, quantity, size, color });
      await fetchCart();
    } catch {}
  };

  const removeItem = async (productId, size, color) => {
    try {
      await removeFromCart({ productId, size, color });
      await fetchCart();
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch {}
  };

  const cartTotal = cart.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, addItem, updateItem, removeItem, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);