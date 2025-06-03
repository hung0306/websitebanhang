import React from 'react';
import classNames from 'classnames/bind';
import styles from './About.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { TeamOutlined, ShopOutlined, PhoneOutlined, MailOutlined, CheckCircleOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

const teamMembers = [
    {
        id: 1,
        name: 'Nguyễn Văn Anh',
        role: 'CEO & Founder',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    },
    {
        id: 2,
        name: 'Trần Minh Hải',
        role: 'Technical Director',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    },
    {
        id: 3,
        name: 'Lê Thanh Hương',
        role: 'Marketing Manager',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80',
    },
    {
        id: 4,
        name: 'Phạm Quốc Bảo',
        role: 'Customer Service Manager',
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    }
];

const storeLocations = [
    {
        id: 1,
        name: 'Mac One - Hồ Chí Minh',
        address: '123 Nguyễn Du, Quận 1, TP. Hồ Chí Minh',
        phone: '028 3822 1234',
        hours: '8:00 - 21:00, Thứ 2 - Chủ nhật'
    },
    {
        id: 2,
        name: 'Mac One - Hà Nội',
        address: '45 Thái Hà, Quận Đống Đa, Hà Nội',
        phone: '024 3623 4567',
        hours: '8:00 - 21:00, Thứ 2 - Chủ nhật'
    },
    {
        id: 3,
        name: 'Mac One - Đà Nẵng',
        address: '67 Lê Duẩn, Quận Hải Châu, Đà Nẵng',
        phone: '0236 3827 8901',
        hours: '8:30 - 20:30, Thứ 2 - Chủ nhật'
    }
];

const values = [
    {
        id: 1,
        title: 'Sản phẩm chính hãng 100%',
        description: 'Tất cả sản phẩm bán tại Mac One đều là hàng chính hãng, được nhập khẩu trực tiếp từ Apple hoặc từ các nhà phân phối ủy quyền của Apple tại Việt Nam.'
    },
    {
        id: 2,
        title: 'Dịch vụ khách hàng tận tâm',
        description: 'Đội ngũ nhân viên tư vấn và hỗ trợ kỹ thuật của chúng tôi luôn sẵn sàng phục vụ bạn với sự tận tâm và chuyên nghiệp nhất.'
    },
    {
        id: 3,
        title: 'Chế độ bảo hành ưu việt',
        description: 'Mac One cung cấp chính sách bảo hành cạnh tranh, với nhiều ưu đãi đặc biệt và dịch vụ sửa chữa nhanh chóng, chuyên nghiệp.'
    },
    {
        id: 4,
        title: 'Giao hàng nhanh chóng',
        description: 'Chúng tôi cam kết giao hàng nhanh chóng trên toàn quốc, với nhiều ưu đãi về phí vận chuyển cho khách hàng.'
    }
];

function About() {
    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>
            
            <main className={cx('main')}>
                <div className={cx('banner')}>
                    <h1>Về Chúng Tôi</h1>
                    <p>Mac One - Đại lý ủy quyền chính thức của Apple tại Việt Nam</p>
                </div>
                
                <div className={cx('about-container')}>
                    <section className={cx('company-intro')}>
                        <div className={cx('section-title')}>
                            <h2>Giới thiệu</h2>
                        </div>
                        <div className={cx('company-info')}>
                            <div className={cx('info-image')}>
                                <img src="https://macone.vn/wp-content/uploads/2024/03/mac-one-cua-hang-uy-quyen-apple.jpg" alt="Mac One Store" />
                            </div>
                            <div className={cx('info-content')}>
                                <p>Mac One là đại lý ủy quyền chính thức của Apple tại Việt Nam (Apple Authorized Reseller - AAR). Chúng tôi chuyên cung cấp các sản phẩm Apple chính hãng như iPhone, iPad, Mac, Apple Watch cùng với các phụ kiện và dịch vụ hỗ trợ kỹ thuật chuyên nghiệp.</p>
                                <p>Với hơn 10 năm kinh nghiệm, Mac One tự hào là điểm đến tin cậy cho người dùng sản phẩm Apple tại Việt Nam. Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời với sản phẩm chính hãng, giá cả cạnh tranh và dịch vụ chăm sóc khách hàng tận tâm.</p>
                            </div>
                        </div>
                    </section>
                    
                    <section className={cx('values-section')}>
                        <div className={cx('section-title')}>
                            <h2>Giá trị cốt lõi</h2>
                        </div>
                        <div className={cx('values-container')}>
                            {values.map(value => (
                                <div key={value.id} className={cx('value-item')}>
                                    <CheckCircleOutlined className={cx('value-icon')} />
                                    <h3>{value.title}</h3>
                                    <p>{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    <section className={cx('team-section')}>
                        <div className={cx('section-title')}>
                            <h2>Đội ngũ của chúng tôi</h2>
                        </div>
                        <div className={cx('team-container')}>
                            {teamMembers.map(member => (
                                <div key={member.id} className={cx('team-member')}>
                                    <div className={cx('member-image')}>
                                        <img src={member.image} alt={member.name} />
                                    </div>
                                    <h3>{member.name}</h3>
                                    <p>{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    <section className={cx('stores-section')}>
                        <div className={cx('section-title')}>
                            <h2>Hệ thống cửa hàng</h2>
                        </div>
                        <div className={cx('stores-container')}>
                            {storeLocations.map(store => (
                                <div key={store.id} className={cx('store-item')}>
                                    <h3><ShopOutlined /> {store.name}</h3>
                                    <p className={cx('store-address')}>{store.address}</p>
                                    <p className={cx('store-contact')}><PhoneOutlined /> {store.phone}</p>
                                    <p className={cx('store-hours')}>{store.hours}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    <section className={cx('contact-section')}>
                        <div className={cx('section-title')}>
                            <h2>Liên hệ</h2>
                        </div>
                        <div className={cx('contact-info')}>
                            <div className={cx('contact-item')}>
                                <PhoneOutlined />
                                <p>Hotline: 1800 1234</p>
                            </div>
                            <div className={cx('contact-item')}>
                                <MailOutlined />
                                <p>Email: support@macone.vn</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default About;