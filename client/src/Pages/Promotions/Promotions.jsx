import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Promotions.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { GiftOutlined, ClockCircleOutlined, RightOutlined, LoadingOutlined } from '@ant-design/icons';
import { requestGetProducts } from '../../Config/request';

const cx = classNames.bind(styles);

function Promotions() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await requestGetProducts(10);
                if (response && response.metadata) {
                    let productData = [];
                    if (Array.isArray(response.metadata)) {
                        productData = response.metadata;
                    } else if (response.metadata.products) {
                        productData = response.metadata.products;
                    }
                    setProducts(productData);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Sample promotions data with dates, discount values and promo codes
    const promotions = [
        {
            id: 1,
            title: 'Mua iPhone 15 Pro Max - Nhận ngay AirPods 3',
            discount: '30%',
            expiryDate: '30/05/2024',
            description: 'Khi mua iPhone 15 Pro Max, bạn sẽ được tặng ngay AirPods 3 chính hãng hoặc voucher giảm giá tương đương. Chương trình chỉ áp dụng tại cửa hàng chính hãng.',
            code: 'IPHONE15PRO'
        },
        {
            id: 2,
            title: 'Ưu đãi sinh viên - Giảm đến 10% cho MacBook Air M3',
            discount: '10%',
            expiryDate: '15/06/2024',
            description: 'Sinh viên sẽ được giảm 10% khi mua MacBook Air M3. Chỉ cần xuất trình thẻ sinh viên hợp lệ khi mua hàng tại cửa hàng hoặc nhập mã khi mua online.',
            code: 'STUDENT10'
        },
        {
            id: 3,
            title: 'Mua iPad Pro - Tặng Apple Pencil thế hệ 2',
            discount: '25%',
            expiryDate: '20/05/2024',
            description: 'Khách hàng mua iPad Pro sẽ được tặng kèm Apple Pencil thế hệ 2 hoặc voucher giảm giá tương đương khi mua các phụ kiện khác.',
            code: 'IPADPRO24'
        },
        {
            id: 4,
            title: 'Ưu đãi đặc biệt - Mua 1 tặng 1 phụ kiện',
            discount: '15%',
            expiryDate: '10/05/2024',
            description: 'Khi mua Apple Watch SE 2, khách hàng sẽ được tặng kèm 1 dây đeo chính hãng hoặc voucher giảm giá cho lần mua hàng tiếp theo.',
            code: 'WATCHSE2'
        },
        {
            id: 5,
            title: 'Tuần lễ sản phẩm Mac - Giảm đến 20%',
            discount: '20%',
            expiryDate: '01/06/2024',
            description: 'Tuần lễ khuyến mãi đặc biệt dành cho các sản phẩm Mac với mức giảm lên đến 20%. Áp dụng cho MacBook Pro, MacBook Air, iMac và Mac mini.',
            code: 'MACWEEK'
        }
    ];

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>
            
            <main className={cx('main')}>
                <div className={cx('banner')}>
                    <h1>Khuyến mãi</h1>
                    <p>Những ưu đãi đặc biệt dành cho bạn</p>
                </div>
                
                {loading ? (
                    <div className={cx('loading')}>
                        <LoadingOutlined style={{ fontSize: 40 }} />
                        <p>Đang tải khuyến mãi...</p>
                    </div>
                ) : (
                    <div className={cx('promotions-container')}>
                        {promotions.map((promo, index) => {
                            // Get product image from products array
                            const productImage = products[index % products.length]?.images?.[0];
                            
                            return (
                                <div key={promo.id} className={cx('promo-card')}>
                                    <div className={cx('promo-image')}>
                                        {productImage ? (
                                            <img 
                                                src={productImage} 
                                                alt={promo.title} 
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = 'https://placehold.co/600x400?text=Mac+One';
                                                }}
                                            />
                                        ) : (
                                            <div className={cx('placeholder-image')}>
                                                <span>Mac One</span>
                                            </div>
                                        )}
                                        <div className={cx('discount-badge')}>
                                            <GiftOutlined /> {promo.discount}
                                        </div>
                                    </div>
                                    <div className={cx('promo-content')}>
                                        <h2>{promo.title}</h2>
                                        <p className={cx('promo-description')}>{promo.description}</p>
                                        <div className={cx('promo-footer')}>
                                            <div className={cx('promo-expiry')}>
                                                <ClockCircleOutlined /> Hết hạn: {promo.expiryDate}
                                            </div>
                                            <div className={cx('promo-code')}>
                                                Mã: <span>{promo.code}</span>
                                            </div>
                                        </div>
                                        <button className={cx('apply-button')}>
                                            Sử dụng ngay <RightOutlined />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Promotions;