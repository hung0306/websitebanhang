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
import { requestGetAdminStats } from '../../../Config/request';
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

    useEffect(() => {
        fetchStats();
        // Cập nhật dữ liệu mỗi 5 phút
        const interval = setInterval(() => fetchStats(), 5 * 60 * 1000);
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
            </Row>
        </div>
    );
};

export default Dashboard;
