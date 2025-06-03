import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './News.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { requestGetProducts, requestFilterProduct, requestGetProductsByCategory } from '../../Config/request';
import { LoadingOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

function News() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhoneProducts = async () => {
            try {
                setLoading(true);
                // Try to get iPhone/phone category products specifically
                // Look for phone category first (this might need to be adjusted based on your actual category IDs or slugs)
                try {
                    // Try with potential iPhone category slugs
                    const phoneResponse = await requestGetProductsByCategory('dien-thoai');
                    if (phoneResponse && phoneResponse.metadata && phoneResponse.metadata.products) {
                        setProducts(phoneResponse.metadata.products);
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    // Ignore error and try next approach
                    console.log('No category found with slug dien-thoai, trying iphone');
                }

                try {
                    // Try with iPhone slug if the first one fails
                    const iphoneResponse = await requestGetProductsByCategory('iphone');
                    if (iphoneResponse && iphoneResponse.metadata && iphoneResponse.metadata.products) {
                        setProducts(iphoneResponse.metadata.products);
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    // Ignore error and fallback to filtering all products
                    console.log('No category found with slug iphone, falling back to manual filtering');
                }

                // If can't get by category, get all products and filter for phones
                const response = await requestGetProducts(15);
                if (response && response.metadata) {
                    let productData = [];
                    if (Array.isArray(response.metadata)) {
                        productData = response.metadata;
                    } else if (response.metadata.products) {
                        productData = response.metadata.products;
                    }
                    
                    // Filter products that look like phones based on name
                    const phoneProducts = productData.filter(product => {
                        const name = product.name?.toLowerCase() || '';
                        return name.includes('iphone') || 
                               name.includes('điện thoại') || 
                               name.includes('phone') ||
                               name.includes('pro max') ||
                               name.includes('samsung') ||
                               name.includes('xiaomi');
                    });
                    
                    setProducts(phoneProducts.length > 0 ? phoneProducts : productData);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPhoneProducts();
    }, []);

    // iPhone-specific news data
    const newsItems = [
        {
            id: 1,
            title: 'iPhone 15 Pro Max ra mắt với khung titanium siêu bền',
            summary: 'Apple vừa chính thức ra mắt iPhone 15 Pro Max với khung viền titanium cao cấp, chip A17 Pro và camera 48MP cải tiến.',
            date: '15/09/2023',
            content: 'Apple vừa chính thức ra mắt dòng iPhone 15 Pro với nhiều cải tiến đột phá. iPhone 15 Pro và 15 Pro Max được trang bị khung viền titanium cấp độ hàng không vũ trụ, chip A17 Pro 3nm đầu tiên trên smartphone, hệ thống camera nâng cấp lớn với ống kính chính 48MP cùng khả năng zoom quang học 5x trên bản Pro Max. Cổng USB-C đã thay thế cổng Lightning, hỗ trợ tốc độ truyền dữ liệu lên đến 10Gbps. Nút Action mới thay thế cho công tắc rung truyền thống, cho phép tùy chỉnh đa dạng hơn.'
        },
        {
            id: 2,
            title: 'iPhone 16 sẽ có nút camera chuyên dụng',
            summary: 'Rò rỉ mới nhất cho thấy iPhone 16 sẽ được trang bị nút camera vật lý mới để cải thiện trải nghiệm chụp ảnh.',
            date: '02/04/2024',
            content: 'Thông tin từ các nhà phân tích đáng tin cậy cho biết, iPhone 16 sẽ có thêm nút camera vật lý được đặt ở cạnh phải của thiết bị. Nút này được thiết kế để hoạt động như một nút chụp truyền thống, nhưng có khả năng nhận diện lực nhấn và cử chỉ vuốt để điều chỉnh zoom hoặc các cài đặt khác. Đây là một phần trong chiến lược của Apple nhằm cải thiện trải nghiệm chụp ảnh trên iPhone, đặc biệt là khi sử dụng một tay. Mẫu iPhone 16 dự kiến sẽ được ra mắt vào tháng 9 năm nay.'
        },
        {
            id: 3,
            title: 'Apple trang bị công nghệ AI mới cho iPhone 17',
            summary: 'iPhone 17 sẽ được tích hợp chip AI chuyên dụng, nâng cao khả năng xử lý trí tuệ nhân tạo trực tiếp trên thiết bị.',
            date: '20/03/2024',
            content: 'Theo nguồn tin từ chuỗi cung ứng, Apple đang phát triển chip AI chuyên dụng cho dòng iPhone 17 dự kiến ra mắt năm 2025. Chip này sẽ giúp xử lý các tác vụ AI và máy học trực tiếp trên thiết bị mà không cần phải gửi dữ liệu lên đám mây. Điều này không chỉ cải thiện tính riêng tư và bảo mật mà còn giúp các tính năng AI hoạt động nhanh hơn, thậm chí khi không có kết nối internet. Các tính năng AI dự kiến bao gồm tối ưu hóa pin thông minh, xử lý ảnh nâng cao và trợ lý ảo thế hệ mới.'
        },
        {
            id: 4,
            title: 'iPhone SE 4 với thiết kế mới sẽ ra mắt đầu năm 2025',
            summary: 'Apple chuẩn bị ra mắt iPhone SE thế hệ thứ 4 với thiết kế toàn màn hình và nhiều nâng cấp về hiệu năng.',
            date: '10/04/2024',
            content: 'iPhone SE 4 dự kiến sẽ có một sự thay đổi lớn về thiết kế, loại bỏ nút Home truyền thống và chuyển sang thiết kế toàn màn hình với notch tương tự iPhone 13. Thiết bị sẽ được trang bị chip A16 Bionic, hỗ trợ 5G, và có thể đi kèm cảm biến Face ID thay vì Touch ID. Camera cũng được nâng cấp lên 48MP, mang đến khả năng chụp ảnh tốt hơn nhiều so với phiên bản tiền nhiệm. Với mức giá dự kiến vẫn giữ ở phân khúc tầm trung, iPhone SE 4 hứa hẹn sẽ là sự lựa chọn hấp dẫn cho những người dùng muốn trải nghiệm iOS mà không phải chi quá nhiều tiền.'
        },
        {
            id: 5,
            title: 'iPhone 15 thống trị thị trường smartphone cao cấp quý 1/2024',
            summary: 'Báo cáo mới nhất cho thấy dòng iPhone 15 chiếm tới 80% doanh số phân khúc smartphone cao cấp toàn cầu.',
            date: '05/04/2024',
            content: 'Theo báo cáo từ Counterpoint Research, dòng iPhone 15 đang chiếm lĩnh thị trường smartphone cao cấp trong quý 1 năm 2024. iPhone 15 Pro Max là mẫu smartphone bán chạy nhất trong phân khúc trên 1000 USD, tiếp theo là iPhone 15 Pro. Mặc dù đối mặt với sự cạnh tranh mạnh mẽ từ các thiết bị Android cao cấp như Samsung Galaxy S24 Ultra và Xiaomi 14 Ultra, iPhone vẫn duy trì vị thế dẫn đầu nhờ hệ sinh thái đồng bộ, hiệu năng mạnh mẽ và thời gian hỗ trợ phần mềm dài. Điều này cho thấy chiến lược tập trung vào phân khúc cao cấp của Apple đang phát huy hiệu quả tốt.'
        }
    ];

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>
            
            <main className={cx('main')}>
                <div className={cx('banner')}>
                    <h1>Tin tức iPhone</h1>
                    <p>Cập nhật thông tin mới nhất về iPhone và sản phẩm Apple</p>
                </div>
                
                {loading ? (
                    <div className={cx('loading')}>
                        <LoadingOutlined style={{ fontSize: 40 }} />
                        <p>Đang tải tin tức...</p>
                    </div>
                ) : (
                    <div className={cx('news-container')}>
                        {newsItems.map((item, index) => {
                            // Get product image from products array
                            const productImage = products[index % products.length]?.images?.[0];
                            
                            return (
                                <div key={item.id} className={cx('news-item')}>
                                    <div className={cx('news-image')}>
                                        {productImage ? (
                                            <img 
                                                src={productImage} 
                                                alt={item.title} 
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = 'https://placehold.co/600x400?text=iPhone';
                                                }}
                                            />
                                        ) : (
                                            <div className={cx('placeholder-image')}>
                                                <span>iPhone</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={cx('news-content')}>
                                        <h2>{item.title}</h2>
                                        <p className={cx('news-date')}>{item.date}</p>
                                        <p className={cx('news-summary')}>{item.summary}</p>
                                        <button className={cx('read-more')}>Đọc tiếp</button>
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

export default News;