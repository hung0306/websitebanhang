import axios from 'axios';

import cookies from 'js-cookie';

const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

export const requestAdmin = async () => {
    const res = await request.get('/admin');
    return res.data;
};

export const requestAskQuestion = async (data) => {
    const res = await request.post('/chat', data);
    return res.data;
};

export const requestClearChat = async (data) => {
    const res = await request.post('/clear-chat', data);
    return res.data;
};

export const requestRegister = async (data) => {
    const res = await request.post('/api/register', data);
    return res.data;
};

export const requestLogin = async (data) => {
    const res = await request.post('/api/login', data);
    return res.data;
};

export const requestAuth = async () => {
    const res = await request.get('/api/auth');
    return res.data;
};

export const requestLogout = async () => {
    const res = await request.get('/api/logout');
    return res.data;
};

export const requestRefreshToken = async () => {
    const res = await request.get('/api/refresh-token');
    return res.data;
};

export const requestUploadImage = async (data) => {
    const res = await request.post('/api/upload-image', data);
    return res.data;
};

export const requestGetAdminStats = async (params = {}) => {
    const res = await request.get('/api/get-admin-stats', { params });
    return res.data;
};

export const requestGetAllUser = async () => {
    const res = await request.get('/api/get-all-users');
    return res.data;
};

export const requestUpdateInfoUser = async (data) => {
    const res = await request.post('/api/update-info-user', data);
    return res.data;
};

export const requestLoginGoogle = async (data) => {
    const res = await request.post('/api/login-google', { credential: data });
    return res.data;
};

export const requestUpdatePassword = async (data) => {
    const res = await request.post('/api/update-password', data);
    return res.data;
};

export const requestAddProduct = async (data) => {
    try {
        const res = await request.post('/api/add-product', data);
        return res.data;
    } catch (error) {
        console.error('Add product error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });
        throw error;
    }
};

export const requestUpdateStatusOrder = async (data) => {
    const res = await request.post('/api/update-status-order', data);
    return res.data;
};

export const requestGetAllProduct = async () => {
    const res = await request.get('/api/all-product');
    return res.data;
};

export const requestEditProduct = async (data) => {
    const res = await request.post('/api/edit-product', data);
    return res.data;
};

export const requestDeleteProduct = async (id) => {
    const res = await request.delete('/api/delete-product', { params: { id } });
    return res.data;
};

export const requestSearchProduct = async (keyword) => {
    const res = await request.get('/api/search-product', { params: { keyword } });
    return res.data;
};

export const requestGetProducts = async (limit = 8) => {
    try {
        console.log('Requesting products with limit:', limit);
        const res = await request.get('/api/products', { params: { limit } });
        console.log('Products API response:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const requestGetProductById = async (id) => {
    const res = await request.get(`/api/product`, { params: { id } });
    return res.data;
};

export const requestFilterProduct = async (params = {}) => {
    const res = await request.get('/api/filter-product', { params });
    return res.data;
};

export const requestCompareProduct = async (productId1, productId2) => {
    try {
        if (!productId1 || !productId2) {
            throw new Error("Thiếu ID sản phẩm để so sánh");
        }
        
        const res = await request.post('/compare-product', { productId1, productId2 });
        return res.data;
    } catch (error) {
        console.error('Error comparing products:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.response?.data?.message || error.message
        });
        
        // Rethrow with a more user-friendly message
        const errorMessage = error.response?.data?.message || 
                            "Không thể so sánh sản phẩm. Vui lòng thử lại sau.";
        throw new Error(errorMessage);
    }
};

export const requestAddToCart = async (data) => {
    const res = await request.post('/api/add-to-cart', data);
    return res.data;
};

export const requestGetCart = async () => {
    const res = await request.get('/api/get-cart');
    return res.data;
};

export const requestDeleteCart = async (productId) => {
    const res = await request.delete('/api/delete-cart', { params: { productId } });
    return res.data;
};

export const requestUpdateInfoUserCart = async (data) => {
    const res = await request.post('/api/update-info-user-cart', data);
    return res.data;
};

export const requestPayment = async (typePayment, productsToOrder) => {
    const res = await request.post('/api/payment', { typePayment, productsToOrder });
    return res.data;
};

export const requestGetHistoryOrder = async () => {
    const res = await request.get('/api/get-history-order');
    return res.data;
};

export const requestGetOnePayment = async (id) => {
    const res = await request.get('/api/get-one-payment', { params: { id } });
    return res.data;
};

export const requestGetOrderAdmin = async () => {
    const res = await request.get('/api/get-order-admin');
    return res.data;
};

export const requestAddCategory = async (data) => {
    try {
        const res = await request.post('/api/add-category', data);
        return res.data;
    } catch (error) {
        console.error('Add category error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });
        throw error;
    }
};

export const requestUploadCategoryImage = async (data) => {
    const res = await request.post('/api/upload-category-image', data);
    return res.data;
};

export const requestGetCategories = async () => {
    const res = await request.get('/api/categories');
    return res.data;
};

export const requestGetCategoryById = async (id) => {
    const res = await request.get('/api/category', { params: { id } });
    return res.data;
};

export const requestEditCategory = async (data) => {
    const res = await request.post('/api/edit-category', data);
    return res.data;
};

export const requestDeleteCategory = async (id) => {
    const res = await request.delete('/api/delete-category', { params: { id } });
    return res.data;
};

export const requestGetParentCategories = async (excludeId) => {
    const params = excludeId ? { excludeId } : {};
    const res = await request.get('/api/parent-categories', { params });
    return res.data;
};

export const requestAddSupplier = async (data) => {
    try {
        const res = await request.post('/api/add-supplier', data);
        return res.data;
    } catch (error) {
        console.error('Add supplier error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });
        throw error;
    }
};

export const requestGetSuppliers = async () => {
    const res = await request.get('/api/suppliers');
    return res.data;
};

export const requestGetSupplierById = async (id) => {
    const res = await request.get('/api/supplier', { params: { id } });
    return res.data;
};

export const requestEditSupplier = async (data) => {
    const res = await request.post('/api/edit-supplier', data);
    return res.data;
};

export const requestDeleteSupplier = async (id) => {
    const res = await request.delete('/api/delete-supplier', { params: { id } });
    return res.data;
};

export const requestUpdateCart = async (data) => {
    const res = await request.post('/api/update-cart', data);
    return res.data;
};

export const requestGetProductsByCategory = async (identifier) => {
    try {
        const res = await request.get('/api/category-products', { params: { identifier } });
        return res.data;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        throw error;
    }
};

// Import management functions
export const requestGetAllImports = async () => {
    try {
        const res = await request.get('/api/imports');
        return res.data;
    } catch (error) {
        console.error('Error fetching imports:', error);
        throw error;
    }
};

export const requestGetImportById = async (id) => {
    try {
        const res = await request.get(`/api/import/${id}`);
        return res.data;
    } catch (error) {
        console.error('Error fetching import details:', error);
        throw error;
    }
};

export const requestAddImport = async (data) => {
    try {
        const res = await request.post('/api/add-import', data);
        return res.data;
    } catch (error) {
        console.error('Add import error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });
        throw error;
    }
};

export const requestUpdateImport = async (id, data) => {
    try {
        const res = await request.put(`/api/update-import/${id}`, data);
        return res.data;
    } catch (error) {
        console.error('Update import error details:', error);
        throw error;
    }
};

export const requestDeleteImport = async (id) => {
    try {
        const res = await request.delete(`/api/delete-import/${id}`);
        return res.data;
    } catch (error) {
        console.error('Delete import error details:', error);
        throw error;
    }
};

export const requestGetAdminNotifications = async () => {
    const res = await request.get('/api/admin-notifications');
    return res.data;
};

export const requestGetPaginatedNotifications = async (page = 1, limit = 10) => {
    const res = await request.get('/api/admin-notifications-paginated', {
        params: { page, limit }
    });
    return res.data;
};

export const requestMarkNotificationAsRead = async (id) => {
    const res = await request.put(`/api/notifications/${id}/read`);
    return res.data;
};

export const requestMarkAllNotificationsAsRead = async () => {
    const res = await request.put('/api/notifications/mark-all-read');
    return res.data;
};

let isRefreshing = false;
let failedRequestsQueue = [];

// Add request interceptor to automatically include token in all requests
request.interceptors.request.use(
    (config) => {
        const token = cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

request.interceptors.response.use(
    (response) => response, // Trả về nếu không có lỗi
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và request chưa từng thử refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Gửi yêu cầu refresh token
                    const token = cookies.get('token');
                    if (!token) {
                        return Promise.reject(error);
                    }
                    await requestRefreshToken();

                    // Xử lý lại tất cả các request bị lỗi 401 trước đó
                    failedRequestsQueue.forEach((req) => req.resolve());
                    failedRequestsQueue = [];
                } catch (refreshError) {
                    // Nếu refresh thất bại, đăng xuất
                    failedRequestsQueue.forEach((req) => req.reject(refreshError));
                    failedRequestsQueue = [];
                    
                    // Clear all auth cookies
                    cookies.remove('token');
                    cookies.remove('refreshToken');
                    cookies.remove('logged');
                    
                    // Only redirect if we're not already on the login page
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login'; // Chuyển về trang đăng nhập
                    }
                } finally {
                    isRefreshing = false;
                }
            }

            // Trả về một Promise để retry request sau khi token mới được cập nhật
            return new Promise((resolve, reject) => {
                failedRequestsQueue.push({
                    resolve: () => {
                        resolve(request(originalRequest));
                    },
                    reject: (err) => reject(err),
                });
            });
        }

        return Promise.reject(error);
    },
);

export default request;
