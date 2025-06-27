import classNames from 'classnames/bind';
import styles from './LoginUser.module.scss';

import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import { Input, Button, Space, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

import { requestLogin, requestLoginGoogle } from '../../Config/request';
import { useState } from 'react';

const cx = classNames.bind(styles);

function LoginUser() {
    const handleSuccess = async (response) => {
        const { credential } = response; // Nhận ID Token từ Google
        try {
            const res = await requestLoginGoogle(credential);
            message.success(res.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Email không hợp lệ';
        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setLoading(true);
        const data = { email, password };
        try {
            const res = await requestLogin(data);
            message.success(res.metadata.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            message.error(error.response?.data?.message || 'Đăng nhập thất bại');
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
                    <h1>Đăng nhập</h1>
                    <div className={cx('form')}>
                        <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} status={errors.email ? 'error' : ''} />
                        {errors.email && <div style={{ color: 'red', fontSize: 13 }}>{errors.email}</div>}
                        <Space direction="vertical">
                            <Input.Password placeholder="Mật khẩu" onChange={(e) => setPassword(e.target.value)} status={errors.password ? 'error' : ''} />
                        </Space>
                        {errors.password && <div style={{ color: 'red', fontSize: 13 }}>{errors.password}</div>}
                        <Button type="primary" fullWidth onClick={handleLogin} loading={loading} block style={{ fontWeight: 500, fontSize: 16 }}>
                            Đăng nhập
                        </Button>

                        <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                            <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
                        </GoogleOAuthProvider>
                    </div>
                    <div className={cx('link')}>
                        <Link to="/register">Đăng ký</Link>
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

export default LoginUser;
