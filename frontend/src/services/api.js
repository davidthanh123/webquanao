// src/services/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'https://webquanao-production.up.railway.app/api' });

// Tự động gắn token vào header
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (slug) => API.get(`/products/${slug}`);
export const getCategories = () => API.get('/products/meta/categories');
export const addProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const addReview = (id, data) => API.post(`/products/${id}/reviews`, data);

// Cart
export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart/add', data);
export const updateCart = (data) => API.put('/cart/update', data);
export const removeFromCart = (data) => API.delete('/cart/remove', { data });

// Orders
export const createOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my-orders');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);
export const getAllOrders = (params) => API.get('/orders', { params });
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });

// Users
export const updateProfile = (data) => API.put('/users/profile', data);
export const addAddress = (data) => API.post('/users/address', data);
export const deleteAddress = (id) => API.delete(`/users/address/${id}`);
export const getAllUsers = () => API.get('/users');

// Banners
export const getBanners = () => API.get('/banners');

export default API;