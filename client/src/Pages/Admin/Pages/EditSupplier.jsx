import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Space, Switch } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { requestEditSupplier, requestGetSupplierById } from '../../../Config/request';

const { TextArea } = Input;

const EditSupplier = ({ setActiveComponent, supplierId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (supplierId) {
            fetchSupplierData();
        }
    }, [supplierId]);

    const fetchSupplierData = async () => {
        try {
            setLoading(true);
            const response = await requestGetSupplierById(supplierId);
            const supplier = response.metadata;

            form.setFieldsValue({
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                description: supplier.description,
                isActive: supplier.isActive !== undefined ? supplier.isActive : true,
            });
        } catch (error) {
            console.error('Error fetching supplier:', error);
            message.error('Không thể tải thông tin nhà cung cấp!');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            
            // Chuẩn bị dữ liệu nhà cung cấp
            const supplierData = {
                _id: supplierId,
                name: values.name.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
                address: values.address.trim(),
                description: values.description ? values.description.trim() : '',
                isActive: values.isActive !== undefined ? values.isActive : true,
            };

            // Gửi dữ liệu nhà cung cấp
            await requestEditSupplier(supplierData);

            message.success('Cập nhật nhà cung cấp thành công');
            setActiveComponent('suppliers');
        } catch (error) {
            console.error('Error during supplier update:', error);
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
        <Card
            title={
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                        Quay lại
                    </Button>
                    <span>Chỉnh Sửa Nhà Cung Cấp</span>
                </Space>
            }
            loading={loading}
        >
            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                <Form.Item
                    name="name"
                    label="Tên nhà cung cấp"
                    rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
                >
                    <Input placeholder="Nhập tên nhà cung cấp" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input placeholder="Nhập email" />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                    ]}
                >
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                    <Input placeholder="Nhập địa chỉ" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <TextArea rows={4} placeholder="Nhập mô tả về nhà cung cấp (không bắt buộc)" />
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Trạng thái"
                    valuePropName="checked"
                    initialValue={true}
                >
                    <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng hoạt động" />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Cập nhật nhà cung cấp
                        </Button>
                        <Button onClick={handleBack}>Hủy</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default EditSupplier; 