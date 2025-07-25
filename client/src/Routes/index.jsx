import App from '../App';
import LoginUser from '../Pages/LoginUser/LoginUser';
import RegisterUser from '../Pages/RegisterUser/RegisterUser';
import DetailProduct from '../Pages/DetailProduct/DetailProduct';
import Category from '../Pages/Category/Category';
import CategoryPage from '../Pages/CategoryPage/CategoryPage';
import CompareProduct from '../Pages/CompareProduct/CompareProduct';
import InfoUser from '../Pages/InfoUser/index';
import Cart from '../Pages/Cart/Cart';
import MainLayout from '../Pages/Admin/MainLayout';
import Payments from '../Pages/Payments/Payments';
import News from '../Pages/News/News';
import Promotions from '../Pages/Promotions/Promotions';
import About from '../Pages/About/About';
import Support from '../Pages/Support/Support';

const publicRoutes = [
    { path: '/', component: <App /> },
    { path: '/login', component: <LoginUser /> },
    { path: '/register', component: <RegisterUser /> },
    { path: '/product/:id', component: <DetailProduct /> },
    { path: '/category', component: <Category /> },
    { path: '/category/:identifier', component: <CategoryPage /> },
    { path: '/info-user/:id', component: <InfoUser /> },
    { path: '/cart', component: <Cart /> },
    { path: '/admin', component: <MainLayout /> },
    { path: '/payment/:id', component: <Payments /> },
    { path: '/compare-product/:id1/:id2', component: <CompareProduct /> },
    { path: '/news', component: <News /> },
    { path: '/promotions', component: <Promotions /> },
    { path: '/about', component: <About /> },
    { path: '/support', component: <Support /> },
];

export { publicRoutes };
