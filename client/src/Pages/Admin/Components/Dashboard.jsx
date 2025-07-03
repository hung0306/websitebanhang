import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Select, DatePicker, Space } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, SyncOutlined } from '@ant-design/icons';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
} from 'chart.js';
import axios from 'axios';
import { requestGetAdminStats, requestGetProductStats } from '../../../Config/request';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

// Đăng ký các components cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        newOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        todayRevenue: 0,
        revenue: [],
        recentOrders: [],
    });
    const [productStats, setProductStats] = useState({
        bestSellingProducts: [],
        highStockProducts: [],
        lowStockProducts: [],
        outOfStockProducts: [],
        totalProducts: 0,
        totalOutOfStock: 0,
        totalLowStock: 0
    });
    const [filterType, setFilterType] = useState('week');
    const [filterYear, setFilterYear] = useState(dayjs().year());
    const [filterMonth, setFilterMonth] = useState(dayjs().month() + 1);
    const navigate = useNavigate();

    const fetchStats = async (type = filterType, year = filterYear, month = filterMonth) => {
            try {
            let params = { type };
            if (type === 'year') params.year = year;
            if (type === 'month') { params.year = year; params.month = month; }
            const response = await requestGetAdminStats(params);
                setStats(response.metadata);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

    const fetchProductStats = async () => {
        try {
            const response = await requestGetProductStats();
            setProductStats(response.metadata);
        } catch (error) {
            console.error('Error fetching product stats:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchProductStats();
        // Cập nhật dữ liệu mỗi 5 phút
        const interval = setInterval(() => {
            fetchStats();
            fetchProductStats();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [filterType, filterYear, filterMonth]);

    // Data cho biểu đồ doanh thu (Bar chart)
    const revenueBarData = {
        labels: stats.revenue.map((item) => item.label),
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: stats.revenue.map((item) => item.total),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 2,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
            },
        ],
    };
    // Data cho biểu đồ số đơn hàng (Line chart)
    const orderLineData = {
        labels: stats.revenue.map((item) => item.label),
        datasets: [
            {
                label: 'Số đơn hàng',
                data: stats.revenue.map((item) => item.orderCount),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 3,
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
                pointRadius: 5,
                tension: 0.3,
                fill: false,
            },
        ],
    };

    // Data cho biểu đồ cột sản phẩm bán chạy
    const bestSellingBarData = {
        labels: productStats.bestSellingProducts.map((product) => product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name),
        datasets: [
            {
                label: 'Số lượng đã bán',
                data: productStats.bestSellingProducts.map((product) => product.totalQuantity),
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(67, 233, 123, 0.8)',
                    'rgba(250, 112, 154, 0.8)',
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(240, 147, 251, 1)',
                    'rgba(79, 172, 254, 1)',
                    'rgba(67, 233, 123, 1)',
                    'rgba(250, 112, 154, 1)',
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.8,
            },
        ],
    };

    // Data cho biểu đồ cột sản phẩm tồn kho
    const highStockBarData = {
        labels: productStats.highStockProducts.map((product) => product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name),
        datasets: [
            {
                label: 'Số lượng tồn kho',
                data: productStats.highStockProducts.map((product) => product.stock),
                backgroundColor: [
                    'rgba(168, 237, 234, 0.8)',
                    'rgba(255, 236, 210, 0.8)',
                    'rgba(255, 154, 158, 0.8)',
                    'rgba(161, 140, 209, 0.8)',
                    'rgba(250, 208, 196, 0.8)',
                ],
                borderColor: [
                    'rgba(168, 237, 234, 1)',
                    'rgba(255, 236, 210, 1)',
                    'rgba(255, 154, 158, 1)',
                    'rgba(161, 140, 209, 1)',
                    'rgba(250, 208, 196, 1)',
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.8,
            },
        ],
    };

    const revenueBarOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text:
                    filterType === 'year'
                        ? `Biểu đồ doanh thu năm ${filterYear}`
                        : filterType === 'month'
                        ? `Biểu đồ doanh thu tháng ${filterMonth}/${filterYear}`
                        : 'Biểu đồ doanh thu 7 ngày gần nhất',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} VNĐ`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Doanh thu (VNĐ)' },
                ticks: {
                    callback: function(value) { return value.toLocaleString(); }
                }
            }
        }
    };
    const orderLineOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text:
                    filterType === 'year'
                        ? `Biểu đồ số đơn hàng năm ${filterYear}`
                        : filterType === 'month'
                        ? `Biểu đồ số đơn hàng tháng ${filterMonth}/${filterYear}`
                        : 'Biểu đồ số đơn hàng 7 ngày gần nhất',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Số đơn hàng' },
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    // Options cho biểu đồ cột sản phẩm bán chạy
    const bestSellingBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Top 5 Sản phẩm bán chạy nhất',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#333'
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#667eea',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                    title: function(context) {
                        const product = productStats.bestSellingProducts[context[0].dataIndex];
                        return product?.name || 'Sản phẩm';
                    },
                    label: function(context) {
                        const product = productStats.bestSellingProducts[context.dataIndex];
                        return [
                            `Số lượng bán: ${context.parsed.y} sản phẩm`,
                            `Doanh thu: ${product?.totalRevenue?.toLocaleString()} VNĐ`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12
                    },
                    callback: function(value) {
                        return value.toLocaleString();
                    }
                },
                title: {
                    display: true,
                    text: 'Số lượng đã bán',
                    color: '#666',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            }
        }
    };

    // Options cho biểu đồ cột sản phẩm tồn kho
    const highStockBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                display: false
            },
            title: {
                display: true,
                text: 'Top 5 Sản phẩm tồn kho nhiều nhất',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#333'
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#a8edea',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                    title: function(context) {
                        const product = productStats.highStockProducts[context[0].dataIndex];
                        return product?.name || 'Sản phẩm';
                    },
                    label: function(context) {
                        const product = productStats.highStockProducts[context.dataIndex];
                        return [
                            `Tồn kho: ${context.parsed.y} sản phẩm`,
                            `Giá: ${product?.priceDiscount > 0 ? product.priceDiscount : product.price} VNĐ`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12
                    },
                    callback: function(value) {
                        return value.toLocaleString();
                    }
                },
                title: {
                    display: true,
                    text: 'Số lượng tồn kho',
                    color: '#666',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            }
        }
    };

    // Tính tổng doanh thu theo khoảng lọc
    const totalRevenue = stats.revenue.reduce((sum, item) => sum + (item.total || 0), 0);
    let revenueTitle = 'Doanh thu hôm nay';
    if (filterType === 'week') revenueTitle = 'Tổng doanh thu tuần';
    if (filterType === 'month') revenueTitle = 'Tổng doanh thu tháng';
    if (filterType === 'year') revenueTitle = 'Tổng doanh thu năm';

    return (
        <div className="p-4">
            <div style={{ marginBottom: 16 }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ padding: '8px 16px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}
                >
                    Quay về trang người dùng
                </button>
            </div>
            <h2 className="text-2xl font-bold mb-6">Tổng quan</h2>
            <Space style={{ marginBottom: 16 }}>
                <Select
                    value={filterType}
                    onChange={setFilterType}
                    options={[
                        { label: '7 ngày gần nhất', value: 'week' },
                        { label: 'Theo tháng', value: 'month' },
                        { label: 'Theo năm', value: 'year' },
                    ]}
                />
                {(filterType === 'month' || filterType === 'year') && (
                    <DatePicker
                        picker="year"
                        value={dayjs(`${filterYear}`)}
                        onChange={d => setFilterYear(d.year())}
                        style={{ width: 120 }}
                    />
                )}
                {filterType === 'month' && (
                    <DatePicker
                        picker="month"
                        value={dayjs(`${filterYear}-${filterMonth}`)}
                        onChange={d => { setFilterMonth(d.month() + 1); setFilterYear(d.year()); }}
                        style={{ width: 120 }}
                    />
                )}
            </Space>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số người dùng"
                            value={stats.totalUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đơn hàng mới"
                            value={stats.newOrders}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đơn đang giao"
                            value={stats.processingOrders}
                            prefix={<SyncOutlined spin />}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={revenueTitle}
                            value={filterType === 'week' ? totalRevenue : filterType === 'month' ? totalRevenue : filterType === 'year' ? totalRevenue : stats.todayRevenue}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>

                {/* Biểu đồ doanh thu và đơn hàng cạnh nhau */}
                <Col xs={24} md={12}>
                    <Card title="Thống kê doanh thu">
                        <Bar data={revenueBarData} options={revenueBarOptions} />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Thống kê số đơn hàng">
                        <Line data={orderLineData} options={orderLineOptions} />
                    </Card>
                </Col>

                {/* Thống kê sản phẩm */}
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng sản phẩm"
                            value={productStats.totalProducts}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Sản phẩm hết hàng"
                            value={productStats.totalOutOfStock}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Sản phẩm sắp hết"
                            value={productStats.totalLowStock}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Sản phẩm đang bán"
                            value={productStats.totalProducts - productStats.totalOutOfStock}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>

                {/* Biểu đồ cột sản phẩm bán chạy và tồn kho */}
                <Col xs={24} md={12}>
                    <Card 
                        title="Thống kê sản phẩm bán chạy"
                        style={{ height: '100%' }}
                        bodyStyle={{ padding: '20px' }}
                    >
                        {productStats.bestSellingProducts.length > 0 ? (
                            <div style={{ height: '400px', position: 'relative' }}>
                                <Bar data={bestSellingBarData} options={bestSellingBarOptions} />
                            </div>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '40px', 
                                color: '#999',
                                height: '400px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                Chưa có dữ liệu sản phẩm bán chạy
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card 
                        title="Thống kê sản phẩm tồn kho"
                        style={{ height: '100%' }}
                        bodyStyle={{ padding: '20px' }}
                    >
                        {productStats.highStockProducts.length > 0 ? (
                            <div style={{ height: '400px', position: 'relative' }}>
                                <Bar data={highStockBarData} options={highStockBarOptions} />
                            </div>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '40px', 
                                color: '#999',
                                height: '400px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                Chưa có dữ liệu sản phẩm tồn kho
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
