import classNames from 'classnames/bind';
import styles from './Header.module.scss';

import { Link, useNavigate } from 'react-router-dom';

import logo from '../../assets/images/logo.png';

import { useStore } from '../../hooks/useStore';

import { Avatar, Dropdown, Menu, Space, Badge } from 'antd';
import { UserOutlined, LogoutOutlined, ShoppingCartOutlined, AppstoreOutlined, GiftOutlined, QuestionCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { requestLogout, requestGetCart } from '../../Config/request';

import { useState, useEffect } from 'react';

const cx = classNames.bind(styles);

function Header() {
    const { dataUser, resetUser, cartCount, setCartCount } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                const res = await requestGetCart();
                if (res && res.metadata && res.metadata.newData && Array.isArray(res.metadata.newData.data)) {
                    setCartCount(res.metadata.newData.data.length);
                } else {
                    setCartCount(0);
                }
            } catch (error) {
                setCartCount(0);
            }
        };
        if (dataUser._id) fetchCartCount();
    }, [dataUser._id, setCartCount]);

    const handleLogout = async () => {
        try {
            await requestLogout();
            resetUser();
            navigate('/');
        } catch (error) {
            return;
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Link to="/">
                    <div className={cx('logo')}>
                        <img src={logo} alt="logo" />
                    </div>
                </Link>

                <div className={cx('header-links')}>
                    <Link to="/category" className={cx('header-link')}>
                        <AppstoreOutlined className={cx('header-icon')} />
                        <span>Sản phẩm</span>
                    </Link>
                    <Link to="/news" className={cx('header-link')}>
                        <span>Tin tức</span>
                    </Link>
                    <Link to="/promotions" className={cx('header-link')}>
                        <GiftOutlined className={cx('header-icon')} />
                        <span>Khuyến mãi</span>
                    </Link>
                    <Link to="/support" className={cx('header-link')}>
                        <QuestionCircleOutlined className={cx('header-icon')} />
                        <span>Hỗ trợ</span>
                    </Link>
                    <Link to="/about" className={cx('header-link')}>
                        <TeamOutlined className={cx('header-icon')} />
                        <span>Về chúng tôi</span>
                    </Link>
                </div>
                
                {dataUser._id ? (
                    <>
                        <Dropdown
                            overlay={
                                <Menu>
                                    <Link to={`/info-user/${dataUser._id}`}>
                                        <Menu.Item key="profile" icon={<UserOutlined />}>
                                            Hồ sơ
                                        </Menu.Item>
                                    </Link>
                                    <Link to={`/info-user/${dataUser._id}?tab=orders`}>
                                        <Menu.Item key="orders" icon={<AppstoreOutlined />}>
                                            Lịch sử đơn hàng
                                        </Menu.Item>
                                    </Link>
                                    <Link to={`/cart`}>
                                        <Menu.Item key="cart" icon={
                                            <Badge count={cartCount} size="small" offset={[2, -2]}>
                                                <ShoppingCartOutlined />
                                            </Badge>
                                        }>
                                            Giỏ hàng
                                        </Menu.Item>
                                    </Link>

                                    <Menu.Divider />

                                    <Menu.Item onClick={handleLogout} key="logout" icon={<LogoutOutlined />} danger>
                                        Đăng xuất
                                    </Menu.Item>
                                </Menu>
                            }
                            trigger={['click']}
                        >
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar size="large" icon={<UserOutlined />} />
                            </Space>
                        </Dropdown>
                    </>
                ) : (
                    <div className={cx('button-group')}>
                        <Link to="/register">
                            <button>Đăng ký</button>
                        </Link>
                        <Link to="/login">
                            <button>Đăng nhập</button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
