import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Input, Tag, Typography, Tooltip } from 'antd';
import { 
    EditOutlined, 
    DeleteOutlined, 
    PlusOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { requestGetSuppliers, requestDeleteSupplier } from '../../../Config/request';

const { Search } = Input;
const { Text } = Typography;

const SupplierManagement = ({ setActiveComponent, setSupplierId }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await requestGetSuppliers();
            setSuppliers(response.metadata);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            message.error('Không thể tải danh sách nhà cung cấp!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleAddSupplier = () => {
        setActiveComponent('add-supplier');
    };

    const handleEditSupplier = (id) => {
        setSupplierId(id);
        setActiveComponent('edit-supplier');
    };

    const handleDeleteSupplier = async (id) => {
        try {
            await requestDeleteSupplier(id);
            message.success('Xóa nhà cung cấp thành công!');
            fetchSuppliers();
        } catch (error) {
            console.error('Error deleting supplier:', error);
            message.error('Không thể xóa nhà cung cấp: ' + (error.response?.data?.message || error.message));
        }
    };

    const columns = [
        {
            title: 'Tên nhà cung cấp',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => (
                <Space>
                    <MailOutlined />
                    <a href={`mailto:${email}`}>{email}</a>
                </Space>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => (
                <Space>
                    <PhoneOutlined />
                    <a href={`tel:${phone}`}>{phone}</a>
                </Space>
            ),
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: {
                showTitle: false,
            },
            render: (address) => (
                <Tooltip placement="topLeft" title={address}>
                    <Space>
                        <HomeOutlined />
                        <Text ellipsis style={{ maxWidth: 200 }}>{address}</Text>
                    </Space>
                </Tooltip>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            filters: [
                { text: 'Đang hoạt động', value: true },
                { text: 'Ngừng hoạt động', value: false },
            ],
            onFilter: (value, record) => record.isActive === value,
            render: (isActive) => (
                isActive ? 
                    <Tag color="green">Đang hoạt động</Tag> : 
                    <Tag color="red">Ngừng hoạt động</Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditSupplier(record._id)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa nhà cung cấp"
                        description="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
                        onConfirm={() => handleDeleteSupplier(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredSuppliers = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchText.toLowerCase()) ||
        supplier.phone.toLowerCase().includes(searchText.toLowerCase()) ||
        supplier.address.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddSupplier}
                >
                    Thêm nhà cung cấp
                </Button>
                <Search
                    placeholder="Tìm kiếm nhà cung cấp"
                    allowClear
                    style={{ width: 300 }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            <Table 
                columns={columns} 
                dataSource={filteredSuppliers.map(item => ({ ...item, key: item._id }))} 
                loading={loading}
                pagination={{ 
                    defaultPageSize: 10, 
                    showSizeChanger: true, 
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `Tổng ${total} nhà cung cấp` 
                }}
            />
        </div>
    );
};

export default SupplierManagement; 