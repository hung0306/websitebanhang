import classNames from 'classnames/bind';
import styles from './CompareProduct.module.scss';
import Header from '../../Components/Header/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useContext } from 'react';
import { requestGetProductById, requestCompareProduct, requestAddToCart } from '../../Config/request';
import Context from '../../store/Context';
import { message } from 'antd';

const cx = classNames.bind(styles);

function CompareProduct() {
    const { id1, id2 } = useParams();
    const [product1, setProduct1] = useState({});
    const [product2, setProduct2] = useState({});
    const [compare, setCompare] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const navigate = useNavigate();
    const compareRef = useRef(null);

    // Get authentication state from context
    const { dataUser } = useContext(Context);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
            const res = await requestGetProductById(id1);
            setProduct1(res.metadata);
            const res2 = await requestGetProductById(id2);
            setProduct2(res2.metadata);
                setError(null);
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        compareRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [id1, id2]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await requestCompareProduct(id1, id2);
                setCompare(res);
                setError(null);
            } catch (err) {
                console.error("Error comparing products:", err);
                setError(err.message || "Không thể so sánh sản phẩm. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id1, id2]);

    // Helper function to determine if a spec is better
    const determineBetter = (spec1, spec2, type) => {
        if (!spec1 || !spec2) return null;
        
        if (type === 'price') {
            return parseFloat(spec1) < parseFloat(spec2) ? 'product1' : 
                   parseFloat(spec1) > parseFloat(spec2) ? 'product2' : null;
        }
        
        // For storage, RAM, etc. - higher is better
        if (type === 'storage' || type === 'ram') {
            // Extract numbers
            const num1 = parseInt(spec1.match(/\d+/)?.[0] || 0);
            const num2 = parseInt(spec2.match(/\d+/)?.[0] || 0);
            
            return num1 > num2 ? 'product1' : 
                   num1 < num2 ? 'product2' : null;
        }
        
        return null;
    };

    const handleBuyNow = async (productId) => {
        // Check if user is authenticated
        const isAuthenticated = dataUser && dataUser._id;
        
        // If not authenticated, redirect to login page
        if (!isAuthenticated) {
            message.info('Vui lòng đăng nhập để mua sản phẩm');
            navigate('/login');
            return;
        }
        
        try {
            const data = {
                productId: productId,
                quantity: 1,
            };
            await requestAddToCart(data);
            
            message.success('Sản phẩm đã được thêm vào giỏ hàng');
            navigate('/cart');
        } catch (error) {
            console.error('Error adding product to cart:', error);
            message.error('Có lỗi xảy ra, vui lòng thử lại sau');
        }
    };

    if (error) {
        return (
            <div className={cx('wrapper')}>
                <header>
                    <Header />
                </header>
                <main className={cx('main')}>
                    <div className={cx('error-container')}>
                        <div className={cx('error-icon')}>⚠️</div>
                        <h2>Đã xảy ra lỗi</h2>
                        <p>{error}</p>
                        <div className={cx('error-buttons')}>
                            <button onClick={() => window.location.reload()} className={cx('retry-button')}>
                                Thử lại
                            </button>
                            <button onClick={() => window.history.back()} className={cx('back-button')}>
                                Quay lại
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <header>
                    <Header />
                </header>
                <main className={cx('main')}>
                    <div className={cx('loading-container')}>
                        <div className={cx('loading-animation')}>
                            <div className={cx('phone-1')}></div>
                            <div className={cx('vs')}>VS</div>
                            <div className={cx('phone-2')}></div>
                        </div>
                        <p className={cx('loading-text')}>Đang phân tích so sánh...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <div className={cx('compare-container')}>
                    <div className={cx('back-button-container')}>
                        <button onClick={() => navigate(-1)} className={cx('navigate-back')}>
                            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
                        </button>
                    </div>
                    
                    <div className={cx('compare-header')}>
                        <h1>So sánh chi tiết sản phẩm</h1>
                        <p>So sánh thông số kỹ thuật và tính năng giữa {product1?.name} và {product2?.name}</p>
                    </div>
                    
                    <div className={cx('product-showcase')}>
                        <div className={cx('product-card')}>
                            <div className={cx('product-image')}>
                                {product1?.images && product1.images.length > 0 && (
                                    <img src={product1.images[0]} alt={product1.name} />
                                )}
                            </div>
                            <h2>{product1?.name}</h2>
                            <div className={cx('product-price')}>
                                {product1?.price?.toLocaleString()} đ
                            </div>
                        </div>
                        
                        <div className={cx('vs-badge')}>VS</div>
                        
                        <div className={cx('product-card')}>
                            <div className={cx('product-image')}>
                                {product2?.images && product2.images.length > 0 && (
                                    <img src={product2.images[0]} alt={product2.name} />
                                )}
                            </div>
                            <h2>{product2?.name}</h2>
                            <div className={cx('product-price')}>
                                {product2?.price?.toLocaleString()} đ
                            </div>
                        </div>
                    </div>
                    
                    <div className={cx('comparison-tabs')}>
                        <button 
                            className={cx('tab', { active: activeTab === 'overview' })}
                            onClick={() => setActiveTab('overview')}
                        >
                            Tổng quan
                        </button>
                        <button 
                            className={cx('tab', { active: activeTab === 'specs' })}
                            onClick={() => setActiveTab('specs')}
                        >
                            Thông số kỹ thuật
                        </button>
                        <button 
                            className={cx('tab', { active: activeTab === 'features' })}
                            onClick={() => setActiveTab('features')}
                        >
                            Tính năng
                        </button>
                        <button 
                            className={cx('tab', { active: activeTab === 'analysis' })}
                            onClick={() => setActiveTab('analysis')}
                        >
                            Phân tích chi tiết
                        </button>
                    </div>
                    
                    {activeTab === 'overview' && (
                        <div className={cx('tab-content')}>
                            <div className={cx('specs-comparison')}>
                                <h3>Thông số nổi bật</h3>
                                
                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>Màn hình</div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.screen, product2?.screen, 'screen') === 'product1'
                                    })}>
                                        {product1?.screen || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.screen, product2?.screen, 'screen') === 'product2'
                                    })}>
                                        {product2?.screen || 'Không có thông tin'}
                                    </div>
                                </div>

                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>CPU</div>
                                    <div className={cx('spec-value')}>
                                        {product1?.cpu || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value')}>
                                        {product2?.cpu || 'Không có thông tin'}
                                    </div>
                                </div>

                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>RAM</div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.ram, product2?.ram, 'ram') === 'product1'
                                    })}>
                                        {product1?.ram || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.ram, product2?.ram, 'ram') === 'product2'
                                    })}>
                                        {product2?.ram || 'Không có thông tin'}
                                    </div>
                                </div>

                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>Bộ nhớ</div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.storage, product2?.storage, 'storage') === 'product1'
                                    })}>
                                        {product1?.storage || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.storage, product2?.storage, 'storage') === 'product2'
                                    })}>
                                        {product2?.storage || 'Không có thông tin'}
                                    </div>
                                </div>
                                
                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>Camera</div>
                                    <div className={cx('spec-value')}>
                                        {product1?.camera || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value')}>
                                        {product2?.camera || 'Không có thông tin'}
                                    </div>
                                </div>
                                
                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>Pin</div>
                                    <div className={cx('spec-value')}>
                                        {product1?.battery || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value')}>
                                        {product2?.battery || 'Không có thông tin'}
                                    </div>
                                </div>
                                
                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>Giá</div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.price, product2?.price, 'price') === 'product1'
                                    })}>
                                        {product1?.price?.toLocaleString()} đ
                                    </div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.price, product2?.price, 'price') === 'product2'
                                    })}>
                                        {product2?.price?.toLocaleString()} đ
                                    </div>
                                </div>
                            </div>
                            
                            <div className={cx('product-advantages')}>
                                <div className={cx('advantage-column')}>
                                    <h3>Điểm mạnh của {product1?.name}</h3>
                                    <ul>
                                        {determineBetter(product1?.price, product2?.price, 'price') === 'product1' && (
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> Giá thành hợp lý hơn</li>
                                        )}
                                        {determineBetter(product1?.storage, product2?.storage, 'storage') === 'product1' && (
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> Bộ nhớ lớn hơn</li>
                                        )}
                                        {determineBetter(product1?.ram, product2?.ram, 'ram') === 'product1' && (
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> RAM lớn hơn</li>
                                        )}
                                        <li><FontAwesomeIcon icon={faCheckCircle} /> {product1?.name}</li>
                                    </ul>
                                </div>
                                
                                <div className={cx('advantage-column')}>
                                    <h3>Điểm mạnh của {product2?.name}</h3>
                                    <ul>
                                        {determineBetter(product1?.price, product2?.price, 'price') === 'product2' && (
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> Giá thành hợp lý hơn</li>
                                        )}
                                        {determineBetter(product1?.storage, product2?.storage, 'storage') === 'product2' && (
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> Bộ nhớ lớn hơn</li>
                                        )}
                                        {determineBetter(product1?.ram, product2?.ram, 'ram') === 'product2' && (
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> RAM lớn hơn</li>
                                        )}
                                        <li><FontAwesomeIcon icon={faCheckCircle} /> {product2?.name}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'specs' && (
                        <div className={cx('tab-content')}>
                            <div className={cx('specs-comparison', 'full')}>
                                <h3>Thông số kỹ thuật chi tiết</h3>
                                
                                <div className={cx('spec-row', 'header')}>
                                    <div className={cx('spec-label')}></div>
                                    <div className={cx('spec-value')}>{product1?.name}</div>
                                    <div className={cx('spec-value')}>{product2?.name}</div>
                    </div>

                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>Màn hình</div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.screen, product2?.screen, 'screen') === 'product1'
                                    })}>
                                        {product1?.screen || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.screen, product2?.screen, 'screen') === 'product2'
                                    })}>
                                        {product2?.screen || 'Không có thông tin'}
                                    </div>
                                </div>
                                
                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>CPU</div>
                                    <div className={cx('spec-value')}>
                                        {product1?.cpu || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value')}>
                                        {product2?.cpu || 'Không có thông tin'}
                                    </div>
                                </div>

                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>GPU</div>
                                    <div className={cx('spec-value')}>
                                        {product1?.gpu || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value')}>
                                        {product2?.gpu || 'Không có thông tin'}
                                    </div>
                                </div>

                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>RAM</div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.ram, product2?.ram, 'ram') === 'product1'
                                    })}>
                                        {product1?.ram || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.ram, product2?.ram, 'ram') === 'product2'
                                    })}>
                                        {product2?.ram || 'Không có thông tin'}
                                    </div>
                                </div>
                                
                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>Bộ nhớ</div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.storage, product2?.storage, 'storage') === 'product1'
                                    })}>
                                        {product1?.storage || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.storage, product2?.storage, 'storage') === 'product2'
                                    })}>
                                        {product2?.storage || 'Không có thông tin'}
                                    </div>
                                </div>
                                
                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>Camera</div>
                                    <div className={cx('spec-value')}>
                                        {product1?.camera || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value')}>
                                        {product2?.camera || 'Không có thông tin'}
                                    </div>
                                </div>
                                
                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>Pin</div>
                                    <div className={cx('spec-value')}>
                                        {product1?.battery || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value')}>
                                        {product2?.battery || 'Không có thông tin'}
                                    </div>
                                </div>
                                
                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>Kích thước</div>
                                    <div className={cx('spec-value')}>
                                        {product1?.weight || 'Không có thông tin'}
                                    </div>
                                    <div className={cx('spec-value')}>
                                        {product2?.weight || 'Không có thông tin'}
                                    </div>
                                </div>
                                
                                <div className={cx('spec-row')}>
                                    <div className={cx('spec-label')}>Giá</div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.price, product2?.price, 'price') === 'product1'
                                    })}>
                                        {product1?.price?.toLocaleString()} đ
                                    </div>
                                    <div className={cx('spec-value', { 
                                        better: determineBetter(product1?.price, product2?.price, 'price') === 'product2'
                                    })}>
                                        {product2?.price?.toLocaleString()} đ
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'features' && (
                        <div className={cx('tab-content')}>
                            <div className={cx('features-comparison')}>
                                <h3>Tính năng nổi bật</h3>
                                
                                <div className={cx('features-grid')}>
                                    <div className={cx('feature-column')}>
                                        <h4>{product1?.name}</h4>
                                        <ul>
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> {product1?.screen || 'Màn hình cao cấp'}</li>
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> {product1?.camera || 'Hệ thống camera chất lượng'}</li>
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> {product1?.battery || 'Pin dung lượng cao'}</li>
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> Bảo hành 12 tháng chính hãng</li>
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> Hỗ trợ sạc nhanh</li>
                                        </ul>
                </div>

                                    <div className={cx('feature-column')}>
                                        <h4>{product2?.name}</h4>
                                        <ul>
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> {product2?.screen || 'Màn hình cao cấp'}</li>
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> {product2?.camera || 'Hệ thống camera chất lượng'}</li>
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> {product2?.battery || 'Pin dung lượng cao'}</li>
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> Bảo hành 12 tháng chính hãng</li>
                                            <li><FontAwesomeIcon icon={faCheckCircle} /> Hỗ trợ sạc nhanh</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'analysis' && (
                        <div className={cx('tab-content')}>
                            <div className={cx('ai-analysis')} ref={compareRef}>
                                <h3>Phân tích chi tiết từ chuyên gia</h3>
                                <div dangerouslySetInnerHTML={{ __html: compare }} />
                            </div>
                        </div>
                    )}
                    
                    <div className={cx('conclusion-section')}>
                        <h3>Kết luận</h3>
                        <p>
                            Cả {product1?.name} và {product2?.name} đều là những sản phẩm chất lượng cao với những ưu điểm riêng.
                            {determineBetter(product1?.price, product2?.price, 'price') === 'product1' ? 
                                ` ${product1?.name} có giá thành hợp lý hơn, phù hợp với người dùng có ngân sách hạn chế.` : 
                                determineBetter(product1?.price, product2?.price, 'price') === 'product2' ? 
                                ` ${product2?.name} có giá thành hợp lý hơn, phù hợp với người dùng có ngân sách hạn chế.` : 
                                ' Cả hai sản phẩm có mức giá tương đương nhau.'}
                            {' '}Lựa chọn sản phẩm phù hợp sẽ phụ thuộc vào nhu cầu sử dụng và sở thích cá nhân của bạn.
                        </p>
                        
                        <div className={cx('buy-options')}>
                            <div className={cx('buy-column')}>
                                <h4>{product1?.name}</h4>
                                <div className={cx('buy-price')}>{product1?.price?.toLocaleString()} đ</div>
                                <button 
                                    className={cx('buy-button')}
                                    onClick={() => handleBuyNow(id1)}
                                >
                                    Mua ngay
                                </button>
                            </div>
                            
                            <div className={cx('buy-column')}>
                                <h4>{product2?.name}</h4>
                                <div className={cx('buy-price')}>{product2?.price?.toLocaleString()} đ</div>
                                <button 
                                    className={cx('buy-button')}
                                    onClick={() => handleBuyNow(id2)}
                                >
                                    Mua ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default CompareProduct;
