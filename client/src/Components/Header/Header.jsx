import classNames from 'classnames/bind';
import styles from './Header.module.scss';

import { Link, useNavigate } from 'react-router-dom';

import logo from '../../assets/images/logo.png';

import { useStore } from '../../hooks/useStore';

import { Avatar, Dropdown, Menu, Space } from 'antd';
import { UserOutlined, LogoutOutlined, ShoppingCartOutlined, AppstoreOutlined, GiftOutlined, QuestionCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { requestLogout } from '../../Config/request';

import { useState } from 'react';

const cx = classNames.bind(styles);

function Header() {
    const { dataUser } = useStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await requestLogout();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
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
                                    <Link to={`/cart`}>
                                        <Menu.Item key="cart" icon={<ShoppingCartOutlined />}>
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
