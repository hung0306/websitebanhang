const { BadUserRequestError, BadUser2RequestError } = require('../core/error.response');
const { verifyToken } = require('../services/tokenSevices');
const modelUser = require('../models/users.model');

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

const authUser = async (req, res, next) => {
    try {
        const user = req.cookies.token;
        if (!user) throw new BadUserRequestError('Vui lòng đăng nhập');
        const token = user;
        const decoded = await verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

const authAdmin = async (req, res, next) => {
    try {
        console.log('authAdmin middleware called');
        
        // Get token from cookies or Authorization header
        let token = req.cookies.token;
        console.log('Token from cookies:', token ? 'Found' : 'Not found');
        
        // Check Authorization header if token not in cookies
        if (!token) {
            const authHeader = req.headers.authorization;
            console.log('Authorization header:', authHeader);
            
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
                console.log('Token extracted from Authorization header');
            }
        }
        
        if (!token) {
            console.log('No token found in cookies or headers');
            return res.status(401).json({
                success: false,
                message: 'Bạn không có quyền truy cập. Token không tìm thấy.'
            });
        }
        
        console.log('Verifying token:', token.substring(0, 10) + '...');
        
        try {
            const decoded = await verifyToken(token);
            console.log('Token verified successfully:', decoded);
            
            const { id } = decoded;
            
            const findUser = await modelUser.findById(id);
            console.log('User found:', findUser ? 'Yes' : 'No');
            
            if (!findUser) {
                console.log('User not found with ID:', id);
                return res.status(401).json({
                    success: false,
                    message: 'Người dùng không tồn tại'
                });
            }
            
            if (findUser.isAdmin === false) {
                console.log('User is not admin:', id);
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền truy cập. Yêu cầu quyền admin.'
                });
            }
            
            console.log('Admin verification successful');
            req.user = decoded;
            next();
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError.message);
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc hết hạn'
            });
        }
    } catch (error) {
        console.error('Error in authAdmin middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi xác thực: ' + error.message
        });
    }
};

module.exports = {
    asyncHandler,
    authUser,
    authAdmin,
};
