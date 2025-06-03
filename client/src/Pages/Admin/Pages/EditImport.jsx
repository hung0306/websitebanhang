import React, { useState, useEffect } from 'react';
import { Form, Button, Select, DatePicker, InputNumber, message, Card, Spin, Alert, Row, Col, Typography, Space, Divider } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, ShoppingOutlined, TeamOutlined, NumberOutlined, DollarOutlined } from '@ant-design/icons';
import { requestGetAllProduct, requestGetImportById, requestUpdateImport, requestGetSuppliers } from '../../../Config/request';
import moment from 'moment';

const { Title, Text } = Typography;

const EditImport = ({ setActiveComponent, importId }) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching import and product data...');
      
      // Fetch products for dropdown
      const productsResponse = await requestGetAllProduct();
      console.log('Products response:', productsResponse);
      
      if (productsResponse && productsResponse.metadata && Array.isArray(productsResponse.metadata)) {
        console.log(`Found ${productsResponse.metadata.length} products`);
        setProducts(productsResponse.metadata);
      } else {
        console.log('No products found or data not in expected format');
        console.log('Response structure:', JSON.stringify(productsResponse));
      }
      
      // Fetch suppliers
      const suppliersResponse = await requestGetSuppliers();
      if (suppliersResponse && suppliersResponse.metadata && Array.isArray(suppliersResponse.metadata)) {
        console.log(`Found ${suppliersResponse.metadata.length} suppliers`);
        setSuppliers(suppliersResponse.metadata);
      } else {
        console.log('No suppliers found or data not in expected format');
      }
      
      // Fetch import data
      if (importId) {
        console.log('Fetching import with ID:', importId);
        const importResponse = await requestGetImportById(importId);
        console.log('Import response:', importResponse);
        
        if (importResponse && importResponse.metadata) {
          const importData = importResponse.metadata;
          
          // Set form values
          form.setFieldsValue({
            product: importData.product._id,
            supplier: importData.supplier ? importData.supplier._id : undefined,
            quantity: importData.quantity,
            price: importData.price,
            importDate: moment(importData.importDate)
          });
        } else {
          setError('Không thể tải thông tin của phiếu nhập hàng này');
        }
      } else {
        console.warn('No importId provided');
        setError('Không có ID của phiếu nhập hàng');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Không thể tải dữ liệu: ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [importId, form]);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const formData = {
        ...values,
        importDate: values.importDate.toISOString()
      };

      const response = await requestUpdateImport(importId, formData);
      
      if (response.status === 'success') {
        message.success('Cập nhật nhập hàng thành công');
        setActiveComponent('imports');
      }
    } catch (error) {
      console.error('Error updating import:', error);
      message.error(`Có lỗi xảy ra khi cập nhật nhập hàng: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="import-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '24px',
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: '16px'
      }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => setActiveComponent('imports')}
          style={{ marginRight: '16px' }}
        >
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>Chỉnh sửa phiếu nhập hàng</Title>
      </div>

      {error && (
        <Alert
          message="Lỗi khi tải dữ liệu"
          description={
            <div>
              <p>{error}</p>
              <Button type="primary" onClick={handleRefresh} style={{ marginTop: '10px' }}>
                Thử lại
              </Button>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Card 
        bordered={false} 
        style={{ 
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
          borderRadius: '8px'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px', color: '#1890ff' }}>Đang tải thông tin phiếu nhập...</p>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Divider style={{ fontSize: '16px', fontWeight: 500, marginTop: 0 }}>
              <ShoppingOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              Thông tin phiếu nhập
            </Divider>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #f0f0f0', 
              borderRadius: '8px', 
              backgroundColor: '#fafafa',
              marginBottom: '24px'
            }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="product"
                    label={
                      <Space>
                        <ShoppingOutlined style={{ color: '#1890ff' }} />
                        <span>Sản phẩm</span>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
                  >
                    <Select
                      placeholder="Chọn sản phẩm"
                      showSearch
                      size="large"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {products.length > 0 ? (
                        products.map(product => (
                          <Select.Option key={product._id} value={product._id}>
                            {product.name}
                          </Select.Option>
                        ))
                      ) : (
                        <Select.Option value="no-products" disabled>
                          Không có sản phẩm
                        </Select.Option>
                      )}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="supplier"
                    label={
                      <Space>
                        <TeamOutlined style={{ color: '#1890ff' }} />
                        <span>Nhà cung cấp</span>
                      </Space>
                    }
                    rules={[{ required: false, message: 'Vui lòng chọn nhà cung cấp' }]}
                  >
                    <Select
                      placeholder="Chọn nhà cung cấp"
                      showSearch
                      size="large"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      allowClear
                    >
                      {suppliers.length > 0 ? (
                        suppliers.map(supplier => (
                          <Select.Option key={supplier._id} value={supplier._id}>
                            {supplier.name}
                          </Select.Option>
                        ))
                      ) : (
                        <Select.Option value="no-suppliers" disabled>
                          Không có nhà cung cấp
                        </Select.Option>
                      )}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="quantity"
                    label={
                      <Space>
                        <NumberOutlined style={{ color: '#1890ff' }} />
                        <span>Số lượng nhập</span>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      size="large"
                      placeholder="Nhập số lượng"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="price"
                    label={
                      <Space>
                        <DollarOutlined style={{ color: '#1890ff' }} />
                        <span>Giá nhập (VND)</span>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      size="large"
                      placeholder="Nhập giá"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="importDate"
                    label={
                      <Space>
                        <CalendarOutlined style={{ color: '#1890ff' }} />
                        <span>Ngày nhập</span>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Vui lòng chọn ngày nhập hàng' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%' }} 
                      format="DD/MM/YYYY"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                size="large"
                style={{ 
                  minWidth: '160px', 
                  height: '45px',
                  fontSize: '16px'
                }}
              >
                Cập nhật phiếu nhập
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default EditImport; 