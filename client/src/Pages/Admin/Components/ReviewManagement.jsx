import React from 'react';
import { Table, Tag, Button, Rate } from 'antd';

const reviews = [
  {
    id: 1,
    product: 'MacBook Air M2',
    user: 'Nguyễn Văn A',
    rating: 5,
    comment: 'Sản phẩm rất tốt, giao hàng nhanh!',
    date: '2024-06-01',
    status: 'Hiển thị',
  },
  {
    id: 2,
    product: 'iPhone 15 Pro',
    user: 'Trần Thị B',
    rating: 4,
    comment: 'Hài lòng, nhưng pin hơi yếu.',
    date: '2024-06-02',
    status: 'Ẩn',
  },
  {
    id: 3,
    product: 'Apple Watch S9',
    user: 'Lê Văn C',
    rating: 3,
    comment: 'Tạm ổn, giao diện đẹp.',
    date: '2024-06-03',
    status: 'Hiển thị',
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
    title: 'Sản phẩm',
    dataIndex: 'product',
    key: 'product',
  },
  {
    title: 'Người đánh giá',
    dataIndex: 'user',
    key: 'user',
  },
  {
    title: 'Số sao',
    dataIndex: 'rating',
    key: 'rating',
    render: (rating) => <Rate disabled defaultValue={rating} />,
  },
  {
    title: 'Bình luận',
    dataIndex: 'comment',
    key: 'comment',
  },
  {
    title: 'Ngày',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={status === 'Hiển thị' ? 'green' : 'red'}>{status}</Tag>
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

const ReviewManagement = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Quản lý đánh giá</h2>
      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="id"
        pagination={false}
        bordered
      />
    </div>
  );
};

export default ReviewManagement; 