import React, { useEffect, useState } from 'react';
import { Form, Input, Upload, Button, Card, message, Space, Switch, Select } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { requestEditCategory, requestUploadCategoryImage, requestGetCategoryById, requestGetParentCategories } from '../../../Config/request';

const { TextArea } = Input;
const { Option } = Select;

const EditCategory = ({ setActiveComponent, categoryId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [parentCategories, setParentCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch parent categories first
                const parentResponse = await requestGetParentCategories(categoryId);
                setParentCategories(parentResponse.metadata);
                
                // Then fetch category data
                const categoryResponse = await requestGetCategoryById(categoryId);
                const category = categoryResponse.metadata;

                // Convert image URL to Upload component format if exists
                let imageFileList = [];
                if (category.image) {
                    imageFileList = [
                        {
                            uid: '-1',
                            name: 'image',
                            status: 'done',
                            url: category.image,
                        },
                    ];
                }

                form.setFieldsValue({
                    name: category.name,
                    description: category.description,
                    isActive: category.isActive,
                    image: imageFileList,
                    parentId: category.parentId ? category.parentId._id : null,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                message.error('Không thể tải thông tin danh mục!');
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchData();
        }
    }, [categoryId, form]);

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
            let imageUrl = null;

            // Kiểm tra xem có ảnh mới không
            const hasNewImage = values.image && values.image.some(file => file.originFileObj);
            
            if (hasNewImage) {
                // Upload ảnh mới
                imageUrl = await handleUpload(values.image[0]);
            } else if (values.image && values.image.length > 0) {
                // Giữ lại ảnh cũ
                imageUrl = values.image[0].url;
            }

            // Tạo dữ liệu danh mục
            const categoryData = {
                _id: categoryId,
                name: values.name,
                description: values.description,
                image: imageUrl,
                isActive: values.isActive,
                parentId: values.parentId || null,
            };

            // Gửi dữ liệu danh mục
            await requestEditCategory(categoryData);

            message.success('Cập nhật danh mục thành công');
            setActiveComponent('categories');
        } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật danh mục!');
            console.error(error);
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
        <Card
            title={
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                        Quay lại
                    </Button>
                    <span>Chỉnh Sửa Danh Mục</span>
                </Space>
            }
            loading={loading}
        >
            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                <Form.Item
                    name="name"
                    label="Tên danh mục"
                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                >
                    <Input placeholder="Nhập tên danh mục" />
                </Form.Item>

                <Form.Item name="parentId" label="Danh mục cha">
                    <Select
                        placeholder="Chọn danh mục cha (nếu có)"
                        allowClear
                        loading={loading}
                    >
                        {parentCategories.map(category => (
                            <Option key={category._id} value={category._id}>{category.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={4} placeholder="Nhập mô tả danh mục" />
                </Form.Item>

                <Form.Item
                    name="image"
                    label="Hình ảnh"
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
                        <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                        </div>
                    </Upload>
                </Form.Item>

                <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Cập nhật danh mục
                        </Button>
                        <Button onClick={handleBack}>Hủy</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default EditCategory; 