import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { publicRoutes } from './Routes/index';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Provider } from './store/Provider';
import { CategoryProvider } from './context/CategoryContext';

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Đã xảy ra lỗi</h2>
          <p>Vui lòng tải lại trang hoặc quay lại sau.</p>
          <button onClick={() => window.location.reload()}>Tải lại trang</button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <Provider>
                <CategoryProvider>
                    <Router>
                        <Routes>
                            {publicRoutes.map((route, index) => {
                                return <Route key={index} path={route.path} element={route.component} />;
                            })}
                        </Routes>
                    </Router>
                </CategoryProvider>
            </Provider>
        </ErrorBoundary>
    </StrictMode>,
);
