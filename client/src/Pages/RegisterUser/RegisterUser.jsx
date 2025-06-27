import classNames from 'classnames/bind';
import styles from './RegisterUser.module.scss';

import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import { Button, Input, Space } from 'antd';

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { message } from 'antd';
import { requestRegister } from '../../Config/request';

const cx = classNames.bind(styles);

function RegisterUser() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
        if (!phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
        else if (!/^\d{10,11}$/.test(phone)) newErrors.phone = 'Số điện thoại không hợp lệ';
        if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Email không hợp lệ';
        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSuccess = async (response) => {
        const { credential } = response; // Nhận ID Token từ Google
        try {
            const res = await requestLoginGoogle(credential);
            toast.success(res.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const data = { fullName, email, phone, password };
            const res = await requestRegister(data);
            message.success((res.message || 'Đăng ký thành công'));
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            message.error(error.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main>
                <div className={cx('container')}>
                    <h1>Đăng ký</h1>
                    <div className={cx('form')}>
                        <Input placeholder="Họ và tên" onChange={(e) => setFullName(e.target.value)} status={errors.fullName ? 'error' : ''} />
                        {errors.fullName && <div style={{ color: 'red', fontSize: 13 }}>{errors.fullName}</div>}
                        <Input placeholder="Số điện thoại" onChange={(e) => setPhone(e.target.value)} status={errors.phone ? 'error' : ''} />
                        {errors.phone && <div style={{ color: 'red', fontSize: 13 }}>{errors.phone}</div>}
                        <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} status={errors.email ? 'error' : ''} />
                        {errors.email && <div style={{ color: 'red', fontSize: 13 }}>{errors.email}</div>}
                        <Space direction="vertical">
                            <Input.Password placeholder="Mật khẩu" onChange={(e) => setPassword(e.target.value)} status={errors.password ? 'error' : ''} />
                        </Space>
                        {errors.password && <div style={{ color: 'red', fontSize: 13 }}>{errors.password}</div>}
                        <Button type="primary" onClick={handleRegister} loading={loading} block style={{ fontWeight: 500, fontSize: 16 }}>
                            Đăng ký
                        </Button>

                        <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                            <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
                        </GoogleOAuthProvider>
                    </div>
                    <div className={cx('link')}>
                        <Link to="/login">Đăng nhập</Link>
                        <Link to="/forgot-password">Quên mật khẩu</Link>
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default RegisterUser;
