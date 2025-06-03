import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Space, Switch, Typography, Divider } from 'antd';
import { 
    ArrowLeftOutlined, 
    ShopOutlined, 
    MailOutlined, 
    PhoneOutlined, 
    HomeOutlined, 
    FileTextOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { requestAddSupplier } from '../../../Config/request';

const { TextArea } = Input;
const { Title } = Typography;

const AddSupplier = ({ setActiveComponent }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            
            // Chuẩn bị dữ liệu nhà cung cấp
            const supplierData = {
                name: values.name.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
                address: values.address.trim(),
                description: values.description ? values.description.trim() : '',
                isActive: values.isActive !== undefined ? values.isActive : true,
            };

            console.log('Sending supplier data:', supplierData);

            // Gửi dữ liệu nhà cung cấp
            const response = await requestAddSupplier(supplierData);
            console.log('Add supplier response:', response);

            message.success('Thêm nhà cung cấp thành công');
            form.resetFields();
            setActiveComponent('suppliers');
        } catch (error) {
            console.error('Error during supplier creation:', error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Có lỗi xảy ra: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setActiveComponent('suppliers'); // Quay lại trang quản lý nhà cung cấp
    };

    return (
        <div className="supplier-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '24px',
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: '16px'
            }}>
                <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={handleBack}
                    style={{ marginRight: '16px' }}
                >
                    Quay lại
                </Button>
                <Title level={3} style={{ margin: 0 }}>Thêm Nhà Cung Cấp Mới</Title>
            </div>

            <Card 
                bordered={false} 
                style={{ 
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
                    borderRadius: '8px'
                }}
                loading={loading}
            >
                <Divider style={{ fontSize: '16px', fontWeight: 500, marginTop: 0 }}>
                    <ShopOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    Thông tin nhà cung cấp
                </Divider>
                
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={onFinish} 
                    autoComplete="off"
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                >
                    <div style={{ 
                        padding: '20px', 
                        border: '1px solid #f0f0f0', 
                        borderRadius: '8px', 
                        backgroundColor: '#fafafa',
                        marginBottom: '24px'
                    }}>
                        <Form.Item
                            name="name"
                            label={
                                <Space>
                                    <ShopOutlined style={{ color: '#1890ff' }} />
                                    <span>Tên nhà cung cấp</span>
                                </Space>
                            }
                            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
                        >
                            <Input placeholder="Nhập tên nhà cung cấp" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label={
                                <Space>
                                    <MailOutlined style={{ color: '#1890ff' }} />
                                    <span>Email</span>
                                </Space>
                            }
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input placeholder="Nhập email" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label={
                                <Space>
                                    <PhoneOutlined style={{ color: '#1890ff' }} />
                                    <span>Số điện thoại</span>
                                </Space>
                            }
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label={
                                <Space>
                                    <HomeOutlined style={{ color: '#1890ff' }} />
                                    <span>Địa chỉ</span>
                                </Space>
                            }
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                        >
                            <Input placeholder="Nhập địa chỉ" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label={
                                <Space>
                                    <FileTextOutlined style={{ color: '#1890ff' }} />
                                    <span>Mô tả</span>
                                </Space>
                            }
                        >
                            <TextArea 
                                rows={4} 
                                placeholder="Nhập mô tả về nhà cung cấp (không bắt buộc)" 
                                size="large" 
                            />
                        </Form.Item>

                        <Form.Item
                            name="isActive"
                            label={
                                <Space>
                                    <CheckCircleOutlined style={{ color: '#1890ff' }} />
                                    <span>Trạng thái</span>
                                </Space>
                            }
                            valuePropName="checked"
                            initialValue={true}
                        >
                            <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng hoạt động" />
                        </Form.Item>
                    </div>

                    <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Space size="large">
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                size="large"
                                style={{ 
                                    minWidth: '160px', 
                                    height: '45px',
                                    fontSize: '16px'
                                }}
                            >
                                Thêm nhà cung cấp
                            </Button>
                            <Button 
                                onClick={handleBack}
                                size="large"
                                style={{ minWidth: '100px', height: '45px' }}
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddSupplier; 