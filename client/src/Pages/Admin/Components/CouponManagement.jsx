import React from 'react';
import { Table, Tag, Button } from 'antd';

const coupons = [
  {
    id: 1,
    code: 'SALE20',
    description: 'Giảm 20% cho đơn từ 500K',
    discount: '20%',
    expiry: '2024-07-01',
    status: 'Còn hạn',
  },
  {
    id: 2,
    code: 'FREESHIP',
    description: 'Miễn phí vận chuyển',
    discount: '100K',
    expiry: '2024-06-15',
    status: 'Còn hạn',
  },
  {
    id: 3,
    code: 'SUMMER10',
    description: 'Giảm 10% cho tất cả đơn',
    discount: '10%',
    expiry: '2024-05-30',
    status: 'Hết hạn',
  },
];

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 60,
  },
  {
    title: 'Mã giảm giá',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Giá trị',
    dataIndex: 'discount',
    key: 'discount',
  },
  {
    title: 'Ngày hết hạn',
    dataIndex: 'expiry',
    key: 'expiry',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={status === 'Còn hạn' ? 'green' : 'red'}>{status}</Tag>
    ),
  },
  {
    title: 'Hành động',
    key: 'action',
    render: (_, record) => (
      <Button type="link" disabled>
        Sửa
      </Button>
    ),
  },
];

const CouponManagement = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Quản lý mã giảm giá</h2>
      <Table
        columns={columns}
        dataSource={coupons}
        rowKey="id"
        pagination={false}
        bordered
      />
    </div>
  );
};

export default CouponManagement; 