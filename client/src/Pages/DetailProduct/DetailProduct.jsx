import classNames from 'classnames/bind';
import styles from './DetailProduct.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode, Zoom } from 'swiper/modules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faCheckCircle, faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { 
    faSearch, 
    faExpand, 
    faCompress, 
    faImage,
    faShield,
    faTruck,
    faUndo,
    faTag,
    faStar
} from '@fortawesome/free-solid-svg-icons';

import { useEffect, useRef, useState, useContext } from 'react';
import { requestAddToCart, requestGetProductById } from '../../Config/request';
import { useParams, useNavigate } from 'react-router-dom';
import Context from '../../store/Context';

import { message, Tabs, Rate, Divider, Button, Tooltip } from 'antd';

const cx = classNames.bind(styles);

function DetailProduct() {
    const ref = useRef();
    const { id } = useParams();
    const navigate = useNavigate();
    const [dataProduct, setDataProduct] = useState({});
    const [loading, setLoading] = useState(true);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [imageErrors, setImageErrors] = useState({});
    const [activeTab, setActiveTab] = useState('description');
    const [stockExceeded, setStockExceeded] = useState(false);

    const { dataUser } = useContext(Context);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
            const res = await requestGetProductById(id);
                console.log('Product data:', res.metadata);
            setDataProduct(res.metadata);
            } catch (error) {
                console.error('Error fetching product:', error);
                message.error('Không thể tải thông tin sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        ref.current.scrollIntoView({ behavior: 'smooth' });
    }, [id]);

    const handleAddToCart = async () => {
        try {
            // Ensure quantity is a valid number
            const validQuantity = typeof quantity === 'string' ? 
                (quantity === '' ? 1 : parseInt(quantity, 10) || 1) : quantity;
            
            if (validQuantity > (dataProduct?.stock || 0)) {
                message.error(`Không thể thêm vào giỏ hàng. Số lượng vượt quá hàng có sẵn (${dataProduct?.stock || 0} sản phẩm)`);
                return;
            }
            
            const data = {
                productId: id,
                quantity: validQuantity,
            };
            await requestAddToCart(data);
            message.success('Thêm vào giỏ hàng thành công');
        } catch (error) {
            message.error('Thêm vào giỏ hàng thất bại');
        }
    };

    const handleBuyNow = async () => {
        // Check if user is authenticated by looking for _id in dataUser
        const isAuthenticated = dataUser && dataUser._id;
        
        // If not authenticated, redirect to login page
        if (!isAuthenticated) {
            message.info('Vui lòng đăng nhập để mua sản phẩm');
            navigate('/login');
            return;
        }
        
        try {
            // Ensure quantity is a valid number
            const validQuantity = typeof quantity === 'string' ? 
                (quantity === '' ? 1 : parseInt(quantity, 10) || 1) : quantity;
            
            if (validQuantity > (dataProduct?.stock || 0)) {
                message.error(`Không thể mua ngay. Số lượng vượt quá hàng có sẵn (${dataProduct?.stock || 0} sản phẩm)`);
                return;
            }
            
            const data = {
                productId: id,
                quantity: quantity,
            };
            await requestAddToCart(data);
            
            message.success('Sản phẩm đã được thêm vào giỏ hàng');
            navigate('/cart');
        } catch (error) {
            console.error('Error adding product to cart:', error);
            message.error('Có lỗi xảy ra, vui lòng thử lại sau');
        }
    };

    const toggleFullscreen = () => {
        setFullscreen(!fullscreen);
    };

    const handleQuantityChange = (value) => {
        // Skip validation for empty string (allows user to clear the field)
        if (value === '') {
            return;
        }
        
        // Convert to number if it's a string
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
        
        // Validate the input
        if (isNaN(numValue)) {
            setQuantity(1);
            return;
        }
        
        // Ensure the quantity is at least 1
        const sanitizedValue = Math.max(1, numValue);
        
        // Get the maximum available quantity
        const maxQuantity = dataProduct?.stock || 1;
        
        // Check if the requested quantity exceeds the available stock
        if (sanitizedValue > maxQuantity) {
            // Show warning message
            message.warning(`Số lượng tối đa có thể mua là ${maxQuantity} sản phẩm`);
            // Set the stockExceeded flag to true
            setStockExceeded(true);
            // Clear the flag after 2 seconds
            setTimeout(() => setStockExceeded(false), 2000);
            // Limit the quantity to the maximum available
            setQuantity(maxQuantity);
        } else {
            // Update the quantity state with valid value
            setQuantity(sanitizedValue);
        }
    };

    const handleImageError = (index) => {
        setImageErrors(prev => ({
            ...prev,
            [index]: true
        }));
    };

    // Render thông số kỹ thuật từ đối tượng specifications
    const renderSpecifications = () => {
        if (!dataProduct.specifications || Object.keys(dataProduct.specifications).length === 0) {
            return <p className={cx('no-data')}>Không có thông số kỹ thuật</p>;
        }

        return Object.entries(dataProduct.specifications).map(([key, value], index) => (
            <div key={index} className={cx('spec-item')}>
                <div className={cx('spec-label')}>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                <div className={cx('spec-value')}>{value}</div>
            </div>
        ));
    };

    const getDiscountPercent = () => {
        if (dataProduct?.price && dataProduct?.priceDiscount && dataProduct.price > dataProduct.priceDiscount) {
            return Math.round(((dataProduct.price - dataProduct.priceDiscount) / dataProduct.price) * 100);
        }
        return 0;
    };

    const renderPriceSection = () => {
        const discountPercent = getDiscountPercent();
        
        return (
            <div className={cx('price-section')}>
                {discountPercent > 0 ? (
                    <div className={cx('price-with-discount')}>
                        <div className={cx('current-price')}>
                            {dataProduct?.priceDiscount?.toLocaleString()}₫
                        </div>
                        <div className={cx('original-price')}>
                            {dataProduct?.price?.toLocaleString()}₫
                        </div>
                        <div className={cx('discount-badge')}>-{discountPercent}%</div>
                    </div>
                ) : (
                    <div className={cx('current-price')}>
                        {dataProduct?.price?.toLocaleString()}₫
                    </div>
                )}
            </div>
        );
    };

    const tabItems = [
        {
            key: 'description',
            label: 'Mô tả sản phẩm',
            children: (
                <div className={cx('tab-content-container')}>
                    {loading ? (
                        <div className={cx('loading-content')}>Đang tải mô tả...</div>
                    ) : dataProduct?.description ? (
                        <div className={cx('description-content')}>
                            {dataProduct.description}
                        </div>
                    ) : (
                        <div className={cx('no-data')}>Không có mô tả sản phẩm</div>
                    )}
                </div>
            )
        },
        {
            key: 'specifications',
            label: 'Thông số kỹ thuật',
            children: (
                <div className={cx('tab-content-container')}>
                    {loading ? (
                        <div className={cx('loading-content')}>Đang tải thông số kỹ thuật...</div>
                    ) : (
                        <div className={cx('specifications-content')}>
                            {renderSpecifications()}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'rating',
            label: 'Đánh giá & Nhận xét',
            children: (
                <div className={cx('tab-content-container')}>
                    <div className={cx('rating-placeholder')}>
                        <div className={cx('rating-stats')}>
                            <div className={cx('average-rating')}>
                                <span className={cx('rating-number')}>4.8</span>
                                <Rate disabled defaultValue={4.8} allowHalf />
                                <span className={cx('total-ratings')}>(120 đánh giá)</span>
                            </div>
                            <div className={cx('rating-bars')}>
                                {[5, 4, 3, 2, 1].map(star => (
                                    <div key={star} className={cx('rating-bar-item')}>
                                        <span>{star} <FontAwesomeIcon icon={faStar} /></span>
                                        <div className={cx('rating-bar-container')}>
                                            <div 
                                                className={cx('rating-bar-fill')} 
                                                style={{ 
                                                    width: star === 5 ? '70%' : 
                                                           star === 4 ? '20%' : 
                                                           star === 3 ? '5%' : 
                                                           star === 2 ? '3%' : '2%' 
                                                }}
                                            ></div>
                                        </div>
                                        <span>{
                                            star === 5 ? '84' : 
                                            star === 4 ? '24' : 
                                            star === 3 ? '6' : 
                                            star === 2 ? '4' : '2'
                                        }</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Divider />
                        <div className={cx('no-data')}>Chưa có đánh giá</div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')} ref={ref}>
                {/* Breadcrumb Navigation */}
                <div className={cx('breadcrumb-container')}>
                    <div className={cx('breadcrumb-inner')}>
                        <div className={cx('breadcrumbs')}>
                            <a href="/" className={cx('breadcrumb-item')}>Trang chủ</a>
                            <span>/</span>
                            {dataProduct?.category && (
                                <>
                                    <a href={`/category/${dataProduct.category._id}`} className={cx('breadcrumb-item')}>{dataProduct.category.name}</a>
                                    <span>/</span>
                                </>
                            )}
                            <span className={cx('breadcrumb-current')}>{dataProduct.name}</span>
                        </div>
                    </div>
                </div>

                {/* Product Detail Section */}
                <div className={cx('product-detail-section')}>
                    <div className={cx('product-detail-inner')}>
                        {/* Left Column - Images */}
                        <div className={cx('product-gallery')}>
                            <div className={cx('product-images', { fullscreen })}>
                                {fullscreen && (
                                    <button className={cx('close-fullscreen')} onClick={toggleFullscreen}>
                                        <FontAwesomeIcon icon={faCompress} />
                                    </button>
                                )}
                                
                                {!loading && dataProduct?.images?.length > 0 ? (
                                    <>
                                        <div className={cx('main-swiper')}>
                        <Swiper
                                                style={{
                                                    '--swiper-navigation-color': '#333',
                                                    '--swiper-pagination-color': '#333',
                                                }}
                                                spaceBetween={10}
                            navigation={true}
                            pagination={{
                                clickable: true,
                                                    dynamicBullets: true,
                                                }}
                                                thumbs={{ swiper: thumbsSwiper }}
                                                modules={[Zoom, Navigation, Pagination, Thumbs]}
                                                className={cx('main-swiper-container')}
                                                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                                                zoom={{
                                                    maxRatio: 2.5,
                                                    minRatio: 1,
                                                }}
                                            >
                                                {dataProduct.images.map((item, index) => (
                                <SwiperSlide key={index}>
                                                        <div className="swiper-zoom-container">
                                                            {imageErrors[index] ? (
                                                                <div className={cx('image-error')}>
                                                                    <FontAwesomeIcon icon={faImage} />
                                                                    <p>Không thể tải ảnh</p>
                                                                </div>
                                                            ) : (
                                                                <img 
                                                                    src={item} 
                                                                    alt={`${dataProduct?.name} - Ảnh ${index + 1}`} 
                                                                    className={cx('product-image')}
                                                                    onError={() => handleImageError(index)}
                                                                    loading="lazy"
                                                                />
                                                            )}
                                                        </div>
                                                        {!imageErrors[index] && (
                                                            <div className={cx('zoom-instructions')}>
                                                                <FontAwesomeIcon icon={faSearch} /> Nhấn đúp để phóng to
                                                            </div>
                                                        )}
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                            
                                            {!fullscreen && (
                                                <button 
                                                    className={cx('fullscreen-button')} 
                                                    onClick={toggleFullscreen}
                                                    title="Xem ảnh toàn màn hình"
                                                >
                                                    <FontAwesomeIcon icon={faExpand} />
                                                </button>
                                            )}
                                        </div>
                                        
                                        {dataProduct.images.length > 1 && (
                                            <div className={cx('thumbs-swiper')}>
                                                <Swiper
                                                    onSwiper={setThumbsSwiper}
                                                    spaceBetween={10}
                                                    slidesPerView={5}
                                                    freeMode={true}
                                                    watchSlidesProgress={true}
                                                    modules={[FreeMode, Navigation, Thumbs]}
                                                    className={cx('thumbs-swiper-container')}
                                                    breakpoints={{
                                                        320: {
                                                            slidesPerView: 3,
                                                        },
                                                        480: {
                                                            slidesPerView: 4,
                                                        },
                                                        768: {
                                                            slidesPerView: 5,
                                                        }
                                                    }}
                                                >
                                                    {dataProduct.images.map((item, index) => (
                                                        <SwiperSlide key={index} className={cx('thumb-slide', { active: activeIndex === index })}>
                                                            {imageErrors[index] ? (
                                                                <div className={cx('thumb-error')}>
                                                                    <FontAwesomeIcon icon={faImage} />
                                                                </div>
                                                            ) : (
                                                                <img 
                                                                    src={item} 
                                                                    alt={`Thumbnail ${index + 1}`}
                                                                    className={cx('thumb-image')}
                                                                    onError={() => handleImageError(index)}
                                                                    loading="lazy"
                                                                />
                                                            )}
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                                        )}
                                    </>
                                ) : (
                                    <div className={cx('image-placeholder')}>
                                        {loading ? (
                                            <div className={cx('loading-spinner')}>
                                                <div className={cx('spinner')}></div>
                                                <p>Đang tải ảnh...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faImage} size="3x" />
                                                <p>Không có ảnh sản phẩm</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Product Info */}
                        <div className={cx('product-info')}>
                            <h1 className={cx('product-title')}>{dataProduct?.name}</h1>
                            
                            <div className={cx('product-meta')}>
                                <div className={cx('product-rating')}>
                                    <Rate disabled defaultValue={4.5} allowHalf />
                                    <span className={cx('rating-count')}>(120 đánh giá)</span>
                                </div>
                                <div className={cx('product-stock')}>
                                    {dataProduct?.stock > 0 ? (
                                        <span className={cx('in-stock')}>Còn hàng ({dataProduct.stock} sản phẩm)</span>
                                    ) : (
                                        <span className={cx('out-of-stock')}>Hết hàng</span>
                                    )}
                                </div>
                            </div>

                            {/* Price Section */}
                            {renderPriceSection()}
                            
                            {/* Promotions */}
                            <div className={cx('promotions')}>
                                <h3 className={cx('section-title')}>
                                    <FontAwesomeIcon icon={faTag} /> Khuyến mãi
                                </h3>
                                <div className={cx('promotion-items')}>
                                    <div className={cx('promotion-item')}>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        <span>Giảm thêm 5% khi thanh toán qua ví điện tử</span>
                                    </div>
                                    <div className={cx('promotion-item')}>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        <span>Giảm 10% khi mua phụ kiện kèm theo</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className={cx('quantity-section')}>
                                <h3 className={cx('section-title')}>Số lượng</h3>
                                <div className={cx('quantity-selector')}>
                                    <button 
                                        className={cx('quantity-btn')}
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max={dataProduct?.stock || 1}
                                        value={quantity}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            // Allow empty field during typing
                                            if (inputValue === '') {
                                                setQuantity('');
                                            } else {
                                                handleQuantityChange(parseInt(inputValue) || 1);
                                            }
                                        }}
                                        onBlur={() => {
                                            // When field loses focus, make sure we have a valid number
                                            if (quantity === '' || isNaN(quantity)) {
                                                setQuantity(1);
                                            }
                                        }}
                                        className={cx('quantity-input', { 'stock-exceeded': stockExceeded })}
                                    />
                                    <button 
                                        className={cx('quantity-btn')}
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        disabled={dataProduct?.stock && quantity >= dataProduct.stock}
                                    >
                                        +
                                    </button>
                                </div>
                                {dataProduct?.stock && (
                                    <div className={cx('stock-indicator', {
                                        'stock-warning': dataProduct.stock <= 5,
                                        'stock-critical': quantity !== '' && parseInt(quantity) === dataProduct.stock
                                    })}>
                                        {quantity !== '' && parseInt(quantity) === dataProduct.stock ? (
                                            <span>Đã chọn tối đa số lượng có sẵn</span>
                                        ) : (
                                            <span>Còn {dataProduct.stock - (quantity === '' ? 0 : parseInt(quantity) || 0)} sản phẩm có sẵn</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Total Price */}
                            <div className={cx('total-price')}>
                                <span className={cx('total-label')}>Thành tiền:</span>
                                <span className={cx('total-amount')}>
                                    {dataProduct?.priceDiscount 
                                        ? (dataProduct.priceDiscount * (quantity === '' ? 0 : parseInt(quantity) || 1)).toLocaleString()
                                        : dataProduct?.price
                                            ? (dataProduct.price * (quantity === '' ? 0 : parseInt(quantity) || 1)).toLocaleString()
                                            : 0
                                    }₫
                                </span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className={cx('action-buttons')}>
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    className={cx('buy-now-btn')}
                                    onClick={handleBuyNow}
                                    disabled={!dataProduct?.stock || dataProduct.stock <= 0}
                                >
                                    MUA NGAY
                                </Button>
                                <Button 
                                    size="large" 
                                    className={cx('add-to-cart-btn')}
                                    onClick={handleAddToCart}
                                    disabled={!dataProduct?.stock || dataProduct.stock <= 0}
                                >
                                    THÊM VÀO GIỎ HÀNG
                                </Button>
                            </div>
                            
                            {/* Policy Info */}
                            <div className={cx('policy-info')}>
                                <div className={cx('policy-item')}>
                                    <FontAwesomeIcon icon={faShield} />
                                    <div className={cx('policy-text')}>
                                        <h4>Bảo hành chính hãng 12 tháng</h4>
                                        <p>Sản phẩm chính hãng mới 100%</p>
                                    </div>
                                </div>
                                <div className={cx('policy-item')}>
                                    <FontAwesomeIcon icon={faTruck} />
                                    <div className={cx('policy-text')}>
                                        <h4>Giao hàng toàn quốc</h4>
                                        <p>Thanh toán khi nhận hàng</p>
                                    </div>
                                </div>
                                <div className={cx('policy-item')}>
                                    <FontAwesomeIcon icon={faUndo} />
                                    <div className={cx('policy-text')}>
                                        <h4>Đổi trả dễ dàng</h4>
                                        <p>Lỗi 1 đổi 1 trong 30 ngày</p>
                            </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Tabbed Information Section */}
                <div className={cx('product-tabs-section')}>
                    <div className={cx('tabs-inner')}>
                        <Tabs 
                            items={tabItems} 
                            defaultActiveKey="description" 
                            className={cx('product-tabs')}
                            onChange={(key) => setActiveTab(key)}
                        />
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default DetailProduct;
