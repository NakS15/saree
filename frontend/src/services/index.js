import api from './api';
import { buildQueryString } from '../utils/helpers';

export const productService = {
  getAll:          (params = {}) => api.get(`/products?${buildQueryString(params)}`),
  getBySlug:       (slug)        => api.get(`/products/${slug}`),
  getFeatured:     ()            => api.get('/products/featured'),
  getTrending:     ()            => api.get('/products/trending'),
  autocomplete:    (q)           => api.get(`/products/search/autocomplete?q=${encodeURIComponent(q)}`),
  getMyProducts:   (params = {}) => api.get(`/products/vendor/my-products?${buildQueryString(params)}`),
  create:          (data)        => api.post('/products', data),
  update:          (id, data)    => api.put(`/products/${id}`, data),
  delete:          (id)          => api.delete(`/products/${id}`),
};

export const orderService = {
  getMyOrders:   (params = {}) => api.get(`/orders/my-orders?${buildQueryString(params)}`),
  getById:       (id)          => api.get(`/orders/${id}`),
  cancel:        (id, reason)  => api.put(`/orders/${id}/cancel`, { reason }),
  track:         (id)          => api.get(`/orders/${id}/track`),
  getVendorOrders: (p = {})    => api.get(`/orders/vendor/orders?${buildQueryString(p)}`),
  updateStatus:  (id, data)    => api.put(`/orders/${id}/vendor-update`, data),
  createShipment:(id)          => api.post(`/orders/${id}/create-shipment`),
  getAnalytics:  (p = {})      => api.get(`/orders/vendor/analytics?${buildQueryString(p)}`),
};

export const paymentService = {
  createRazorpayOrder: (data) => api.post('/payments/razorpay/create-order', data),
  verifyRazorpay:      (data) => api.post('/payments/razorpay/verify', data),
  createCOD:           (data) => api.post('/payments/cod', data),
  requestRefund:       (id, reason) => api.post(`/payments/refund/${id}`, { reason }),
};

export const reviewService = {
  getByProduct:  (productId, p = {}) => api.get(`/reviews/${productId}?${buildQueryString(p)}`),
  create:        (productId, data)   => api.post(`/reviews/${productId}`, data),
  markHelpful:   (reviewId)          => api.post(`/reviews/${reviewId}/helpful`),
  delete:        (reviewId)          => api.delete(`/reviews/${reviewId}`),
};

export const categoryService = {
  getAll:     ()     => api.get('/categories'),
  getTree:    ()     => api.get('/categories/tree'),
  getBySlug:  (slug) => api.get(`/categories/${slug}`),
};

export const vendorService = {
  register:    (data) => api.post('/vendors/register', data),
  getProfile:  ()     => api.get('/vendors/profile'),
  updateProfile:(data)=> api.put('/vendors/profile', data),
  submitKYC:   (data) => api.post('/vendors/kyc', data),
  getStorefront:(slug)=> api.get(`/vendors/${slug}`),
};

export const adminService = {
  getAnalytics:      (p = {})     => api.get(`/admin/analytics?${buildQueryString(p)}`),
  getUsers:          (p = {})     => api.get(`/admin/users?${buildQueryString(p)}`),
  toggleUserStatus:  (id)         => api.put(`/admin/users/${id}/toggle-status`),
  getVendors:        (p = {})     => api.get(`/admin/vendors?${buildQueryString(p)}`),
  reviewVendor:      (id, data)   => api.put(`/admin/vendors/${id}/review`, data),
  getPendingProducts:()           => api.get('/admin/products/pending'),
  reviewProduct:     (id, data)   => api.put(`/admin/products/${id}/review`, data),
  getAllOrders:       (p = {})     => api.get(`/admin/orders?${buildQueryString(p)}`),
  getCategories:     ()           => api.get('/admin/categories'),
  createCategory:    (data)       => api.post('/admin/categories', data),
  updateCategory:    (id, data)   => api.put(`/admin/categories/${id}`, data),
  deleteCategory:    (id)         => api.delete(`/admin/categories/${id}`),
  getCoupons:        ()           => api.get('/admin/coupons'),
  createCoupon:      (data)       => api.post('/admin/coupons', data),
  deleteCoupon:      (id)         => api.delete(`/admin/coupons/${id}`),
};

export const uploadService = {
  uploadImages: (formData) => api.post('/upload/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadAvatar: (formData) => api.post('/upload/avatar',   formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadKYCDoc: (formData) => api.post('/upload/kyc-document', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const couponService = {
  validate: (code, orderAmount) => api.post('/coupons/validate', { code, orderAmount }),
};
