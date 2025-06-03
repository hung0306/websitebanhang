import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Input, Tag, Typography, Tooltip, Badge } from 'antd';
import { 
    EditOutlined, 
    DeleteOutlined, 
    PlusOutlined, 
    DownOutlined, 
    RightOutlined,
    FolderOutlined,
    FolderOpenOutlined,
    FileOutlined
} from '@ant-design/icons';
import { requestGetCategories, requestDeleteCategory } from '../../../Config/request';

const { Search } = Input;
const { Text } = Typography;

const CategoryManagement = ({ setActiveComponent, setCategoryId }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await requestGetCategories();
            const categoriesData = response.metadata;
            
            // Chuyển đổi danh sách phẳng thành cấu trúc cây
            const categoryMap = {};
            const rootCategories = [];
            
            // Tạo map để truy cập nhanh
            categoriesData.forEach(category => {
                categoryMap[category._id] = {
                    ...category,
                    key: category._id,
                    children: []
                };
            });
            
            // Xây dựng cấu trúc cây
            categoriesData.forEach(category => {
                const categoryWithChildren = categoryMap[category._id];
                
                if (category.parentId) {
                    // Nếu có parent, thêm vào danh sách con của parent
                    const parentCategory = categoryMap[category.parentId._id];
                    if (parentCategory) {
                        parentCategory.children.push(categoryWithChildren);
                    } else {
                        // Nếu không tìm thấy parent (hiếm khi xảy ra), thêm vào root
                        rootCategories.push(categoryWithChildren);
                    }
                } else {
                    // Nếu không có parent, đây là danh mục gốc
                    rootCategories.push(categoryWithChildren);
                }
            });
            
            // Loại bỏ mảng children rỗng để không hiển thị nút expand
            const cleanupEmptyChildren = (categories) => {
                categories.forEach(category => {
                    if (category.children.length === 0) {
                        delete category.children;
                    } else {
                        cleanupEmptyChildren(category.children);
                    }
                });
                return categories;
            };
            
            const processedCategories = cleanupEmptyChildren(rootCategories);
            
            // Mặc định không mở rộng danh mục nào
            setExpandedRowKeys([]);
            setCategories(processedCategories);
        } catch (error) {
            message.error('Không thể tải danh sách danh mục!');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEdit = (id) => {
        setCategoryId(id);
        setActiveComponent('edit-category');
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteCategory(id);
            message.success('Xóa danh mục thành công!');
            fetchCategories();
        } catch (error) {
            message.error('Không thể xóa danh mục!');
            console.error(error);
        }
    };

    const handleAddCategory = () => {
        setActiveComponent('add-category');
    };

    // Hàm tìm kiếm đệ quy trong cấu trúc cây
    const filterTreeData = (data, searchText) => {
        const filteredData = data.filter(item => 
            item.name.toLowerCase().includes(searchText.toLowerCase())
        );

        const expandedData = data.map(item => {
            if (item.children) {
                const filteredChildren = filterTreeData(item.children, searchText);
                if (filteredChildren.length > 0) {
                    return { ...item, children: filteredChildren };
                }
            }
            return null;
        }).filter(Boolean);

        return [...filteredData, ...expandedData];
    };

    const filteredCategories = searchText
        ? filterTreeData(categories, searchText)
        : categories;
        
    // Mở rộng danh mục khi tìm kiếm
    useEffect(() => {
        if (searchText) {
            const getAllKeys = (data) => {
                let keys = [];
                data.forEach(item => {
                    if (item.children) {
                        keys.push(item.key);
                        keys = [...keys, ...getAllKeys(item.children)];
                    }
                });
                return keys;
            };
            
            setExpandedRowKeys(getAllKeys(filteredCategories));
        }
    }, [searchText, filteredCategories]);

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    {record.children ? (
                        expandedRowKeys.includes(record.key) ? 
                        <FolderOpenOutlined style={{ color: '#1890ff' }} /> :
                        <FolderOutlined style={{ color: '#1890ff' }} />
                    ) : (
                        <FileOutlined style={{ color: '#52c41a' }} />
                    )}
                    <Text strong>{text}</Text>
                    {record.children && (
                        <Badge 
                            count={record.children.length} 
                            style={{ 
                                backgroundColor: '#52c41a', 
                                marginLeft: 8,
                                fontSize: '12px'
                            }}
                        />
                    )}
                </Space>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: {
                showTitle: false,
            },
            render: description => (
                <Tooltip placement="topLeft" title={description || 'Không có mô tả'}>
                    <Text ellipsis style={{ maxWidth: 300 }}>
                        {description || 'Không có mô tả'}
                    </Text>
                </Tooltip>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
            width: 150,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record._id)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa danh mục này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
            width: 200,
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddCategory}
                    >
                        Thêm danh mục mới
                    </Button>
                </Space>
                <Search
                    placeholder="Tìm kiếm danh mục"
                    allowClear
                    enterButton="Tìm kiếm"
                    size="large"
                    onSearch={(value) => setSearchText(value)}
                    onChange={(e) => {
                        if (!e.target.value) {
                            setExpandedRowKeys([]);
                        }
                        setSearchText(e.target.value);
                    }}
                    style={{ width: 300 }}
                />
            </div>
            <Table
                columns={columns}
                dataSource={filteredCategories}
                rowKey="_id"
                loading={loading}
                pagination={false}
                expandable={{
                    expandedRowKeys,
                    onExpandedRowsChange: setExpandedRowKeys,
                    expandIcon: ({ expanded, onExpand, record }) =>
                        record.children ? (
                            expanded ? (
                                <DownOutlined onClick={e => onExpand(record, e)} />
                            ) : (
                                <RightOutlined onClick={e => onExpand(record, e)} />
                            )
                        ) : null
                }}
            />
        </div>
    );
};

export default CategoryManagement; 