import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import { Provider } from "react-redux";
import { store } from "./store";
import Checkout from "./pages/Checkout";
import AuthProvider, { useAuth } from "./firebase/Auth";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import AdminPage from "./pages/AdminPage";
import CustomerOrders from "./pages/Orders";
import CategoryPage from "./pages/CategoryPage";
import ForgotPassword from "./pages/ForgotPassword";
import { AdminRoute } from './firebase/AdminRoute';
import CircularProgress from "@mui/material/CircularProgress";

// Regular ProtectedRoute for non-admin protected pages
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!user || !user.emailVerified) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/product/:productId" element={<ProductDetail />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected user routes */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <CustomerOrders />
          </ProtectedRoute>
        }
      />

      {/* Protected admin routes */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  );
}

export default App;