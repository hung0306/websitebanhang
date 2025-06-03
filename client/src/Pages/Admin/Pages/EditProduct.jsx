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
    QuestionCircleOutlined
} from '@ant-design/icons';
import { 
    requestEditProduct, 
    requestUploadImage, 
    requestGetProductById,
    requestGetCategories
} from '../../../Config/request';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const EditProduct = ({ setActiveComponent, productId }) => {
    const [form] = Form.useForm();
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [specifications, setSpecifications] = useState([]);

    useEffect(() => {
        fetchCategories();
        if (productId) {
            fetchProductData();
        }
    }, [productId]);

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

    const fetchProductData = async () => {
        try {
            setLoading(true);
            const response = await requestGetProductById(productId);
            const product = response.metadata;

            // Convert image URLs to Upload component format
            const imageFileList = product.images.map((url, index) => ({
                uid: `-${index}`,
                name: `image-${index}`,
                status: 'done',
                url: url,
            }));

            // Convert specifications Map to array for UI
            const specsArray = [];
            if (product.specifications) {
                // Check if specifications is a Map or object
                const specs = product.specifications instanceof Map 
                    ? product.specifications 
                    : product.specifications;
                
                // Handle both Map and plain object
                if (specs instanceof Map) {
                    specs.forEach((value, key) => {
                        specsArray.push({ key, value });
                    });
                } else {
                    Object.entries(specs).forEach(([key, value]) => {
                        specsArray.push({ key, value });
                    });
                }
            }
            setSpecifications(specsArray);

            form.setFieldsValue({
                name: product.name,
                price: product.price,
                priceDiscount: product.priceDiscount,
                description: product.description,
                stock: product.stock,
                categoryId: product.categoryId?._id || product.categoryId,
                isActive: product.isActive !== undefined ? product.isActive : true,
                image: imageFileList,
            });
            
            setImageFiles(imageFileList);
        } catch (error) {
            console.error('Error fetching product:', error);
            message.error('Không thể tải thông tin sản phẩm!');
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
            let imageUrls = [];

            // Chỉ lấy và upload các ảnh mới
            const newImages = values.image.filter((file) => file.originFileObj);
            if (newImages.length > 0) {
                const newImageUrls = await handleUpload(newImages);
                
                // Kết hợp ảnh mới và ảnh cũ (không có originFileObj)
                const oldImages = values.image
                    .filter((file) => !file.originFileObj)
                    .map((file) => file.url);
                
                imageUrls = [...oldImages, ...newImageUrls];
            } else {
                // Nếu không có ảnh mới, giữ lại ảnh cũ
                imageUrls = values.image.map((file) => file.url);
            }

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
                _id: productId,
                name: values.name,
                price: price,
                priceDiscount: priceDiscount,
                description: values.description,
                stock: form.getFieldValue('stock'),
                categoryId: values.categoryId,
                isActive: values.isActive !== undefined ? values.isActive : true,
                images: imageUrls,
                specifications: specsMap
            };

            // Gửi dữ liệu sản phẩm
            await requestEditProduct(productData);

            message.success('Cập nhật sản phẩm thành công');
            setActiveComponent('products');
        } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật sản phẩm!');
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

    return (
        <Card
            title={
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                        Quay lại
                    </Button>
                    <span>Chỉnh Sửa Sản Phẩm</span>
                </Space>
            }
            loading={loading}
        >
            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Tên sản phẩm"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                        >
                            <Input placeholder="Nhập tên sản phẩm" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="categoryId"
                            label="Danh mục"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                        >
                            <Select
                                placeholder="Chọn danh mục"
                                loading={loading}
                                showSearch
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
                            label="Giá gốc" 
                            rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                controls={false}
                                placeholder="Nhập giá gốc"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="priceDiscount"
                            label="Giá khuyến mãi"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                controls={false}
                                placeholder="Nhập giá khuyến mãi (nếu có)"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="stock"
                            label="Số lượng trong kho"
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                placeholder="Số lượng" 
                                min={0} 
                                disabled 
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="description"
                    label="Mô tả sản phẩm"
                >
                    <TextArea rows={4} placeholder="Nhập mô tả chi tiết về sản phẩm" />
                </Form.Item>

                <Form.Item
                    name="image"
                    label="Hình ảnh sản phẩm"
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
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                        </div>
                    </Upload>
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Trạng thái"
                    valuePropName="checked"
                    initialValue={true}
                >
                    <Switch checkedChildren="Đang bán" unCheckedChildren="Ngừng bán" />
                </Form.Item>

                <Divider orientation="left">
                    <Space>
                        Thông số kỹ thuật
                        <Tooltip title="Thêm các thông số kỹ thuật của sản phẩm như CPU, RAM, dung lượng pin, v.v.">
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </Space>
                </Divider>

                {renderSpecificationFields()}

                <Form.Item>
                    <Button 
                        type="dashed" 
                        onClick={addSpecification} 
                        style={{ width: '100%' }}
                        icon={<PlusOutlined />}
                    >
                        Thêm thông số kỹ thuật
                    </Button>
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Cập nhật sản phẩm
                        </Button>
                        <Button onClick={handleBack}>Hủy</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default EditProduct;
