import React from 'react';
import { Radio } from 'antd';
import '../styles/ProductFilter.css';

const ProductStockFilter = ({ onChange, value }) => {
  return (
    <div className="filter-section">
      <div className="filter-title">Lọc theo tồn kho</div>
      <Radio.Group 
        onChange={(e) => onChange(e.target.value)} 
        value={value}
        className="filter-group"
      >
        <Radio value="all">Tất cả</Radio>
        <Radio value="inStock">Còn hàng</Radio>
        <Radio value="outOfStock">Hết hàng</Radio>
      </Radio.Group>
    </div>
  );
};

export default ProductStockFilter; 