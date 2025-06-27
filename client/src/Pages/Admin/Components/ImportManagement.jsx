import React, { useState, useEffect } from 'react';
import { Button, Table, message, Tooltip, Space, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { requestGetAllImports, requestDeleteImport, requestGetImportById } from '../../../Config/request';
import moment from 'moment';
import * as XLSX from 'xlsx';

const ImportManagement = ({ setActiveComponent, setImportId }) => {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImports();
  }, []);

  const fetchImports = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching imports...');
      
      const response = await requestGetAllImports();
      console.log('Imports response:', response);
      
      if (response && response.metadata) {
        setImports(response.metadata);
        console.log(`Loaded ${response.metadata.length} imports`);
      } else {
        setError('Không thể tải danh sách nhập hàng hoặc định dạng dữ liệu không đúng');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching imports:', error);
      setError(`Không thể tải danh sách nhập hàng: ${error.message}`);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await requestDeleteImport(id);
      message.success('Xóa nhập hàng thành công');
      fetchImports();
    } catch (error) {
      console.error('Error deleting import:', error);
      message.error(`Không thể xóa nhập hàng: ${error.message}`);
    }
  };

  const handleEdit = (record) => {
    setImportId(record._id);
    setActiveComponent('edit-import');
  };

  const handleExportImport = async (importId) => {
    try {
      const res = await requestGetImportById(importId);
      const data = res.metadata;
      if (!data) return message.error('Không tìm thấy phiếu nhập!');
      const rows = [
        { 'Thông tin phiếu nhập': '', '': '', 'Giá nhập': '', 'Thành tiền': '' },
        { 'Thông tin phiếu nhập': 'Mã phiếu nhập', '': data._id, 'Giá nhập': '', 'Thành tiền': '' },
        { 'Thông tin phiếu nhập': 'Ngày nhập', '': moment(data.importDate).format('DD/MM/YYYY'), 'Giá nhập': '', 'Thành tiền': '' },
        { 'Thông tin phiếu nhập': 'Nhà cung cấp', '': data.supplier?.name || '', 'Giá nhập': '', 'Thành tiền': '' },
        { 'Thông tin phiếu nhập': '', '': '', 'Giá nhập': '', 'Thành tiền': '' },
        { 'Thông tin phiếu nhập': 'Sản phẩm', '': 'Số lượng', 'Giá nhập': 'Giá nhập', 'Thành tiền': 'Thành tiền' },
        { 'Thông tin phiếu nhập': data.product?.name, '': data.quantity, 'Giá nhập': data.price?.toLocaleString(), 'Thành tiền': (data.price * data.quantity)?.toLocaleString() },
        { 'Thông tin phiếu nhập': '', '': '', 'Giá nhập': '', 'Thành tiền': '' },
        { 'Thông tin phiếu nhập': 'Tổng tiền', '': (data.price * data.quantity)?.toLocaleString() + ' đ', 'Giá nhập': '', 'Thành tiền': '' }
      ];
      const worksheet = XLSX.utils.json_to_sheet(rows, { skipHeader: true });
      // Căn giữa toàn bộ cell
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_address = { c: C, r: R };
          const cell_ref = XLSX.utils.encode_cell(cell_address);
          if (!worksheet[cell_ref]) continue;
          if (!worksheet[cell_ref].s) worksheet[cell_ref].s = {};
          worksheet[cell_ref].s.alignment = { horizontal: 'center', vertical: 'center' };
        }
      }
      worksheet['!cols'] = [ { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 20 } ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Import');
      XLSX.writeFile(workbook, `phieu_nhap_${data._id}.xlsx`);
    } catch (error) {
      message.error('Xuất phiếu nhập thất bại!');
    }
  };

  const columns = [
    {
      title: 'STT',
      width: '5%',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'product',
      width: '20%',
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
      width: '15%',
      render: (supplierName) => supplierName || 'N/A',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '8%',
    },
    {
      title: 'Giá nhập (VND)',
      dataIndex: 'price',
      key: 'price',
      width: '12%',
      render: (price) => new Intl.NumberFormat('vi-VN').format(price),
    },
    {
      title: 'Tổng tiền (VND)',
      key: 'totalValue',
      width: '12%',
      render: (_, record) => new Intl.NumberFormat('vi-VN').format(record.quantity * record.price),
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'importDate',
      key: 'importDate',
      width: '15%',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.importDate).unix() - moment(b.importDate).unix(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '13%',
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
          <Tooltip title="Xuất phiếu nhập">
            <Button
              onClick={() => handleExportImport(record._id)}
            >
              Xuất phiếu
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Quản lý nhập hàng</h2>
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={fetchImports}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setActiveComponent('add-import')}
          >
            Thêm nhập hàng
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
          action={
            <Button size="small" type="primary" onClick={fetchImports}>
              Thử lại
            </Button>
          }
        />
      )}

      <Table
        columns={columns}
        dataSource={imports}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ImportManagement; 