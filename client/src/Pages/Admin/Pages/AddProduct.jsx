import React, { useState, useEffect } from 'react';
import { 
    Form, 
    Input, 
    InputNumber, 
    Upload, 
    Button, 
    Card, 
    message, 
    Space, 
    Select, 
    Switch,
    Divider,
    Typography,
    Row,
    Col,
    Tooltip
} from 'antd';
import { 
    UploadOutlined, 
    ArrowLeftOutlined, 
    PlusOutlined, 
    DeleteOutlined,
    QuestionCircleOutlined,
    ShoppingOutlined,
    TagOutlined,
    AppstoreOutlined,
    DollarOutlined,
    PercentageOutlined,
    InboxOutlined,
    FileTextOutlined,
    PictureOutlined,
    CheckCircleOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { 
    requestAddProduct, 
    requestUploadImage, 
    requestGetCategories 
} from '../../../Config/request';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const AddProduct = ({ setActiveComponent }) => {
    const [form] = Form.useForm();
    const [imageFiles, setImageFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [specifications, setSpecifications] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await requestGetCategories();
            setCategories(response.metadata);
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Không thể tải danh sách danh mục!');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (files) => {
        try {
            const formData = new FormData();

            // Thêm tất cả files vào formData
            files.forEach((file) => {
                formData.append('images', file.originFileObj);
            });

            const res = await requestUploadImage(formData);
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
            
            // Upload ảnh trước
            try {
                const imageUrls = await handleUpload(values.image);

                // Chuyển đổi mảng specifications thành đối tượng Map
                const specsMap = {};
                specifications.forEach(spec => {
                    if (spec.key && spec.value) {
                        specsMap[spec.key] = spec.value;
                    }
                });

                // Đảm bảo giá trị price và priceDiscount là số
                const price = Number(values.price);
                const priceDiscount = values.priceDiscount ? Number(values.priceDiscount) : 0;

                // Tạo dữ liệu sản phẩm với URLs ảnh
                const productData = {
                    name: values.name.trim(),
                    price: price,
                    priceDiscount: priceDiscount,
                    description: values.description,
                    stock: 0,
                    categoryId: values.categoryId,
                    isActive: values.isActive !== undefined ? values.isActive : true,
                    images: imageUrls,
                    specifications: specsMap
                };

                console.log('Sending product data:', productData);
                console.log('stock value type:', typeof productData.stock);

                // Gửi dữ liệu sản phẩm
                const response = await requestAddProduct(productData);
                console.log('Add product response:', response);

                message.success('Thêm sản phẩm thành công');
                form.resetFields();
                setImageFiles([]);
                setSpecifications([]);
                setActiveComponent('products');
            } catch (uploadError) {
                console.error('Error during product creation:', uploadError);
                if (uploadError.response?.data?.message) {
                    message.error(uploadError.response.data.message);
                } else {
                    message.error('Có lỗi xảy ra: ' + uploadError.message);
                }
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi thêm sản phẩm!');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setActiveComponent('products'); // Quay lại trang quản lý sản phẩm
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    // Thêm một thuộc tính mới
    const addSpecification = () => {
        setSpecifications([...specifications, { key: '', value: '' }]);
    };

    // Xóa một thuộc tính
    const removeSpecification = (index) => {
        const newSpecs = [...specifications];
        newSpecs.splice(index, 1);
        setSpecifications(newSpecs);
    };

    // Cập nhật key của thuộc tính
    const updateSpecKey = (index, key) => {
        const newSpecs = [...specifications];
        newSpecs[index].key = key;
        setSpecifications(newSpecs);
    };

    // Cập nhật value của thuộc tính
    const updateSpecValue = (index, value) => {
        const newSpecs = [...specifications];
        newSpecs[index].value = value;
        setSpecifications(newSpecs);
    };

    // Render các trường thuộc tính động
    const renderSpecificationFields = () => {
        return specifications.map((spec, index) => (
            <Row key={index} gutter={16} style={{ marginBottom: 16 }}>
                <Col span={10}>
                    <Input
                        placeholder="Tên thuộc tính (VD: CPU, RAM...)"
                        value={spec.key}
                        onChange={(e) => updateSpecKey(index, e.target.value)}
                    />
                </Col>
                <Col span={10}>
                    <Input
                        placeholder="Giá trị thuộc tính"
                        value={spec.value}
                        onChange={(e) => updateSpecValue(index, e.target.value)}
                    />
                </Col>
                <Col span={4}>
                    <Button
                        type="danger"
                        icon={<DeleteOutlined />}
                        onClick={() => removeSpecification(index)}
                    />
                </Col>
            </Row>
        ));
    };

    // Tạo danh sách danh mục phân cấp
    const renderCategoryOptions = (categories) => {
        return categories.map(category => {
            if (category.children && category.children.length > 0) {
                return (
                    <Option key={category._id} value={category._id}>
                        {category.name}
                        <Select.OptGroup>
                            {renderCategoryOptions(category.children)}
                        </Select.OptGroup>
                    </Option>
                );
            }
            return <Option key={category._id} value={category._id}>{category.name}</Option>;
        });
    };

    return (
        <div className="product-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                <Title level={3} style={{ margin: 0 }}>Thêm Sản Phẩm Mới</Title>
            </div>

            <Card
                bordered={false}
                style={{ 
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
                    borderRadius: '8px'
                }}
                loading={loading}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                    <Divider style={{ fontSize: '16px', fontWeight: 500, marginTop: 0 }}>
                        <ShoppingOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Thông tin cơ bản
                    </Divider>
                    
                    <div style={{ 
                        padding: '20px', 
                        border: '1px solid #f0f0f0', 
                        borderRadius: '8px', 
                        backgroundColor: '#fafafa',
                        marginBottom: '24px'
                    }}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label={
                                        <Space>
                                            <TagOutlined style={{ color: '#1890ff' }} />
                                            <span>Tên sản phẩm</span>
                                        </Space>
                                    }
                                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                                >
                                    <Input placeholder="Nhập tên sản phẩm" size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="categoryId"
                                    label={
                                        <Space>
                                            <AppstoreOutlined style={{ color: '#1890ff' }} />
                                            <span>Danh mục</span>
                                        </Space>
                                    }
                                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                                >
                                    <Select
                                        placeholder="Chọn danh mục"
                                        loading={loading}
                                        showSearch
                                        size="large"
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {categories.map(category => (
                                            <Option key={category._id} value={category._id}>{category.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item 
                                    name="price" 
                                    label={
                                        <Space>
                                            <DollarOutlined style={{ color: '#1890ff' }} />
                                            <span>Giá gốc</span>
                                        </Space>
                                    }
                                    rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        controls={false}
                                        placeholder="Nhập giá gốc"
                                        size="large"
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="priceDiscount"
                                    label={
                                        <Space>
                                            <PercentageOutlined style={{ color: '#1890ff' }} />
                                            <span>Giá khuyến mãi</span>
                                        </Space>
                                    }
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        controls={false}
                                        placeholder="Nhập giá khuyến mãi (nếu có)"
                                        size="large"
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="stock"
                                    label={
                                        <Space>
                                            <InboxOutlined style={{ color: '#1890ff' }} />
                                            <span>Số lượng trong kho</span>
                                        </Space>
                                    }
                                    initialValue={0}
                                >
                                    <InputNumber 
                                        style={{ width: '100%' }} 
                                        placeholder="Số lượng" 
                                        min={0} 
                                        value={0} 
                                        disabled
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="description"
                            label={
                                <Space>
                                    <FileTextOutlined style={{ color: '#1890ff' }} />
                                    <span>Mô tả sản phẩm</span>
                                </Space>
                            }
                        >
                            <TextArea rows={4} placeholder="Nhập mô tả chi tiết về sản phẩm" size="large" />
                        </Form.Item>
                    </div>

                    <Divider style={{ fontSize: '16px', fontWeight: 500 }}>
                        <PictureOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Hình ảnh sản phẩm
                    </Divider>

                    <div style={{ 
                        padding: '20px', 
                        border: '1px solid #f0f0f0', 
                        borderRadius: '8px', 
                        backgroundColor: '#fafafa',
                        marginBottom: '24px'
                    }}>
                        <Form.Item
                            name="image"
                            label={
                                <Space>
                                    <PictureOutlined style={{ color: '#1890ff' }} />
                                    <span>Hình ảnh sản phẩm</span>
                                </Space>
                            }
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh!' }]}
                            extra="Tải lên tối đa 10 ảnh. Mỗi ảnh không quá 2MB."
                        >
                            <Upload
                                name="images"
                                listType="picture-card"
                                multiple
                                maxCount={10}
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
                                    <UploadOutlined style={{ fontSize: '24px' }} />
                                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                </div>
                            </Upload>
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
                            <Switch checkedChildren="Đang bán" unCheckedChildren="Ngừng bán" />
                        </Form.Item>
                    </div>

                    <Divider style={{ fontSize: '16px', fontWeight: 500 }}>
                        <SettingOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Thông số kỹ thuật
                    </Divider>

                    <div style={{ 
                        padding: '20px', 
                        border: '1px solid #f0f0f0', 
                        borderRadius: '8px', 
                        backgroundColor: '#fafafa',
                        marginBottom: '24px'
                    }}>
                        {renderSpecificationFields()}

                        <Form.Item>
                            <Button 
                                type="dashed" 
                                onClick={addSpecification} 
                                style={{ width: '100%' }}
                                icon={<PlusOutlined />}
                                size="large"
                            >
                                Thêm thông số kỹ thuật
                            </Button>
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
                                Thêm sản phẩm
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

export default AddProduct;
