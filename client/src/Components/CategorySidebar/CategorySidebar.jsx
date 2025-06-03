import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CategorySidebar.module.scss';
import { requestGetCategories, requestGetProductsByCategory } from '../../Config/request';
import { 
    RightOutlined, 
    DownOutlined, 
    AppstoreOutlined, 
    LaptopOutlined, 
    MobileOutlined, 
    TabletOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';
import { useCategory } from '../../context/CategoryContext';

const cx = classNames.bind(styles);

// Function to get appropriate icon for category
const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('điện thoại') || name.includes('phone')) {
        return <MobileOutlined />;
    } else if (name.includes('laptop') || name.includes('máy tính')) {
        return <LaptopOutlined />;
    } else if (name.includes('tablet') || name.includes('ipad')) {
        return <TabletOutlined />;
    } else if (name.includes('phụ kiện') || name.includes('accessory')) {
        return <ThunderboltOutlined />;
    }
    return <AppstoreOutlined />;
};

function CategorySidebar() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState({});
    const { selectedCategory, setSelectedCategory } = useCategory();
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await requestGetCategories();
                if (response && response.metadata) {
                    // Organize categories into parent-child structure
                    const parentCategories = response.metadata.filter(cat => !cat.parentId);
                    const childCategories = response.metadata.filter(cat => cat.parentId);
                    
                    // Create a hierarchical structure
                    const categoriesWithChildren = parentCategories.map(parent => {
                        const children = childCategories.filter(
                            child => child.parentId && child.parentId._id === parent._id
                        );
                        return {
                            ...parent,
                            children: children
                        };
                    });
                    
                    setCategories(categoriesWithChildren);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCategories();
    }, []);

    const toggleCategory = (e, categoryId) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Stop event propagation
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const handleCategoryClick = async (e, category) => {
        if (!isHomePage) {
            // If not on homepage, allow normal navigation
            return;
        }
        
        e.preventDefault();
        setSelectedCategory(category);
    };

    if (loading) {
        return (
            <div className={cx('wrapper')}>
                <h3 className={cx('title')}>Danh mục</h3>
                <div className={cx('loading')}>
                    <div className={cx('loading-spinner')}></div>
                    <span>Đang tải danh mục...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <h3 className={cx('title')}>Danh mục</h3>
            <ul className={cx('category-list')}>
                {categories.map((category) => (
                    <li key={category._id} className={cx('category-item')}>
                        <div className={cx('parent-category')}>
                            {category.children && category.children.length > 0 ? (
                                <div 
                                    className={cx('category-link', { 
                                        'active': selectedCategory && selectedCategory._id === category._id,
                                        'expanded': expandedCategories[category._id]
                                    })}
                                    onClick={(e) => handleCategoryClick(e, category)}
                                >
                                    <div className={cx('category-icon-container')}>
                                        {category.image ? (
                                            <img 
                                                src={category.image} 
                                                alt={category.name} 
                                                className={cx('category-icon')}
                                            />
                                        ) : (
                                            <div className={cx('category-icon-default')}>
                                                {getCategoryIcon(category.name)}
                                            </div>
                                        )}
                                    </div>
                                    <span>{category.name}</span>
                                    <div 
                                        className={cx('toggle-icon')}
                                        onClick={(e) => toggleCategory(e, category._id)}
                                    >
                                        {expandedCategories[category._id] ? <DownOutlined /> : <RightOutlined />}
                                    </div>
                                </div>
                            ) : (
                                isHomePage ? (
                                    <div 
                                        className={cx('category-link', { 'active': selectedCategory && selectedCategory._id === category._id })}
                                        onClick={(e) => handleCategoryClick(e, category)}
                                    >
                                        <div className={cx('category-icon-container')}>
                                            {category.image ? (
                                                <img 
                                                    src={category.image} 
                                                    alt={category.name} 
                                                    className={cx('category-icon')}
                                                />
                                            ) : (
                                                <div className={cx('category-icon-default')}>
                                                    {getCategoryIcon(category.name)}
                                                </div>
                                            )}
                                        </div>
                                        <span>{category.name}</span>
                                    </div>
                                ) : (
                                    <Link to={`/category/${category.slug || category._id}`} className={cx('category-link')}>
                                        <div className={cx('category-icon-container')}>
                                            {category.image ? (
                                                <img 
                                                    src={category.image} 
                                                    alt={category.name} 
                                                    className={cx('category-icon')}
                                                />
                                            ) : (
                                                <div className={cx('category-icon-default')}>
                                                    {getCategoryIcon(category.name)}
                                                </div>
                                            )}
                                        </div>
                                        <span>{category.name}</span>
                                    </Link>
                                )
                            )}
                        </div>
                        
                        {category.children && category.children.length > 0 && (
                            <ul className={cx('subcategory-list', { 'expanded': expandedCategories[category._id] })}>
                                {category.children.map((child) => (
                                    <li key={child._id} className={cx('subcategory-item')}>
                                        {isHomePage ? (
                                            <div 
                                                className={cx('subcategory-link', { 'active': selectedCategory && selectedCategory._id === child._id })}
                                                onClick={(e) => handleCategoryClick(e, child)}
                                            >
                                                <span>{child.name}</span>
                                            </div>
                                        ) : (
                                            <Link to={`/category/${child.slug || child._id}`} className={cx('subcategory-link')}>
                                                <span>{child.name}</span>
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CategorySidebar; 