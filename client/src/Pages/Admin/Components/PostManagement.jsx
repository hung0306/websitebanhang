import React from 'react';
import { Table, Tag, Button } from 'antd';

const posts = [
  {
    id: 1,
    title: 'Giới thiệu sản phẩm mới',
    author: 'Admin',
    date: '2024-06-01',
    status: 'Đã đăng',
  },
  {
    id: 2,
    title: 'Khuyến mãi tháng 6',
    author: 'Nguyễn Văn A',
    date: '2024-06-02',
    status: 'Nháp',
  },
  {
    id: 3,
    title: 'Hướng dẫn sử dụng',
    author: 'Trần Thị B',
    date: '2024-06-03',
    status: 'Đã đăng',
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
    title: 'Tiêu đề',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Tác giả',
    dataIndex: 'author',
    key: 'author',
  },
  {
    title: 'Ngày đăng',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={status === 'Đã đăng' ? 'green' : 'orange'}>{status}</Tag>
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

const PostManagement = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Quản lý bài viết</h2>
      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        pagination={false}
        bordered
      />
    </div>
  );
};

export default PostManagement; 