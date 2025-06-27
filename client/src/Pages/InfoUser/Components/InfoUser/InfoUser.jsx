import classNames from 'classnames/bind';
import styles from './InfoUser.module.scss';

import { Button, Input, message, Card, Tabs, Tag, Typography, Avatar, Badge } from 'antd';
import { Table } from 'antd';
import { useStore } from '../../../../hooks/useStore';
import { useEffect, useState } from 'react';
import { requestGetHistoryOrder, requestUpdateInfoUser, requestUpdateStatusOrder } from '../../../../Config/request';
import ModalUpdatePassword from './ModalUpdatePassword/ModalUpdatePassword';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, LockOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { Tabs as AntdTabs } from 'antd';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const cx = classNames.bind(styles);

function getColumns(cancellingId, setCancellingId, setDataOrder) {
    return [
        {
            title: 'ID',
            dataIndex: 'orderId',
            key: 'orderId',
            width: '15%',
            ellipsis: true,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'products',
            key: 'products',
            render: (products) => products[0].name,
        },
        {
            title: 'Giá',
            dataIndex: 'products',
            key: 'price',
            render: (products) => {
                const p = products[0];
                if (p.priceDiscount && p.priceDiscount > 0) {
                    return p.priceDiscount.toLocaleString('vi-VN') + ' đ';
                }
                return p.price?.toLocaleString('vi-VN') + ' đ';
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'products',
            key: 'quantity',
            render: (products) => products[0]?.quantity,
        },
        {
            title: 'Thành tiền',
            dataIndex: 'products',
            key: 'total',
            render: (products) => {
                const p = products[0];
                const price = p.priceDiscount && p.priceDiscount > 0 ? p.priceDiscount : p.price;
                const total = price * p.quantity;
                return total?.toLocaleString('vi-VN') + ' đ';
            },
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'statusOrder',
            key: 'statusOrder',
            render: (status) => {
                let color = '';
                let text = '';

                switch (status) {
                    case 'pending':
                        color = '#faad14'; // màu vàng
                        text = 'Đang xử lý';
                        break;
                    case 'completed':
                        color = '#1677ff'; // màu xanh dương
                        text = 'Đã xác nhận';
                        break;
                    case 'shipping':
                        color = '#722ed1'; // màu tím
                        text = 'Đang vận chuyển';
                        break;
                    case 'delivered':
                        color = '#52c41a'; // màu xanh lá
                        text = 'Đã giao hàng';
                        break;
                    case 'cancelled':
                        color = '#ff4d4f'; // màu đỏ
                        text = 'Đã hủy';
                        break;
                    default:
                        color = '#000000';
                        text = status;
                }

                return (
                    <Tag
                        color={color}
                        style={{
                            borderRadius: '20px',
                            padding: '4px 12px',
                            fontWeight: 500
                        }}
                    >
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: 'Phương thức',
            dataIndex: 'typePayments',
            key: 'typePayments',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => {
                if (record.statusOrder === 'pending') {
                    return (
                        <Button danger size="small" disabled={cancellingId === record.orderId} onClick={async () => {
                            setCancellingId(record.orderId);
                            try {
                                await requestUpdateStatusOrder({ statusOrder: 'cancelled', orderId: record.orderId });
                                message.success('Huỷ đơn hàng thành công');
                                // Reload orders
                                const res = await requestGetHistoryOrder();
                                setDataOrder(res.metadata.orders);
                            } catch (error) {
                                message.error(error?.response?.data?.message || 'Huỷ đơn hàng thất bại');
                            } finally {
                                setCancellingId(null);
                            }
                        }}>
                            Huỷ đơn hàng
                        </Button>
                    );
                }
                return null;
            },
        },
    ];
}

function InfoUser({ isOpen, setIsOpen }) {
    const { dataUser } = useStore();
    const location = useLocation();

    const [fullName, setFullName] = useState(dataUser.fullName);
    const [email, setEmail] = useState(dataUser.email);
    const [phone, setPhone] = useState(dataUser.phone);
    const [address, setAddress] = useState(dataUser.address || 'Chưa cập nhật');
    const [activeTab, setActiveTab] = useState('1');
    const [addressError, setAddressError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);
    const [tabOrderStatus, setTabOrderStatus] = useState('pending');

    useEffect(() => {
        setFullName(dataUser.fullName);
        setEmail(dataUser.email);
        setPhone(dataUser.phone);
        setAddress(dataUser.address || 'Chưa cập nhật');
    }, [dataUser]);

    useEffect(() => {
        // Nếu có query ?tab=orders thì chuyển sang tab 2
        const params = new URLSearchParams(location.search);
        if (params.get('tab') === 'orders') {
            setActiveTab('2');
        }
    }, [location.search]);

    const handleUpdateInfoUser = async () => {
        if (!address || address.trim() === '' || address === 'Chưa cập nhật') {
            setAddressError('Vui lòng nhập địa chỉ!');
            return;
        }
        setAddressError('');
        try {
            const data = {
                fullName,
                email,
                phone,
                address,
            };
            const res = await requestUpdateInfoUser(data);
            if (res && res.message && res.message.includes('thành công')) {
                message.success('Cập nhật thông tin người dùng thành công');
                window.location.reload();
            } else {
                message.error(res.message || 'Cập nhật thông tin người dùng thất bại');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Cập nhật thông tin người dùng thất bại');
        }
    };

    const [dataOrder, setDataOrder] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetHistoryOrder();
            setDataOrder(res.metadata.orders);
        };
        fetchData();
    }, []);

    const handleChangePassword = () => {
        setIsOpen(true);
    };

    // Tạo các mảng đơn hàng theo trạng thái
    const ordersByStatus = {
        pending: dataOrder.filter(o => o.statusOrder === 'pending'),
        shipping: dataOrder.filter(o => o.statusOrder === 'shipping'),
        delivered: dataOrder.filter(o => o.statusOrder === 'delivered'),
        cancelled: dataOrder.filter(o => o.statusOrder === 'cancelled'),
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('user-header')}>
                <div className={cx('avatar')}>
                    <UserOutlined />
                </div>
                <div className={cx('user-info')}>
                    <h3>{fullName}</h3>
                    <p>{email}</p>
                </div>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab} className={cx('tabs')}>
                <TabPane 
                    tab={
                        <span>
                            <UserOutlined /> Thông tin cá nhân
                        </span>
                    } 
                    key="1"
                >
                    <div className={cx('section')}>
                        <Title level={5}>Thông tin liên hệ</Title>
                        <div className={cx('form')}>
                            <Input
                                size="large"
                                placeholder="Họ và tên"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                prefix={<UserOutlined />}
                            />
                            <Input 
                                size="large" 
                                placeholder="Email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                prefix={<MailOutlined />}
                            />
                            <Input
                                size="large"
                                placeholder="Số điện thoại"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                prefix={<PhoneOutlined />}
                            />
                            <Input.TextArea
                                size="large"
                                placeholder="Nhập địa chỉ cụ thể (ví dụ: Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                                value={address === 'Chưa cập nhật' ? '' : address}
                                onChange={(e) => setAddress(e.target.value)}
                                prefix={<HomeOutlined />}
                                autoSize={{ minRows: 2, maxRows: 4 }}
                                status={addressError ? 'error' : ''}
                                style={{ resize: 'none' }}
                                onFocus={() => setAddressError('')}
                            />
                            {addressError && <div style={{ color: 'red', fontSize: 13 }}>{addressError}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Button onClick={handleUpdateInfoUser} className={cx('btn')} type="primary" size="large">
                                Cập nhật thông tin
                            </Button>
                            <Button 
                                onClick={handleChangePassword} 
                                type="default" 
                                size="large"
                                icon={<LockOutlined />}
                            >
                                Đổi mật khẩu
                            </Button>
                        </div>
                    </div>
                </TabPane>
                
                <TabPane 
                    tab={
                        <span>
                            <ShoppingOutlined /> Lịch sử đơn hàng
                            <Badge 
                                count={dataOrder.length} 
                                style={{ marginLeft: '8px', backgroundColor: '#1677ff' }} 
                                size="small" 
                            />
                        </span>
                    } 
                    key="2"
                >
                    <div className={cx('section')}>
                        <Title level={5}>Đơn hàng của bạn</Title>
                        <AntdTabs
                            activeKey={tabOrderStatus}
                            onChange={setTabOrderStatus}
                            items={[
                                {
                                    key: 'pending',
                                    label: 'Đang xử lý',
                                    children: <Table dataSource={ordersByStatus.pending} columns={getColumns(cancellingId, setCancellingId, setDataOrder)} rowKey="orderId" pagination={{ pageSize: 5, showSizeChanger: true, showTotal: (total) => `Tổng số ${total} đơn hàng` }} />
                                },
                                {
                                    key: 'shipping',
                                    label: 'Đang giao',
                                    children: <Table dataSource={ordersByStatus.shipping} columns={getColumns(cancellingId, setCancellingId, setDataOrder)} rowKey="orderId" pagination={{ pageSize: 5, showSizeChanger: true, showTotal: (total) => `Tổng số ${total} đơn hàng` }} />
                                },
                                {
                                    key: 'delivered',
                                    label: 'Đã giao',
                                    children: <Table dataSource={ordersByStatus.delivered} columns={getColumns(cancellingId, setCancellingId, setDataOrder)} rowKey="orderId" pagination={{ pageSize: 5, showSizeChanger: true, showTotal: (total) => `Tổng số ${total} đơn hàng` }} />
                                },
                                {
                                    key: 'cancelled',
                                    label: 'Đã huỷ',
                                    children: <Table dataSource={ordersByStatus.cancelled} columns={getColumns(cancellingId, setCancellingId, setDataOrder)} rowKey="orderId" pagination={{ pageSize: 5, showSizeChanger: true, showTotal: (total) => `Tổng số ${total} đơn hàng` }} />
                                },
                            ]}
                        />
                    </div>
                </TabPane>
            </Tabs>
            
            <ModalUpdatePassword isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    );
}

export default InfoUser;
