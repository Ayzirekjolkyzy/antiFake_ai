import api from './client';

// Auth
export const authAPI = {
  login: (data) => api.post('/api/v1/auth/login', data),
  register: (data) => api.post('/api/v1/auth/register', data),
};

// Countries
export const countriesAPI = {
  getAll: () => api.get('/api/v1/countries'),
  getById: (id) => api.get(`/api/v1/countries/${id}`),
};

// Brands
export const brandsAPI = {
  getAll: () => api.get('/api/v1/brands'),
  getById: (id) => api.get(`/api/v1/brands/${id}`),
  getByCountry: (id) => api.get(`/api/v1/brands/by-country/${id}`),
  search: (name) => api.get('/api/v1/brands/search', { params: { name } }),
  create: (data) => api.post('/api/v1/brands', data),
  update: (id, data) => api.patch(`/api/v1/brands/${id}`, data),
  delete: (id) => api.delete(`/api/v1/brands/${id}`),
};

// Products
export const productsAPI = {
  getAll: () => api.get('/api/v1/products'),

  getById: (id) => api.get(`/api/v1/products/${id}`),

  getByBrand: (id) => api.get(`/api/v1/products/by-brand/${id}`),

  getByCountry: (countryId) =>
    api.get(`/api/v1/products/by-country/${countryId}`),

  getByBarcode: (barcode) =>
    api.get('/api/v1/products/barcode', {
      params: { barcode },
    }),

  search: (query) =>
    api.get('/api/v1/products/search', {
      params: { query },
    }),

  create: (data) =>
    api.post('/api/v1/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  update: (id, data, volume = 'ML_50') =>
    api.patch(`/api/v1/products/${id}`, data, {
      params: { volume },
    }),

  updateMainImage: (id, data) =>
    api.patch(`/api/v1/products/${id}/main-image`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  delete: (id) => api.delete(`/api/v1/products/${id}`),
};

// Users
export const usersAPI = {
  getMe: () => api.get('/api/v1/users/me'),
  updateProfile: (data) => api.patch('/api/v1/users/me', data),
  changePassword: (data) => api.post('/api/v1/users/me/password', data),

  getAll: () => api.get('/api/v1/users/admin'),
  getById: (id) => api.get(`/api/v1/users/admin/${id}`),
  deactivate: (id) => api.patch(`/api/v1/users/admin/deactivate/${id}`),
  reactivate: (id) => api.patch(`/api/v1/users/admin/reactivate/${id}`),
  delete: (id) => api.delete(`/api/v1/users/admin/${id}`),

};

// Verifications
export const verificationsAPI = {
  // ADMIN
  getAll: () => api.get('/api/v1/verifications/admin/all'),

  getReviewQueue: () => api.get('/api/v1/verifications/admin/review'),

  getUserHistory: (userId) =>
    api.get(`/api/v1/verifications/history/${userId}`),

  confirmOriginal: (id, comment) =>
    api.patch(
      `/api/v1/verifications/admin/${id}/confirm-original`,
      comment ? { adminComment: comment } : {}
    ),

  confirmFake: (id, comment) =>
    api.patch(
      `/api/v1/verifications/admin/${id}/confirm-fake`,
      comment ? { adminComment: comment } : {}
    ),

  reject: (id, comment) =>
    api.patch(
      `/api/v1/verifications/admin/${id}/reject`,
      comment ? { adminComment: comment } : {}
    ),

  // USER
  getMyHistory: () => api.get('/api/v1/verifications/my-history'),

  verify: (form) => {
    const data = new FormData();

    data.append('productId', form.productId);
    data.append('imageAngle', form.imageAngle);
    data.append('image', form.image);

    if (form.barcodeInput) {
      data.append('barcodeInput', form.barcodeInput);
    }

    return api.post('/api/v1/verifications/verify', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Images
export const imagesAPI = {
  getDataset: (productId) =>
    api.get(`/api/v1/images/dataset/${productId}`),

  getUserUpload: (productId) =>
    api.get(`/api/v1/images/user-upload/${productId}`),

  uploadDataset: (productId, files, angle = 'UNKNOWN') => {
    const form = new FormData();

    Array.from(files).forEach((file) => {
      form.append('files', file);
    });

    return api.post(`/api/v1/images/dataset/${productId}`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { angle },
    });
  },

  update: (id, data) =>
    api.patch(`/api/v1/images/dataset/${id}`, data),

  delete: (id) =>
    api.delete(`/api/v1/images/${id}`),
};