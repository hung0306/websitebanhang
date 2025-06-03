import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber, message, Card, Alert, Space, Row, Col, Divider, Typography, Tag } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, MinusCircleOutlined, CalendarOutlined, ShoppingOutlined, TeamOutlined, NumberOutlined, DollarOutlined } from '@ant-design/icons';
import { requestGetAllProduct, requestAddImport, requestGetSuppliers } from '../../../Config/request';
import moment from 'moment';

const { Title, Text } = Typography;

const AddImport = ({ setActiveComponent }) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching products...');
      
      const response = await requestGetAllProduct();
      console.log('Products response:', response);
      
      if (response && response.metadata && Array.isArray(response.metadata)) {
        console.log(`Found ${response.metadata.length} products`);
        setProducts(response.metadata);
      } else {
        console.log('No products found or data not in expected format');
        console.log('Response structure:', JSON.stringify(response));
        setError('Dữ liệu sản phẩm không đúng định dạng hoặc không có sản phẩm nào');
      }
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      setError(`Không thể tải danh sách sản phẩm: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await requestGetSuppliers();
      if (response && response.metadata && Array.isArray(response.metadata)) {
        setSuppliers(response.metadata);
      } else {
        console.log('No suppliers found or data not in expected format');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      
      // Create an array of import records to send to the API
      const importPromises = values.importItems.map(item => {
        return requestAddImport({
          product: item.product,
          supplier: item.supplier,
          quantity: item.quantity,
          price: item.price,
          importDate: values.importDate.toISOString()
        });
      });
      
      // Wait for all import requests to complete
      const results = await Promise.all(importPromises);
      
      message.success(`Thêm ${values.importItems.length} mục nhập hàng thành công`);
      form.resetFields();
      setActiveComponent('imports');
    } catch (error) {
      console.error('Error adding imports:', error);
      message.error(`Có lỗi xảy ra khi thêm nhập hàng: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    fetchProducts();
    fetchSuppliers();
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
        <Title level={3} style={{ margin: 0 }}>Thêm phiếu nhập hàng mới</Title>
      </div>

      {error && (
        <Alert
          message="Lỗi khi tải danh sách sản phẩm"
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
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            importDate: moment(),
            importItems: [{ quantity: 1 }]
          }}
        >
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

          <Divider style={{ fontSize: '16px', fontWeight: 500 }}>
            <ShoppingOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Danh sách sản phẩm nhập hàng
          </Divider>

          <Form.List name="importItems">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ 
                    marginBottom: '24px',
                    padding: '16px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}>
                    <Row gutter={16}>
                      <Col span={7}>
                        <Form.Item
                          {...restField}
                          name={[name, 'product']}
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
                            loading={loading}
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
                      <Col span={7}>
                        <Form.Item
                          {...restField}
                          name={[name, 'supplier']}
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
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          label={
                            <Space>
                              <NumberOutlined style={{ color: '#1890ff' }} />
                              <span>Số lượng</span>
                            </Space>
                          }
                          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                        >
                          <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Số lượng"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'price']}
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
                            placeholder="Giá"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
                        {fields.length > 1 && (
                          <Button 
                            type="primary" 
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                            size="large"
                          />
                        )}
                      </Col>
                    </Row>
                    {fields.length > 1 && (
                      <Tag color="blue" style={{ marginTop: '8px' }}>Sản phẩm #{name + 1}</Tag>
                    )}
                  </div>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                    size="large"
                    style={{ height: '45px' }}
                  >
                    Thêm sản phẩm nhập
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

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
              Tạo phiếu nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddImport; 