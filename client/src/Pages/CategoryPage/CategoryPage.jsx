import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CategoryPage.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import CategorySidebar from '../../Components/CategorySidebar/CategorySidebar';
import CardBody from '../../Components/CardBody/CardBody';
import { requestGetProductsByCategory, requestFilterProduct } from '../../Config/request';
import { Select, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function CategoryPage() {
    const { identifier } = useParams();
    const [categoryData, setCategoryData] = useState(null);
    const [products, setProducts] = useState([]);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [activeFilter, setActiveFilter] = useState('default');
    
    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching products for category:', identifier);
                
                const response = await requestGetProductsByCategory(identifier);
                console.log('Category products response:', response);
                
                if (response && response.metadata) {
                    setCategoryData({
                        category: response.metadata.category,
                        subcategories: response.metadata.subcategories
                    });
                    const filtered = response.metadata.products.filter(p => p.isActive !== false);
                    setProducts(filtered);
                    setOriginalProducts(filtered);
                }
            } catch (error) {
                console.error('Error fetching category products:', error);
                let errorMessage = 'Không thể tải sản phẩm. Vui lòng thử lại sau.';
                
                if (error.response) {
                    console.error('Error response:', error.response);
                    errorMessage = `Lỗi ${error.response.status}: ${error.response.data?.message || 'Không thể kết nối đến server'}`;
                } else if (error.request) {
                    console.error('Error request:', error.request);
                    errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
                }
                
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        
        if (identifier) {
            fetchCategoryProducts();
        }
    }, [identifier]);
    
    const handleSortChange = (value) => {
        setSortOrder(value);
        
        // Sort products based on price
        const sortedProducts = [...products].sort((a, b) => {
            if (value === 'asc') {
                return a.price - b.price;
            } else {
                return b.price - a.price;
            }
        });
        
        setProducts(sortedProducts);
    };
    
    const handlePriceRange = (range) => {
        setActiveFilter(range || 'default');
        
        // Reset to original products if no range is selected
        if (!range) {
            setProducts(originalProducts);
            return;
        }
        
        // Filter products based on price range
        let filteredProducts = [];
        
        switch (range) {
            case 'under20':
                filteredProducts = originalProducts.filter(product => product.price < 20000000);
                break;
            case '20to40':
                filteredProducts = originalProducts.filter(product => product.price >= 20000000 && product.price <= 40000000);
                break;
            case 'above40':
                filteredProducts = originalProducts.filter(product => product.price > 40000000);
                break;
            default:
                filteredProducts = originalProducts;
        }
        
        // Apply current sort order to filtered products
        if (sortOrder === 'desc') {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else {
            filteredProducts.sort((a, b) => a.price - b.price);
        }
        
        setProducts(filteredProducts);
    };
    
    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>
            
            <main className={cx('main')}>
                <div className={cx('container')}>
                    {/* Breadcrumb */}
                    <div className={cx('breadcrumb')}>
                        <Breadcrumb
                            items={[
                                {
                                    title: <Link to="/"><HomeOutlined /> Trang chủ</Link>,
                                },
                                {
                                    title: categoryData?.category?.parentId ? (
                                        <Link to={`/category/${categoryData.category.parentId._id}`}>
                                            {categoryData.category.parentId.name}
                                        </Link>
                                    ) : 'Danh mục',
                                },
                                {
                                    title: categoryData?.category?.name || 'Đang tải...',
                                },
                            ]}
                        />
                    </div>
                    
                    <div className={cx('content')}>
                        {/* Sidebar */}
                        <div className={cx('sidebar')}>
                            <CategorySidebar />
                        </div>
                        
                        {/* Products */}
                        <div className={cx('products-container')}>
                            <div className={cx('category-header')}>
                                <h1>{categoryData?.category?.name || 'Đang tải danh mục...'}</h1>
                                {categoryData?.category?.description && (
                                    <p className={cx('category-description')}>{categoryData.category.description}</p>
                                )}
                            </div>
                            
                            {/* Filters */}
                            <div className={cx('filters')}>
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
                                
                                <div className={cx('sort-filter')}>
                                    <span>Sắp xếp theo:</span>
                                    <Select
                                        defaultValue="asc"
                                        style={{ width: 200 }}
                                        onChange={handleSortChange}
                                        options={[
                                            { value: 'asc', label: 'Giá từ thấp đến cao' },
                                            { value: 'desc', label: 'Giá từ cao đến thấp' },
                                        ]}
                                    />
                                </div>
                            </div>
                            
                            {/* Products Grid */}
                            {loading ? (
                                <div className={cx('loading')}>
                                    <div className={cx('loading-spinner')}></div>
                                    <p>Đang tải sản phẩm...</p>
                                </div>
                            ) : error ? (
                                <div className={cx('error')}>
                                    <p>{error}</p>
                                    <button onClick={() => window.location.reload()}>Thử lại</button>
                                </div>
                            ) : products.length > 0 ? (
                                <div className={cx('products-grid')}>
                                    {products.map((product) => (
                                        <CardBody key={product._id} item={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className={cx('no-products')}>
                                    <p>Không có sản phẩm nào trong danh mục này.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default CategoryPage; 