import classNames from 'classnames/bind';
import styles from './CardBody.module.scss';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const cx = classNames.bind(styles);

function CardBody({ item, checkSelectCompare, handleCompare }) {
    const [imageError, setImageError] = useState(false);
    
    if (!item) {
        return <div className={cx('wrapper', 'loading')}>Đang tải...</div>;
    }

    // Xử lý khi ảnh không tải được
    const handleImageError = () => {
        setImageError(true);
    };

    // Tính phần trăm giảm giá
    const discountPercent = item.priceDiscount > 0 
        ? Math.round(((item.price - item.priceDiscount) / item.price) * 100) 
        : 0;

    return (
        <div className={cx('wrapper')}>
            {checkSelectCompare && (
                <button onClick={() => handleCompare(item._id)} className={cx('compare')}>
                    So sánh
                </button>
            )}
            
            {/* Badge giảm giá nếu có */}
            {discountPercent > 0 && (
                <div className={cx('discount-badge')}>
                    -{discountPercent}%
                </div>
            )}
            
            <Link to={`/product/${item._id}`} className={cx('image-container')}>
                {imageError ? (
                    <div className={cx('image-placeholder')}>
                        <span>Không tải được ảnh</span>
                    </div>
                ) : (
                    <img 
                        src={item?.images?.[0]} 
                        alt={item?.name || "Sản phẩm"} 
                        onError={handleImageError}
                    />
                )}
                
                <div className={cx('hover-overlay')}>
                    <span>Xem chi tiết</span>
                </div>
            </Link>
            
            <div className={cx('content')}>
                <h4 title={item?.name}>{item?.name}</h4>
                <div className={cx('price')}>
                    {item?.priceDiscount > 0 ? (
                        <>
                            <p className={cx('price-old')}>{item?.price?.toLocaleString()}đ</p>
                            <p className={cx('price-new')}>{item?.priceDiscount?.toLocaleString()}đ</p>
                        </>
                    ) : (
                        <p className={cx('price-regular')}>{item?.price?.toLocaleString()}đ</p>
                    )}
                </div>
                
                <div className={cx('action-buttons')}>
                    <Link to={`/product/${item._id}`} className={cx('view-button')}>
                        Chi tiết
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CardBody;
