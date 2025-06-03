import React from 'react';
import { Select, Space, Typography } from 'antd';

const { Text } = Typography;

const OrderStatusFilter = ({ onStatusChange, statusOptions }) => {
    return (
        <Space>
            <Text strong>Lọc theo trạng thái:</Text>
            <Select
                placeholder="Chọn trạng thái"
                style={{ width: 180 }}
                allowClear
                onChange={onStatusChange}
                options={[
                    { label: 'Tất cả', value: 'all' },
                    ...statusOptions
                ]}
                defaultValue="all"
            />
        </Space>
    );
};

export default OrderStatusFilter; 