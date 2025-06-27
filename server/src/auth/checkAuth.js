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
        const dbUser = await modelUser.findById(decoded.id);
        req.user = { ...decoded, isAdmin: dbUser?.isAdmin };
        next();
    } catch (error) {
        next(error);
    }
};

const authAdmin = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        let token = req.cookies.token;
        
        // Check Authorization header if token not in cookies
        if (!token) {
            const authHeader = req.headers.authorization;
            
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Bạn không có quyền truy cập. Token không tìm thấy.'
            });
        }
        
        try {
            const decoded = await verifyToken(token);
            
            const { id } = decoded;
            
            const findUser = await modelUser.findById(id);
            
            if (!findUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Người dùng không tồn tại'
                });
            }
            
            if (findUser.isAdmin === false) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền truy cập. Yêu cầu quyền admin.'
                });
            }
            
            req.user = { ...decoded, isAdmin: findUser.isAdmin };
            next();
        } catch (verifyError) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc hết hạn'
            });
        }
    } catch (error) {
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
