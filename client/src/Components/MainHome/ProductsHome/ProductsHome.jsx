import classNames from 'classnames/bind';
import styles from './ProductsHome.module.scss';
import CardBody from '../../CardBody/CardBody';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { requestGetProducts, requestFilterProduct, requestGetProductsByCategory, requestSearchProduct } from '../../../Config/request';
import { Select } from 'antd';
import { useCategory } from '../../../context/CategoryContext';
import useDebounce from '../../../hooks/useDebounce';

const cx = classNames.bind(styles);

function ProductsHome() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const [productCompare, setProductCompare] = useState([]);
    const [checkSelectCompare, setCheckSelectCompare] = useState(false);
    const [activeFilter, setActiveFilter] = useState('default');
    const [categoryTitle, setCategoryTitle] = useState('Sản phẩm nổi bật');
    
    // Search state
    const [keyword, setKeyword] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [resultSearch, setResultSearch] = useState([]);
    const debouncedValue = useDebounce(keyword, 500);
    
    const { selectedCategory, setSelectedCategory } = useCategory();
    const navigate = useNavigate();

    const handlePriceRange = async (range) => {
        try {
            setActiveFilter(range || 'default');
            let params = { priceRange: range };
            
            // If a category is selected, include it in the filter
            if (selectedCategory) {
                params.categoryId = selectedCategory._id;
            }
            
            const res = await requestFilterProduct(params);
            if (res && res.metadata) {
                setProducts(res.metadata);
            }
        } catch (error) {
            console.error('Error filtering products:', error);
        }
    };

    const handleSortChange = async (value) => {
        try {
            const pricedes = value === 'desc' ? 'desc' : 'asc';
            let params = { pricedes };
            
            // If a category is selected, include it in the filter
            if (selectedCategory) {
                params.categoryId = selectedCategory._id;
            }
            
            const res = await requestFilterProduct(params);
            if (res && res.metadata) {
                setProducts(res.metadata);
            }
        } catch (error) {
            console.error('Error sorting products:', error);
        }
    };

    const handleCompare = (item) => {
        // Check if we already have this product in the comparison array
        if (!productCompare.includes(item)) {
            // Limit to 2 products maximum
            const newCompareList = [...productCompare];
            if (newCompareList.length >= 2) {
                // If already have 2 products, replace the second one
                newCompareList[1] = item;
            } else {
                // Otherwise add to the array
                newCompareList.push(item);
            }
            setProductCompare(newCompareList);
        }
    };

    // Search functionality
    useEffect(() => {
        const fetchData = async () => {
            if (!debouncedValue.trim()) {
                setResultSearch([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await requestSearchProduct(debouncedValue);
                setResultSearch(res.metadata);
            } catch (error) {
                setResultSearch([]);
            } finally {
                setIsSearching(false);
            }
        };
        fetchData();
    }, [debouncedValue]);

    useEffect(() => {
        if (productCompare.length === 2) {
            navigate(`/compare-product/${productCompare[0]}/${productCompare[1]}`);
        }
    }, [productCompare, navigate]);

    // Effect to fetch products when category changes
    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                setLoading(true);
                
                if (selectedCategory) {
                    // If a category is selected, fetch products for that category
                    const identifier = selectedCategory.slug || selectedCategory._id;
                    const response = await requestGetProductsByCategory(identifier);
                    
                    if (response && response.metadata && response.metadata.products) {
                        setProducts(response.metadata.products);
                        setCategoryTitle(selectedCategory.name);
                    } else {
                        setProducts([]);
                    }
                } else {
                    // Otherwise fetch featured products
                    const res = await requestGetProducts(8);
                    
                    if (res && res.metadata) {
                        if (res.metadata.products) {
                            setProducts(res.metadata.products);
                        } else if (Array.isArray(res.metadata)) {
                            setProducts(res.metadata);
                        } else {
                            setProducts([]);
                        }
                        setCategoryTitle('Sản phẩm nổi bật');
                    }
                }
                
                setActiveFilter('default');
                setError(null);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
                setDebugInfo(`Error: ${err.message}, Status: ${err.response?.status}, Data: ${JSON.stringify(err.response?.data || {})}`);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCategoryProducts();
    }, [selectedCategory]);

    if (loading) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('title')}>
                        <h2>{categoryTitle}</h2>
                    </div>
                    <div className={cx('loading-container')}>
                        <div className={cx('loading-spinner')}></div>
                        <p>Đang tải sản phẩm...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('title')}>
                        <h2>{categoryTitle}</h2>
                    </div>
                    <div className={cx('error-container')}>
                        <div className={cx('error-icon')}>⚠️</div>
                        <p className={cx('error-message')}>{error}</p>
                        <button 
                            className={cx('retry-button')}
                            onClick={() => window.location.reload()}
                        >
                            Thử lại
                        </button>
                        {debugInfo && <div className={cx('debug')}>{debugInfo}</div>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('header')}>
                    <div className={cx('title')}>
                        <h2>{categoryTitle}</h2>
                        <div className={cx('title-underline')}></div>
                    </div>
                    {selectedCategory && (
                        <button 
                            className={cx('clear-category')}
                            onClick={() => setSelectedCategory(null)}
                        >
                            Xem tất cả sản phẩm
                        </button>
                    )}
                </div>
                
                {/* Search Box - Above Filter Section */}
                <div className={cx('search-container')}>
                    <div className={cx('search')}>
                        <input
                            type="text"
                            placeholder="Nhập tên sản phẩm bạn muốn tìm kiếm..."
                            onChange={(e) => setKeyword(e.target.value)}
                            value={keyword}
                        />
                        {keyword.trim() && (
                            <div className={cx('result-search')}>
                                {isSearching ? (
                                    <div className={cx('searching')}>
                                        <span>Đang tìm kiếm...</span>
                                    </div>
                                ) : resultSearch.length > 0 ? (
                                    resultSearch.map((item) => (
                                        <Link to={`/product/${item._id}`} key={item._id} className={cx('search-item')}>
                                            <img src={item.images[0]} alt={item.name} />
                                            <div className={cx('info')}>
                                                <h4>{item.name}</h4>
                                                <p>{item.price.toLocaleString('vi-VN')}đ</p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className={cx('no-result')}>
                                        <span>Không tìm thấy sản phẩm nào</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className={cx('filter')}>
                    <div className={cx('price-filters')}>
                        <button 
                            onClick={() => handlePriceRange()}
                            className={cx({ active: activeFilter === 'default' })}
                        >
                            Mặc định
                        </button>
                        <button 
                            onClick={() => handlePriceRange('under20')}
                            className={cx({ active: activeFilter === 'under20' })}
                        >
                            Dưới 20 triệu
                        </button>
                        <button 
                            onClick={() => handlePriceRange('20to40')}
                            className={cx({ active: activeFilter === '20to40' })}
                        >
                            20 - 40 triệu
                        </button>
                        <button 
                            onClick={() => handlePriceRange('above40')}
                            className={cx({ active: activeFilter === 'above40' })}
                        >
                            Trên 40 triệu
                        </button>
                    </div>

                    <div className={cx('sort-compare')}>
                        <Select
                            defaultValue="asc"
                            style={{ width: 200 }}
                            onChange={handleSortChange}
                            options={[
                                { value: 'desc', label: 'Giá từ cao đến thấp' },
                                { value: 'asc', label: 'Giá từ thấp đến cao' },
                            ]}
                        />

                        <button onClick={() => setCheckSelectCompare(!checkSelectCompare)}>
                            {checkSelectCompare ? 'Bỏ so sánh' : 'So sánh'}
                        </button>
                    </div>
                </div>
                
                {products.length > 0 ? (
                    <>
                        <div className={cx('card-body')}>
                            {products.map((item) => (
                                <CardBody 
                                    key={item._id} 
                                    item={item} 
                                    checkSelectCompare={checkSelectCompare}
                                    handleCompare={handleCompare}
                                />
                            ))}
                        </div>

                        {!selectedCategory && (
                            <div className={cx('button-group')}>
                                <Link to="/category">
                                    <button>Xem tất cả sản phẩm</button>
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={cx('no-products')}>
                        <div className={cx('no-products-icon')}>📦</div>
                        <p>Không có sản phẩm nào phù hợp với bộ lọc.</p>
                        <p className={cx('no-products-sub')}>Vui lòng thử lại với bộ lọc khác.</p>
                        {debugInfo && <div className={cx('debug')}>{debugInfo}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductsHome;
