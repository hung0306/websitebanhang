/**
 * Hàm bọc các hàm xử lý route để xử lý lỗi một cách nhất quán
 * @param {Function} fn - Hàm xử lý route
 * @returns {Function} - Hàm xử lý route đã được bọc
 */
const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error('Error in route handler:', error);
      
      // Nếu đã có response được gửi, không cần xử lý thêm
      if (res.headersSent) {
        return;
      }
      
      // Xác định mã lỗi và thông báo dựa trên loại lỗi
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Đã xảy ra lỗi không xác định';
      
      // Gửi phản hồi lỗi
      res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };
};

module.exports = asyncHandler; 