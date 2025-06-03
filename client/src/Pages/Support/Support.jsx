import React from 'react';
import classNames from 'classnames/bind';
import styles from './Support.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { QuestionCircleOutlined, MailOutlined, PhoneOutlined, MessageOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

const faqItems = [
    {
        id: 1,
        question: 'Làm thế nào để đặt hàng trên website?',
        answer: 'Bạn có thể đặt hàng trên website của Mac One bằng cách chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán. Bạn sẽ cần đăng nhập hoặc đăng ký tài khoản mới nếu chưa có. Sau đó, hoàn tất thông tin giao hàng và chọn phương thức thanh toán phù hợp.'
    },
    {
        id: 2,
        question: 'Chính sách bảo hành của Mac One như thế nào?',
        answer: 'Mac One áp dụng chính sách bảo hành chính hãng theo quy định của Apple. Thời hạn bảo hành 12 tháng đối với iPhone, iPad, Mac và 24 tháng đối với Apple Watch. Khách hàng có thể mang sản phẩm đến bất kỳ cửa hàng Mac One nào hoặc gửi yêu cầu bảo hành trực tuyến.'
    },
    {
        id: 3,
        question: 'Mac One có cung cấp dịch vụ sửa chữa không?',
        answer: 'Có, Mac One có trung tâm dịch vụ sửa chữa chuyên nghiệp với đội ngũ kỹ thuật viên được đào tạo bởi Apple. Chúng tôi cung cấp dịch vụ sửa chữa cho tất cả các sản phẩm Apple với chi phí hợp lý và chất lượng cao.'
    },
    {
        id: 4,
        question: 'Làm thế nào để theo dõi đơn hàng của tôi?',
        answer: 'Bạn có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản và vào mục "Đơn hàng của tôi". Tại đây, bạn sẽ thấy trạng thái hiện tại của đơn hàng. Ngoài ra, bạn sẽ nhận được email thông báo khi đơn hàng được xác nhận, khi đơn hàng được giao cho đơn vị vận chuyển và khi đơn hàng đã được giao.'
    },
    {
        id: 5,
        question: 'Mac One có chính sách đổi trả không?',
        answer: 'Mac One có chính sách đổi trả trong vòng 7 ngày kể từ ngày mua hàng. Sản phẩm đổi trả phải còn nguyên vẹn, đầy đủ phụ kiện và không có dấu hiệu đã qua sử dụng. Đối với sản phẩm bị lỗi từ nhà sản xuất, chúng tôi sẽ đổi mới hoặc hoàn tiền 100%.'
    },
    {
        id: 6,
        question: 'Có hình thức trả góp cho sản phẩm Apple không?',
        answer: 'Có, Mac One hỗ trợ mua trả góp với nhiều ngân hàng và công ty tài chính. Khách hàng có thể chọn trả góp với lãi suất 0% trong các chương trình khuyến mãi hoặc trả góp thông thường với thời hạn linh hoạt từ 6-24 tháng.'
    }
];

function Support() {
    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>
            
            <main className={cx('main')}>
                <div className={cx('banner')}>
                    <h1>Hỗ trợ khách hàng</h1>
                    <p>Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
                </div>
                
                <div className={cx('support-container')}>
                    <section className={cx('contact-section')}>
                        <h2><QuestionCircleOutlined /> Liên hệ với chúng tôi</h2>
                        <div className={cx('contact-methods')}>
                            <div className={cx('contact-card')}>
                                <PhoneOutlined className={cx('contact-icon')} />
                                <h3>Hotline</h3>
                                <p>1800 1234</p>
                                <p className={cx('time')}>8:30 - 21:30 (Tất cả các ngày)</p>
                            </div>
                            <div className={cx('contact-card')}>
                                <MailOutlined className={cx('contact-icon')} />
                                <h3>Email</h3>
                                <p>support@macone.vn</p>
                                <p className={cx('time')}>Phản hồi trong vòng 24h</p>
                            </div>
                            <div className={cx('contact-card')}>
                                <MessageOutlined className={cx('contact-icon')} />
                                <h3>Chat trực tuyến</h3>
                                <p>Chat với tư vấn viên</p>
                                <p className={cx('time')}>Phản hồi tức thì</p>
                            </div>
                        </div>
                    </section>
                    
                    <section className={cx('faq-section')}>
                        <h2><QuestionCircleOutlined /> Câu hỏi thường gặp (FAQ)</h2>
                        <div className={cx('faq-list')}>
                            {faqItems.map(item => (
                                <div key={item.id} className={cx('faq-item')}>
                                    <div className={cx('question')}>
                                        <h3>{item.question}</h3>
                                    </div>
                                    <div className={cx('answer')}>
                                        <p>{item.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    <section className={cx('contact-form-section')}>
                        <h2><MailOutlined /> Gửi yêu cầu hỗ trợ</h2>
                        <form className={cx('contact-form')}>
                            <div className={cx('form-group')}>
                                <label htmlFor="name">Họ và tên</label>
                                <input type="text" id="name" placeholder="Nhập họ và tên của bạn" />
                            </div>
                            <div className={cx('form-group')}>
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" placeholder="Nhập email của bạn" />
                            </div>
                            <div className={cx('form-group')}>
                                <label htmlFor="phone">Số điện thoại</label>
                                <input type="tel" id="phone" placeholder="Nhập số điện thoại của bạn" />
                            </div>
                            <div className={cx('form-group')}>
                                <label htmlFor="subject">Chủ đề</label>
                                <select id="subject">
                                    <option value="">Chọn chủ đề</option>
                                    <option value="order">Đơn hàng</option>
                                    <option value="product">Sản phẩm</option>
                                    <option value="warranty">Bảo hành</option>
                                    <option value="repair">Sửa chữa</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            <div className={cx('form-group')}>
                                <label htmlFor="message">Nội dung</label>
                                <textarea id="message" rows="5" placeholder="Mô tả chi tiết vấn đề của bạn"></textarea>
                            </div>
                            <div className={cx('form-group')}>
                                <button type="submit" className={cx('submit-button')}>Gửi yêu cầu</button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
            
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Support;