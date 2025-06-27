import React, { useEffect, useState, useContext } from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown, Space, Popover, List, Typography, Modal, Pagination, Button } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PlusOutlined,
    AppstoreOutlined,
    ShopOutlined,
    ImportOutlined,
    BellOutlined,
    SettingOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import Dashboard from './Components/Dashboard';
import ProductManagement from './Components/ProductManagement';
import UserManagement from './Components/UserManagement';
import AddProduct from './Pages/AddProduct';
import OrderManagement from './Components/OrderManagement';
import EditProduct from './Pages/EditProduct';
import CategoryManagement from './Components/CategoryManagement';
import AddCategory from './Pages/AddCategory';
import EditCategory from './Pages/EditCategory';
import SupplierManagement from './Components/SupplierManagement';
import AddSupplier from './Pages/AddSupplier';
import EditSupplier from './Pages/EditSupplier';
import ImportManagement from './Components/ImportManagement';
import AddImport from './Pages/AddImport';
import EditImport from './Pages/EditImport';
import PostManagement from './Components/PostManagement';
import CouponManagement from './Components/CouponManagement';
import ReviewManagement from './Components/ReviewManagement';
import { 
    requestAdmin, 
    requestLogout, 
    requestGetAdminNotifications, 
    requestMarkNotificationAsRead,
    requestMarkAllNotificationsAsRead,
    requestGetPaginatedNotifications
} from '../../Config/request';
import { useNavigate } from 'react-router-dom';
import Context from '../../store/Context';
import './styles/AdminHeader.css';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeComponent, setActiveComponent] = useState('dashboard');

    const [productId, setProductId] = useState();
    const [categoryId, setCategoryId] = useState();
    const [supplierId, setSupplierId] = useState();
    const [importId, setImportId] = useState();
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);
    const [paginatedNotifications, setPaginatedNotifications] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({
        total: 0,
        current: 1,
        pageSize: 10
    });
    const [paginatedLoading, setPaginatedLoading] = useState(false);
    
    // Get user data from Context
    const { dataUser, fetchAuth, resetUser } = useContext(Context);

    const menuItems = [
        {
            key: 'dashboard',
            icon: <HomeOutlined />,
            label: 'Trang chủ',
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Quản lý người dùng',
        },
        {
            key: 'orders',
            icon: <ShoppingCartOutlined />,
            label: 'Quản lý đơn hàng',
        },
        {
            key: 'products',
            icon: <PlusOutlined />,
            label: 'Quản lý sản phẩm',
        },
        {
            key: 'imports',
            icon: <ImportOutlined />,
            label: 'Quản lý nhập hàng',
        },
        {
            key: 'categories',
            icon: <AppstoreOutlined />,
            label: 'Quản lý danh mục',
        },
        {
            key: 'suppliers',
            icon: <ShopOutlined />,
            label: 'Quản lý nhà cung cấp',
        },
        {
            key: 'posts',
            icon: <AppstoreOutlined />,
            label: 'Quản lý bài viết',
        },
        {
            key: 'coupons',
            icon: <AppstoreOutlined />,
            label: 'Quản lý mã giảm giá',
        },
        {
            key: 'reviews',
            icon: <AppstoreOutlined />,
            label: 'Quản lý đánh giá',
        },
    ];

    const renderComponent = () => {
        switch (activeComponent) {
            case 'dashboard':
                return <Dashboard />;
            case 'products':
                return <ProductManagement setActiveComponent={setActiveComponent} setProductId={setProductId} />;
            case 'add-product':
                return <AddProduct setActiveComponent={setActiveComponent} />;
            case 'edit-product':
                return <EditProduct setActiveComponent={setActiveComponent} productId={productId} />;
            case 'users':
                return <UserManagement />;
            case 'orders':
                return <OrderManagement />;
            case 'categories':
                return <CategoryManagement setActiveComponent={setActiveComponent} setCategoryId={setCategoryId} />;
            case 'add-category':
                return <AddCategory setActiveComponent={setActiveComponent} />;
            case 'edit-category':
                return <EditCategory setActiveComponent={setActiveComponent} categoryId={categoryId} />;
            case 'suppliers':
                return <SupplierManagement setActiveComponent={setActiveComponent} setSupplierId={setSupplierId} />;
            case 'add-supplier':
                return <AddSupplier setActiveComponent={setActiveComponent} />;
            case 'edit-supplier':
                return <EditSupplier setActiveComponent={setActiveComponent} supplierId={supplierId} />;
            case 'imports':
                return <ImportManagement setActiveComponent={setActiveComponent} setImportId={setImportId} />;
            case 'add-import':
                return <AddImport setActiveComponent={setActiveComponent} />;
            case 'edit-import':
                return <EditImport setActiveComponent={setActiveComponent} importId={importId} />;
            case 'posts':
                return <PostManagement />;
            case 'coupons':
                return <CouponManagement />;
            case 'reviews':
                return <ReviewManagement />;
            default:
                return <Dashboard />;
        }
    };

    // Fetch notifications from API
    const fetchNotifications = async () => {
        try {
            setNotificationsLoading(true);
            const response = await requestGetAdminNotifications();
            setNotifications(response.metadata);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setNotificationsLoading(false);
        }
    };

    // Fetch paginated notifications
    const fetchPaginatedNotifications = async (page = 1, pageSize = 10) => {
        try {
            setPaginatedLoading(true);
            const response = await requestGetPaginatedNotifications(page, pageSize);
            setPaginatedNotifications(response.metadata.notifications);
            setPaginationInfo({
                total: response.metadata.pagination.total,
                current: response.metadata.pagination.page,
                pageSize: response.metadata.pagination.limit
            });
        } catch (error) {
            console.error('Error fetching paginated notifications:', error);
        } finally {
            setPaginatedLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Fetch notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = async (id) => {
        try {
            await requestMarkNotificationAsRead(id);
            // Update the local state instead of making another API call
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => 
                    notification._id === id ? { ...notification, read: true } : notification
                )
            );
            // Also update paginated notifications if modal is open
            setPaginatedNotifications(prevNotifications => 
                prevNotifications.map(notification => 
                    notification._id === id ? { ...notification, read: true } : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await requestMarkAllNotificationsAsRead();
            // Update all notifications to read in local state
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => ({ ...notification, read: true }))
            );
            // Also update paginated notifications if modal is open
            setPaginatedNotifications(prevNotifications => 
                prevNotifications.map(notification => ({ ...notification, read: true }))
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handlePaginationChange = (page, pageSize) => {
        fetchPaginatedNotifications(page, pageSize);
    };

    const handleOpenNotificationModal = () => {
        setNotificationModalVisible(true);
        fetchPaginatedNotifications(1, paginationInfo.pageSize);
    };

    const handleCloseNotificationModal = () => {
        setNotificationModalVisible(false);
    };

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await requestLogout();
            resetUser();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const unreadCount = notifications.filter(item => !item.read).length;

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) {
            return 'vừa xong';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} phút trước`;
        } else if (diffHours < 24) {
            return `${diffHours} giờ trước`;
        } else {
            return `${diffDays} ngày trước`;
        }
    };

    const notificationContent = (
        <div className="notification-popover">
            <div className="notification-header">
                <Typography.Title level={5} style={{ margin: 0 }}>Thông báo</Typography.Title>
                {unreadCount > 0 && (
                    <Typography.Text 
                        type="secondary" 
                        className="mark-all-read"
                        onClick={handleMarkAllAsRead}
                    >
                        Đánh dấu tất cả đã đọc
                    </Typography.Text>
                )}
            </div>
            <List
                loading={notificationsLoading}
                itemLayout="horizontal"
                dataSource={notifications}
                locale={{ emptyText: 'Không có thông báo nào' }}
                renderItem={item => (
                    <List.Item 
                        className={`notification-item ${!item.read ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(item._id)}
                    >
                        <List.Item.Meta
                            title={item.message}
                            description={formatRelativeTime(item.createdAt)}
                        />
                    </List.Item>
                )}
            />
            <div className="notification-footer">
                <Typography.Link onClick={handleOpenNotificationModal}>
                    Xem thông báo trước đó
                </Typography.Link>
            </div>
        </div>
    );

    // Notification modal
    const notificationModal = (
        <Modal
            title="Tất cả thông báo"
            open={notificationModalVisible}
            onCancel={handleCloseNotificationModal}
            footer={null}
            width={600}
        >
            <List
                loading={paginatedLoading}
                itemLayout="horizontal"
                dataSource={paginatedNotifications}
                locale={{ emptyText: 'Không có thông báo nào' }}
                renderItem={item => (
                    <List.Item 
                        className={`notification-item ${!item.read ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(item._id)}
                    >
                        <List.Item.Meta
                            title={item.message}
                            description={formatRelativeTime(item.createdAt)}
                        />
                    </List.Item>
                )}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                <Pagination
                    current={paginationInfo.current}
                    pageSize={paginationInfo.pageSize}
                    total={paginationInfo.total}
                    onChange={handlePaginationChange}
                    showSizeChanger={false}
                />
            </div>
            {unreadCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                    <Button type="primary" onClick={handleMarkAllAsRead}>
                        Đánh dấu tất cả đã đọc
                    </Button>
                </div>
            )}
        </Modal>
    );

    const userMenuItems = [
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt tài khoản',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
        },
    ];

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                await requestAdmin();
            } catch (error) {
                navigate('/');
            }
        };

        fetchAdmin();
    }, [navigate]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} width={280} style={{ paddingTop: '40px' }}>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['dashboard']}
                    items={menuItems}
                    onClick={({ key }) => setActiveComponent(key)}
                    style={{ fontSize: '16px' }}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="header-left">
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: 'trigger',
                            onClick: () => setCollapsed(!collapsed),
                            style: { fontSize: '18px', cursor: 'pointer' },
                        })}
                    </div>
                    <div className="header-right">
                        <Popover 
                            content={notificationContent} 
                            trigger="click" 
                            placement="bottomRight"
                            overlayClassName="notification-overlay"
                            arrow={false}
                        >
                            <Badge count={unreadCount} className="notification-badge">
                                <div className="icon-button">
                                    <BellOutlined className="header-icon" />
                                </div>
                            </Badge>
                        </Popover>
                        
                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                            <div className="admin-profile">
                                <span className="admin-name">{dataUser?.fullName || 'Admin'}</span>
                                <Avatar 
                                    size={40} 
                                    icon={<UserOutlined />} 
                                    src={dataUser?.avatar}
                                    className="admin-avatar"
                                />
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>{renderComponent()}</Content>
            </Layout>
            {notificationModal}
        </Layout>
    );
};

export default MainLayout;
