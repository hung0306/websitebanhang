import classNames from 'classnames/bind';
import styles from './Cart.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import { Button, Table, Form, Input, InputNumber, Spin, Empty, message, Divider, Steps, Card, Checkbox } from 'antd';
import { useEffect, useState } from 'react';
import { requestDeleteCart, requestGetCart, requestPayment, requestUpdateInfoUserCart, requestUpdateCart } from '../../Config/request';
import { useNavigate, Link } from 'react-router-dom';
import { 
    DeleteOutlined, 
    MinusOutlined, 
    PlusOutlined, 
    ShoppingCartOutlined,
    HomeOutlined,
    CreditCardOutlined,
    DollarOutlined,
    WalletOutlined, 
    CheckOutlined,
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { useStore } from '../../hooks/useStore';

const cx = classNames.bind(styles);

function Cart() {
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [invalidInputs, setInvalidInputs] = useState({});
    const [selectedPayment, setSelectedPayment] = useState('COD');
    const navigate = useNavigate();
    const { dataUser } = useStore();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const fetchCart = async () => {
        try {
            setLoading(true);
        const res = await requestGetCart();
            console.log('Cart response:', res);
            
            if (res && res.metadata && res.metadata.newData) {
                setCart(res.metadata.newData.data || []);
                setTotalPrice(res.metadata.newData.totalPrice || 0);
                console.log('Cart data loaded:', res.metadata.newData.data);
                console.log('Total price from server:', res.metadata.newData.totalPrice);
            } else {
                setCart([]);
                setTotalPrice(0);
                console.error('Invalid cart data structure:', res);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            setCart([]);
            setTotalPrice(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Tự động điền thông tin user vào form thanh toán
    useEffect(() => {
        if (dataUser && dataUser.fullName) {
            form.setFieldsValue({
                fullName: dataUser.fullName || '',
                phone: dataUser.phone || '',
                address: dataUser.address || '',
            });
        }
    }, [dataUser, form]);

    // Calculate total price based on current cart items
    const recalculateTotal = (cartItems) => {
        console.log('Recalculating total for items:', cartItems);
        
        if (!cartItems || cartItems.length === 0) {
            console.log('No items in cart, total is 0');
            return 0;
        }
        
        const total = cartItems.reduce((sum, item) => {
            // Make sure we're using the correct price field
            const itemPrice = (item.priceDiscount && item.priceDiscount > 0) 
                ? Number(item.priceDiscount) 
                : Number(item.price);
                
            // Ensure quantity is a valid number
            const quantity = typeof item.quantity === 'number' ? item.quantity : 
                             item.quantity === '' ? 0 : Number(item.quantity) || 1;
                
            const itemTotal = itemPrice * quantity;
            
            console.log(`Item ${item.name || item._id}: price=${itemPrice}, quantity=${quantity}, subtotal=${itemTotal}`);
            
            return sum + itemTotal;
        }, 0);
        
        console.log('Calculated total price:', total);
        return total;
    };

    // Recalculate total whenever cart changes
    useEffect(() => {
        if (cart && cart.length > 0) {
            const filtered = cart.filter(item => selectedRowKeys.includes(item._id));
            const calculatedTotal = recalculateTotal(filtered.length > 0 ? filtered : cart);
            setTotalPrice(calculatedTotal);
        }
    }, [cart, selectedRowKeys]);

    const handleUpdateQuantity = async (productId, newQuantity, oldQuantity) => {
        // Handle empty, null or undefined values
        if (newQuantity === '' || newQuantity === null || newQuantity === undefined) {
            // Don't update if the value is empty (still being typed)
            return;
        }
        
        // Convert to number and ensure it's at least 1
        const validQuantity = Math.max(1, Number(newQuantity) || 1);
        
        // Check if quantity exceeds stock
        const productItem = cart.find(item => item._id === productId);
        const maxStock = productItem?.stock || 99;
        
        if (validQuantity > maxStock) {
            message.warning(`Số lượng tối đa có thể mua là ${maxStock} sản phẩm`);
            // Mark this input as invalid
            setInvalidInputs(prev => ({ ...prev, [productId]: true }));
            // Clear the invalid status after animation completes
            setTimeout(() => {
                setInvalidInputs(prev => ({ ...prev, [productId]: false }));
            }, 1000);
            
            // Set quantity to maximum available
            const updatedCart = cart.map(item => {
                if (item._id === productId) {
                    return { ...item, quantity: maxStock };
                }
                return item;
            });
            setCart(updatedCart);
            
            // Send update to server
            await requestUpdateCart({
                productId,
                quantity: maxStock
            });
            
            return;
        }
        
        // Don't update if no change in quantity
        if (validQuantity === oldQuantity) return;
        
        // Clear any invalid state for this input
        if (invalidInputs[productId]) {
            setInvalidInputs(prev => ({ ...prev, [productId]: false }));
        }
        
        try {
            // Update UI immediately for better user experience
            const updatedCart = cart.map(item => {
                if (item._id === productId) {
                    return { ...item, quantity: validQuantity };
                }
                return item;
            });
            
            setCart(updatedCart);
            
            // Send update to server in background
            await requestUpdateCart({
                productId,
                quantity: validQuantity
            });
            
            // No need to fetch the entire cart again
            // Only refresh if there was an error
        } catch (error) {
            console.error('Error updating cart:', error);
            message.error('Cập nhật số lượng thất bại');
            
            // If there was an error, refresh the cart to get the correct state
            fetchCart();
        }
    };

    const handleDelete = async (productId) => {
        try {
            // Optimistically update UI first
            const updatedCart = cart.filter(item => item._id !== productId);
            setCart(updatedCart);
            
            // Calculate and set new total price based on updated cart
            const newTotal = recalculateTotal(updatedCart);
            setTotalPrice(newTotal);
            
            // Then send delete request to server
            await requestDeleteCart(productId);
            message.success('Xóa sản phẩm thành công');
        } catch (error) {
            console.error('Error deleting item from cart:', error);
            message.error('Xóa sản phẩm thất bại');
            
            // If there's an error, fetch the cart again to ensure data consistency
            fetchCart();
        }
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            const data = {
                fullName: values.fullName,
                phone: values.phone,
                address: values.address,
            };

            await requestUpdateInfoUserCart(data);
            message.success('Đặt hàng thành công');
        } catch (error) {
            console.error('Error updating user info:', error);
            message.error('Cập nhật thông tin thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePayments = async (typePayment) => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            // Lọc sản phẩm đã chọn để đặt hàng
            const productsToOrder = selectedRowKeys.length > 0
                ? cart.filter(item => selectedRowKeys.includes(item._id))
                : cart;
            if (productsToOrder.length === 0) {
                message.warning('Vui lòng chọn sản phẩm để đặt hàng!');
                setSubmitting(false);
                return;
            }

            // Gửi thông tin user và danh sách sản phẩm đặt hàng lên server
            // (Nếu backend chưa hỗ trợ, chỉ gửi thông tin user như cũ)
            await handleSubmit(values);

            switch (typePayment) {
                case 'COD':
                    const codRes = await requestPayment(typePayment, productsToOrder);
                    navigate(`/payment/${codRes.metadata}`);
                    break;
                case 'MOMO':
                    const momoRes = await requestPayment(typePayment, productsToOrder);
                    window.open(momoRes.metadata.payUrl, '_blank');
                    break;
                case 'VNPAY':
                    const vnpayRes = await requestPayment(typePayment, productsToOrder);
                    window.open(vnpayRes.metadata, '_blank');
                    break;
                default:
                    message.error('Phương thức thanh toán không hợp lệ');
            }
        } catch (error) {
            if (error.errorFields) {
                message.error('Vui lòng điền đầy đủ thông tin thanh toán');
            } else {
                console.error('Payment error:', error);
                message.error('Có lỗi xảy ra khi thanh toán');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // New function to handle payment method selection
    const selectPaymentMethod = (method) => {
        setSelectedPayment(method);
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            render: (_, record) => (
                <div className={cx('product-info')}>
                    <div className={cx('product-image')}>
                        <img src={record.image} alt={record.name} />
                    </div>
                    <div className={cx('product-details')}>
                        <h4>{record.name}</h4>
                        <p className={cx('product-id')}>ID: {record.id}</p>
                    </div>
                </div>
            ),
            width: '40%',
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            align: 'center',
            render: (_, record) => (
                <div className={cx('price-container')}>
                    {record.priceDiscount && record.priceDiscount < record.originalPrice ? (
                        <>
                            <p className={cx('price-discount')}>{record.priceDiscount.toLocaleString()}₫</p>
                            <p className={cx('price-original')}>{record.originalPrice.toLocaleString()}₫</p>
                        </>
                    ) : (
                        <p className={cx('price-regular')}>{record.originalPrice.toLocaleString()}₫</p>
                    )}
                </div>
            ),
            width: '15%',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            render: (_, record) => (
                <div className={cx('quantity-control')}>
                    <Button 
                        icon={<MinusOutlined />} 
                        onClick={() => handleUpdateQuantity(record.id, record.quantity - 1, record.quantity)}
                        disabled={record.quantity <= 1}
                        className={cx('quantity-btn')}
                    />
                    <InputNumber
                        min={1}
                        max={record.stock || 99}
                        value={record.quantity}
                        onChange={(value) => handleUpdateQuantity(record.id, value, record.quantity)}
                        onBlur={() => {
                            // Ensure we have a valid value when focus is lost
                            if (!record.quantity || record.quantity < 1) {
                                handleUpdateQuantity(record.id, 1, record.quantity);
                            }
                        }}
                        controls={false} // Disable default up/down controls since we have custom buttons
                        className={cx('quantity-input', { 'invalid-input': invalidInputs[record.id] })}
                        parser={(value) => {
                            // Allow empty values during typing but strip non-numeric characters
                            if (value === '') return '';
                            return value.replace(/[^\d]/g, '');
                        }}
                    />
                    <Button 
                        icon={<PlusOutlined />} 
                        onClick={() => handleUpdateQuantity(record.id, record.quantity + 1, record.quantity)}
                        disabled={record.quantity >= (record.stock || 99)}
                        className={cx('quantity-btn')}
                    />
                </div>
            ),
            width: '15%',
        },
        {
            title: 'Thành tiền',
            dataIndex: 'subtotal',
            key: 'subtotal',
            align: 'center',
            render: (_, record) => (
                <span className={cx('subtotal')}>
                    {((record.priceDiscount || record.originalPrice) * (Number(record.quantity) || 0)).toLocaleString()}₫
                </span>
            ),
            width: '15%',
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Button 
                    onClick={() => handleDelete(record.id)} 
                    type="primary" 
                    danger
                    icon={<DeleteOutlined />}
                    className={cx('delete-btn')}
                >
                    Xóa
                </Button>
            ),
            width: '15%',
        },
    ];

    const dataSource = cart.map((item) => ({
        key: item._id,
        id: item._id,
        name: item.name,
        image: item.images?.[0] || '',
        originalPrice: item.price || 0,
        priceDiscount: item.priceDiscount || 0,
        quantity: item.quantity || 1,
        stock: item.stock || 99,
    }));

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                {/* Breadcrumb */}
                <div className={cx('breadcrumb-container')}>
                    <div className={cx('container')}>
                        <div className={cx('breadcrumb')}>
                            <Link to="/">
                                <HomeOutlined /> Trang chủ
                            </Link>
                            <span className={cx('breadcrumb-separator')}>/</span>
                            <span className={cx('breadcrumb-current')}>
                                <ShoppingCartOutlined /> Giỏ hàng
                            </span>
                        </div>
                    </div>
                </div>

                {/* Page title */}
                <div className={cx('page-title-container')}>
                    <div className={cx('container')}>
                        <h1 className={cx('page-title')}>
                            <ShoppingCartOutlined /> Giỏ hàng của bạn
                            {!loading && cart.length > 0 && (
                                <span className={cx('item-count')}>({cart.length} sản phẩm)</span>
                            )}
                        </h1>
                    </div>
                </div>

                {/* Checkout steps */}
                <div className={cx('steps-container')}>
                    <div className={cx('container')}>
                        <Steps
                            className={cx('checkout-steps')}
                            current={0}
                            items={[
                                {
                                    title: 'Giỏ hàng',
                                    icon: <ShoppingCartOutlined />,
                                },
                                {
                                    title: 'Thông tin giao hàng',
                                    icon: <UserOutlined />,
                                },
                                {
                                    title: 'Thanh toán',
                                    icon: <CreditCardOutlined />,
                                },
                                {
                                    title: 'Hoàn tất',
                                    icon: <CheckOutlined />,
                                },
                            ]}
                        />
                    </div>
                </div>

                <div className={cx('container')}>
                    <div className={cx('cart-content-wrapper')}>
                        {/* Cart content */}
                        <div className={cx('cart-items-col')}>
                            {loading ? (
                                <Card className={cx('loading-container')}>
                                    <Spin size="large" />
                                    <p>Đang tải giỏ hàng...</p>
                                </Card>
                            ) : cart.length > 0 ? (
                                <div className={cx('cart-table-container')}>
                                    <Table 
                                        rowSelection={rowSelection}
                                        dataSource={dataSource} 
                                        columns={columns} 
                                        pagination={false}
                                        rowKey="id"
                                        className={cx('cart-table')}
                                    />
                                </div>
                            ) : (
                                <Card className={cx('empty-cart')}>
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="Giỏ hàng của bạn đang trống"
                                        className={cx('empty-cart-content')}
                                    >
                                        <Button 
                                            type="primary" 
                                            icon={<ShoppingCartOutlined />}
                                            onClick={() => navigate('/')}
                                            size="large"
                                            className={cx('continue-shopping-btn')}
                                        >
                                            Tiếp tục mua sắm
                                        </Button>
                                    </Empty>
                                </Card>
                            )}
                        </div>

                        {/* Order summary */}
                        {!loading && cart.length > 0 && (
                            <div className={cx('order-summary-col')}>
                                <Card className={cx('order-summary-card')} title="Tóm tắt đơn hàng">
                                    <div className={cx('summary-row')}>
                                        <span>Tạm tính ({cart.length} sản phẩm):</span>
                                        <span>{totalPrice.toLocaleString()}₫</span>
                                    </div>
                                    <div className={cx('summary-row')}>
                                        <span>Phí vận chuyển:</span>
                                        <span>0₫</span>
                                    </div>
                                    <div className={cx('summary-row')}>
                                        <span>Giảm giá:</span>
                                        <span>0₫</span>
                                    </div>
                                    <Divider />
                                    <div className={cx('summary-total')}>
                                        <span>Tổng tiền:</span>
                                        <span>{totalPrice.toLocaleString()}₫</span>
                                    </div>

                                    <div className={cx('coupon-section')}>
                                        <h4>Mã giảm giá</h4>
                                        <div className={cx('coupon-input')}>
                                            <Input placeholder="Nhập mã giảm giá" />
                                            <Button>Áp dụng</Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Checkout form */}
                    {!loading && cart.length > 0 && (
                        <div className={cx('checkout-section')}>
                            <Card className={cx('checkout-form')} title="Thông tin thanh toán">
                            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                                    <div className={cx('form-row')}>
                                <Form.Item
                                    label="Họ và tên"
                                    name="fullName"
                                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                                            className={cx('form-item')}
                                        >
                                            <Input 
                                                placeholder="Nhập họ và tên" 
                                                prefix={<UserOutlined className={cx('form-icon')} />}
                                                className={cx('form-input')}
                                            />
                                </Form.Item>

                                <Form.Item
                                    label="Số điện thoại"
                                    name="phone"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
                                    ]}
                                            className={cx('form-item')}
                                        >
                                            <Input 
                                                placeholder="Nhập số điện thoại" 
                                                prefix={<PhoneOutlined className={cx('form-icon')} />}
                                                className={cx('form-input')}
                                            />
                                </Form.Item>
                                    </div>

                                <Form.Item
                                    label="Địa chỉ"
                                    name="address"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                                        className={cx('form-item')}
                                    >
                                        <Input.TextArea 
                                            placeholder="Nhập địa chỉ đầy đủ" 
                                            rows={3} 
                                            className={cx('form-textarea')}
                                        />
                                </Form.Item>

                                    <h4 className={cx('payment-methods-title')}>
                                        <CreditCardOutlined /> Phương thức thanh toán
                                    </h4>
                                    
                                    <p className={cx('payment-methods-instruction')}>
                                        Chọn phương thức thanh toán và nhấn "Tiến hành thanh toán" để hoàn tất đơn hàng
                                    </p>
                                    
                                    <div className={cx('payment-methods')}>
                                        <div 
                                            className={cx('payment-method', { 'selected': selectedPayment === 'COD' })}
                                            onClick={() => selectPaymentMethod('COD')}
                                        >
                                            <div className={cx('payment-method-icon')}>
                                                <DollarOutlined />
                                            </div>
                                            <div className={cx('payment-method-info')}>
                                                <h4>Tiền mặt</h4>
                                                <p>Thanh toán khi nhận hàng (COD)</p>
                                            </div>
                                        </div>
                                        
                                        <div 
                                            className={cx('payment-method', { 'selected': selectedPayment === 'MOMO' })}
                                            onClick={() => selectPaymentMethod('MOMO')}
                                        >
                                            <div className={cx('payment-method-icon', 'momo')}>MoMo</div>
                                            <div className={cx('payment-method-info')}>
                                                <h4>Ví MoMo</h4>
                                                <p>Thanh toán qua ví điện tử MoMo</p>
                                            </div>
                                        </div>
                                        
                                        <div 
                                            className={cx('payment-method', { 'selected': selectedPayment === 'VNPAY' })}
                                            onClick={() => selectPaymentMethod('VNPAY')}
                                        >
                                            <div className={cx('payment-method-icon', 'vnpay')}>VN</div>
                                            <div className={cx('payment-method-info')}>
                                                <h4>VNPay</h4>
                                                <p>Thanh toán qua VNPay</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={cx('checkout-actions')}>
                                    <Button
                                            type="text"
                                            icon={<ShoppingCartOutlined />}
                                            onClick={() => navigate('/')}
                                            className={cx('back-to-shop')}
                                        >
                                            Tiếp tục mua sắm
                                    </Button>
                                        
                                    <Button
                                            type="primary"
                                            size="large"
                                            icon={<CheckOutlined />}
                                            loading={submitting}
                                            onClick={() => handlePayments(selectedPayment)}
                                            className={cx('proceed-checkout-btn')}
                                        >
                                            Tiến hành thanh toán
                                    </Button>
                                </div>
                            </Form>
                            </Card>
                        </div>
                    )}
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Cart;
