import React, { useState, useEffect } from 'react';
import { Form, Input, Upload, Button, Card, message, Space, Switch, Select, Typography, Divider, Row, Col } from 'antd';
import { 
  UploadOutlined, 
  ArrowLeftOutlined, 
  TagsOutlined, 
  FileTextOutlined, 
  PictureOutlined,
  AppstoreOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { requestAddCategory, requestUploadCategoryImage, requestGetParentCategories } from '../../../Config/request';
import './styles/AdminForms.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const AddCategory = ({ setActiveComponent }) => {
    const [form] = Form.useForm();
    const [parentCategories, setParentCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchParentCategories();
    }, []);

    const fetchParentCategories = async () => {
        try {
            setLoading(true);
            const response = await requestGetParentCategories();
            setParentCategories(response.metadata);
        } catch (error) {
            console.error('Error fetching parent categories:', error);
            message.error('Không thể tải danh sách danh mục cha!');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file) => {
        try {
            // Kiểm tra kích thước file (giới hạn 2MB)
            if (file.originFileObj.size > 2 * 1024 * 1024) {
                message.error('Kích thước ảnh không được vượt quá 2MB!');
                throw new Error('File size exceeded');
            }

            // Kiểm tra loại file
            const isImage = file.originFileObj.type.startsWith('image/');
            if (!isImage) {
                message.error('Chỉ chấp nhận file ảnh!');
                throw new Error('Invalid file type');
            }

            const formData = new FormData();
            formData.append('image', file.originFileObj);

            const res = await requestUploadCategoryImage(formData);
            return res.metadata;
        } catch (error) {
            console.error('Upload failed:', error);
            message.error('Upload ảnh thất bại!');
            throw error;
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            let imageUrl = null;

            // Upload ảnh nếu có
            if (values.image && values.image.length > 0) {
                try {
                    imageUrl = await handleUpload(values.image[0]);
                    console.log('Image uploaded successfully:', imageUrl);
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    message.error('Lỗi khi tải ảnh lên: ' + (uploadError.response?.data?.message || uploadError.message));
                    setLoading(false);
                    return;
                }
            }

            // Tạo dữ liệu danh mục
            const categoryData = {
                name: values.name.trim(), // Trim name to prevent whitespace issues
                description: values.description,
                image: imageUrl,
                isActive: values.isActive,
                parentId: values.parentId || null,
            };

            console.log('Sending category data:', categoryData);

            // Gửi dữ liệu danh mục
            try {
                const response = await requestAddCategory(categoryData);
                console.log('Add category response:', response);
                
                message.success('Thêm danh mục thành công');
                form.resetFields();
                setActiveComponent('categories');
            } catch (error) {
                console.error('Error adding category:', error);
                if (error.response?.data?.message) {
                    message.error(error.response.data.message);
                } else {
                    message.error('Lỗi khi thêm danh mục: ' + error.message);
                }
            }
        } catch (error) {
            console.error('Error in form submission:', error);
            message.error('Có lỗi xảy ra khi xử lý biểu mẫu!');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setActiveComponent('categories');
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    return (
        <div className="admin-form-container">
            <div className="admin-form-header">
                <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={handleBack}
                    className="back-button"
                >
                    Quay lại
                </Button>
                <Title level={3} className="page-title">Thêm Danh Mục Mới</Title>
            </div>

            <Card
                bordered={false}
                className="admin-form-card"
            >
                <div className="section-header">
                    <AppstoreOutlined className="section-icon" />
                    <span className="section-title">Thông tin danh mục</span>
                </div>
                
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={onFinish} 
                    autoComplete="off" 
                    initialValues={{ isActive: true }}
                    className="admin-form"
                >
                    <div className="form-content-box">
                        <Row gutter={24}>
                            <Col xs={24} md={24}>
                                <Form.Item
                                    name="name"
                                    label={<FormLabel icon={<TagsOutlined />} text="Tên danh mục" />}
                                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                                >
                                    <Input placeholder="Nhập tên danh mục" size="large" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col xs={24} md={24}>
                                <Form.Item 
                                    name="parentId" 
                                    label={<FormLabel icon={<AppstoreOutlined />} text="Danh mục cha" />}
                                >
                                    <Select
                                        placeholder="Chọn danh mục cha (nếu có)"
                                        allowClear
                                        loading={loading}
                                        size="large"
                                    >
                                        {parentCategories.map(category => (
                                            <Option key={category._id} value={category._id}>{category.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col xs={24} md={24}>
                                <Form.Item 
                                    name="description" 
                                    label={<FormLabel icon={<FileTextOutlined />} text="Mô tả" />}
                                >
                                    <TextArea rows={4} placeholder="Nhập mô tả danh mục" size="large" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col xs={24} md={16}>
                                <Form.Item
                                    name="image"
                                    label={<FormLabel icon={<PictureOutlined />} text="Hình ảnh" />}
                                    valuePropName="fileList"
                                    getValueFromEvent={normFile}
                                    extra="Chỉ cho phép tải lên 1 ảnh. Định dạng: JPG, PNG. Kích thước tối đa: 2MB"
                                >
                                    <Upload
                                        name="image"
                                        listType="picture-card"
                                        maxCount={1}
                                        beforeUpload={(file) => {
                                            // Kiểm tra kích thước file
                                            if (file.size > 2 * 1024 * 1024) {
                                                message.error('Kích thước ảnh không được vượt quá 2MB!');
                                                return Upload.LIST_IGNORE;
                                            }
                                            // Kiểm tra định dạng file
                                            const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
                                            if (!isImage) {
                                                message.error('Chỉ chấp nhận file JPG/PNG!');
                                                return Upload.LIST_IGNORE;
                                            }
                                            return false; // Ngăn upload tự động
                                        }}
                                        accept="image/jpeg,image/png"
                                    >
                                        <div className="upload-button">
                                            <UploadOutlined className="upload-icon" />
                                            <div>Tải ảnh lên</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item 
                                    name="isActive" 
                                    label={<FormLabel icon={<CheckCircleOutlined />} text="Trạng thái" />}
                                    valuePropName="checked"
                                >
                                    <Switch 
                                        checkedChildren="Hoạt động" 
                                        unCheckedChildren="Không hoạt động" 
                                        className="status-switch"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    <div className="form-footer">
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            className="submit-button"
                        >
                            Thêm danh mục
                        </Button>
                        <Button 
                            onClick={handleBack}
                            size="large"
                            className="cancel-button"
                        >
                            Hủy
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

// Tạo component cho label form để tái sử dụng
const FormLabel = ({ icon, text }) => (
    <Space className="form-label">
        {React.cloneElement(icon, { className: 'form-label-icon' })}
        <span>{text}</span>
    </Space>
);

export default AddCategory; 