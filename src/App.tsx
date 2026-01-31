import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Products from './pages/dashboard/Products';
import ProductForm from './pages/dashboard/ProductForm';
import Orders from './pages/dashboard/Orders';
import Customers from './pages/dashboard/Customers';
import Coupons from './pages/dashboard/Coupons';
import Reports from './pages/dashboard/Reports';
import StoreSettings from './pages/dashboard/StoreSettings';
import Settings from './pages/dashboard/Settings';
import Categories from './pages/dashboard/Categories';
import Reviews from './pages/dashboard/Reviews';

// Super Admin Imports
import { SuperAdminProvider } from './contexts/SuperAdminContext';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminLogin from './pages/admin/SuperAdminLogin';
import SuperAdminOverview from './pages/admin/SuperAdminOverview';
import SuperAdminStores from './pages/admin/SuperAdminStores';
import SuperAdminUsers from './pages/admin/SuperAdminUsers';
import SuperAdminSettings from './pages/admin/SuperAdminSettings';

// Storefront Imports
import StoreLayout from './layouts/StoreLayout';
import StoreHome from './pages/store/StoreHome';
import ProductDetails from './pages/store/ProductDetails';
import Checkout from './pages/store/Checkout';
import OrderSuccess from './pages/store/OrderSuccess';
import OrderTracking from './pages/store/OrderTracking';

// Placeholder for other dashboard pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-[60vh] text-gray-400 flex-col gap-4">
    <div className="text-2xl font-bold">{title}</div>
    <p>Funcionalidade em desenvolvimento.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <SuperAdminProvider>
        <Routes>
          {/* Public Marketing Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Super Admin Routes */}
          <Route path="/admin/login" element={<SuperAdminLogin />} />
          <Route path="/admin/super" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminOverview />} />
            <Route path="stores" element={<SuperAdminStores />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="logs" element={<Placeholder title="Logs do Sistema" />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>

          {/* Storefront Routes (Public Store View) */}
          <Route path="/s/:slug" element={<StoreLayout />}>
            <Route index element={<StoreHome />} />
            <Route path="p/:productId" element={<ProductDetails />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="success" element={<OrderSuccess />} />
            <Route path="track" element={<OrderTracking />} />
          </Route>

          {/* Dashboard Routes (Protected) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="customers" element={<Customers />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="reports" element={<Reports />} />
            <Route path="store" element={<StoreSettings />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SuperAdminProvider>
    </BrowserRouter>
  );
}

export default App;
