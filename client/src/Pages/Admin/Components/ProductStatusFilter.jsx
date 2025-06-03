import React from 'react';
import { Radio } from 'antd';
import '../styles/ProductFilter.css';

const ProductStatusFilter = ({ onChange, value }) => {
  return (
    <div className="filter-section">
      <div className="filter-title">Trạng thái sản phẩm</div>
      <Radio.Group 
        onChange={(e) => onChange(e.target.value)} 
        value={value}
        className="filter-group"
      >
        <Radio value="all">Tất cả</Radio>
        <Radio value="active">Đang bán</Radio>
        <Radio value="inactive">Ngừng bán</Radio>
      </Radio.Group>
    </div>
  );
};

export default ProductStatusFilter; 