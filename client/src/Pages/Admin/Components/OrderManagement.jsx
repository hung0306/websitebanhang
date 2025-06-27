import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Input, Tag, Select, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { message } from 'antd';
import { requestGetOrderAdmin, requestUpdateStatusOrder, requestGetOnePayment } from '../../../Config/request';
import ModalDetailOrder from './ModalDetailOrder';
import OrderStatusFilter from './OrderStatusFilter';
import * as XLSX from 'xlsx';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState('');

    const statusOptions = [
        { label: 'Chờ xác nhận', value: 'pending' },
        { label: 'Đã xác nhận', value: 'completed' },
        { label: 'Đang giao', value: 'shipping' },
        { label: 'Đã giao', value: 'delivered' },
        { label: 'Đã hủy', value: 'cancelled' },
    ];

    const handleShowModal = (order) => {
        setSelectedOrder(order.id);
        console.log(order);

        setIsModalVisible(true);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setLoading(true);
            await requestUpdateStatusOrder({ orderId, statusOrder: newStatus });
            message.success('Cập nhật trạng thái thành công');
            await fetchOrders();
        } catch (error) {
            message.error('Cập nhật trạng thái thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (value) => {
        setSelectedStatus(value || 'all');
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    // Filter orders based on selected status and search text
    useEffect(() => {
        let result = [...orders];
        
        // Filter by status
        if (selectedStatus !== 'all') {
            result = result.filter(order => order.status === selectedStatus);
        }
        
        // Filter by search text (search in order ID, customer name, and phone)
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            result = result.filter(
                order => order.id.toLowerCase().includes(searchLower) || 
                         order.customer.toLowerCase().includes(searchLower) ||
                         order.phone.includes(searchText)
            );
        }
        
        setFilteredOrders(result);
    }, [orders, selectedStatus, searchText]);

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            width: 220,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
        },
        {
            title: 'Phương thức',
            dataIndex: 'typePayments',
            key: 'typePayments',
            render: (type) => <Tag color={type === 'COD' ? 'green' : type === 'MOMO' ? 'pink' : 'blue'}>{type}</Tag>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Select
                    value={status}
                    style={{ width: 150 }}
                    onChange={(value) => handleUpdateStatus(record.id, value)}
                    options={statusOptions}
                />
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => handleShowModal(record)} type="primary">
                        Chi tiết
                    </Button>
                    <Button onClick={() => handleExportOrder(record.id)} type="default">
                        Xuất đơn
                    </Button>
                </Space>
            ),
        },
    ];

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await requestGetOrderAdmin();
            if (response.metadata) {
                const formattedOrders = response.metadata.map((order) => ({
                    key: order.orderId,
                    id: order.orderId,
                    customer: order.fullName,
                    phone: `0${order.phone}`,
                    address: order.address,
                    date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
                    total: `${order.totalPrice?.toLocaleString() || 0} VNĐ`,
                    status: order.statusOrder,
                    typePayments: order.typePayments,
                    products: order.products,
                }));
                setOrders(formattedOrders);
                setFilteredOrders(formattedOrders);
            }
        } catch (error) {
            message.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Export orders to Excel
    const handleExportExcel = () => {
        const exportData = filteredOrders.map(order => ({
            'Mã đơn hàng': order.id,
            'Khách hàng': order.customer,
            'Số điện thoại': order.phone,
            'Ngày đặt': order.date,
            'Tổng tiền': order.total,
            'Phương thức': order.typePayments,
            'Trạng thái': order.status,
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
        XLSX.writeFile(workbook, 'danh_sach_don_hang.xlsx');
    };

    const handleExportOrder = async (orderId) => {
        try {
            const res = await requestGetOnePayment(orderId);
            const order = res.metadata;
            if (!order) return message.error('Không tìm thấy đơn hàng!');
            // Chuẩn bị dữ liệu xuất excel
            const info = order.findPayment;
            const products = order.dataProduct || [];
            const rows = [
                { 'Thông tin đơn hàng': '', '': '', 'Giá': '', 'Thành tiền': '' },
                { 'Thông tin đơn hàng': 'Mã đơn hàng', '': orderId, 'Giá': '', 'Thành tiền': '' },
                { 'Thông tin đơn hàng': 'Khách hàng', '': info?.fullName, 'Giá': '', 'Thành tiền': '' },
                { 'Thông tin đơn hàng': 'Số điện thoại', '': '0' + info?.phone, 'Giá': '', 'Thành tiền': '' },
                { 'Thông tin đơn hàng': 'Địa chỉ', '': info?.address, 'Giá': '', 'Thành tiền': '' },
                { 'Thông tin đơn hàng': 'Phương thức', '': order?.findPayment?.typePayments, 'Giá': '', 'Thành tiền': '' },
                { 'Thông tin đơn hàng': 'Trạng thái', '': order?.findPayment?.statusOrder, 'Giá': '', 'Thành tiền': '' },
                { 'Thông tin đơn hàng': 'Ngày đặt', '': new Date(order?.findPayment?.createdAt).toLocaleString('vi-VN'), 'Giá': '', 'Thành tiền': '' },
                { 'Thông tin đơn hàng': '', '': '', 'Giá': '', 'Thành tiền': '' },
                { 'Thông tin đơn hàng': 'Danh sách sản phẩm', '': '', 'Giá': '', 'Thành tiền': '' },
                { 'Thông tin đơn hàng': 'Tên sản phẩm', '': 'Số lượng', 'Giá': 'Giá', 'Thành tiền': 'Thành tiền' },
                ...products.map(item => ({
                    'Thông tin đơn hàng': item?.product?.name,
                    '': item?.quantity,
                    'Giá': (item?.product?.priceDiscount && item?.product?.priceDiscount > 0 ? item?.product?.priceDiscount : item?.product?.price)?.toLocaleString(),
                    'Thành tiền': (((item?.product?.priceDiscount && item?.product?.priceDiscount > 0 ? item?.product?.priceDiscount : item?.product?.price) * item?.quantity) || 0).toLocaleString()
                })),
                { 'Thông tin đơn hàng': '', '': '', 'Giá': '', 'Thành tiền': '' },
                { 'Thông tin đơn hàng': 'Tổng tiền', '': products.reduce((sum, item) => {
                    const price = (item?.product?.priceDiscount && item?.product?.priceDiscount > 0) ? item?.product?.priceDiscount : item?.product?.price;
                    return sum + price * item?.quantity;
                }, 0).toLocaleString() + ' đ', 'Giá': '', 'Thành tiền': '' }
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
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Order');
            XLSX.writeFile(workbook, `don_hang_${orderId}.xlsx`);
        } catch (error) {
            message.error('Xuất đơn thất bại!');
        }
    };

    return (
        <div>
            <Row style={{ marginBottom: 16 }}>
                <Col span={12}>
                    <h2>Quản lý đơn hàng</h2>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                    <Button onClick={handleExportExcel} type="primary" style={{ marginRight: 8 }}>
                        Xuất hóa đơn (Excel)
                    </Button>
                </Col>
            </Row>
            <Row style={{ marginBottom: 16 }} gutter={[16, 16]}>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <OrderStatusFilter 
                        onStatusChange={handleStatusChange} 
                        statusOptions={statusOptions} 
                    />
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12} style={{ textAlign: 'right' }}>
                    <Input 
                        placeholder="Tìm kiếm theo mã đơn, tên khách hàng, SĐT" 
                        prefix={<SearchOutlined />} 
                        style={{ width: 300 }}
                        onChange={(e) => handleSearch(e.target.value)}
                        allowClear
                    />
                </Col>
            </Row>
            <Table 
                columns={columns} 
                dataSource={filteredOrders} 
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
            />
            <ModalDetailOrder
                isModalVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
                selectedOrder={selectedOrder}
            />
        </div>
    );
};

export default OrderManagement;
