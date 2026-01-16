import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SupportPage from './pages/SupportPage';
import { AdminLayout } from './components/AdminLayout';
import Categories from './pages/Categories';
import SalesProducts from './pages/SalesProducts';
import RentalProducts from './pages/RentalProducts';
import Shop from './pages/Shop';
import Rent from './pages/Rent';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Success from './pages/Success';
import RentalOrders from './pages/RentalOrders';
import SalesOrders from './pages/SalesOrders';
import AdminSupportTickets from './components/AdminSupportTickets';
import AdminFeedback from './components/AdminFeedback';
import BlogPosts from './pages/BlogPosts';
import AdminBlogPosts from './components/AdminBlogPosts';
import UsersList from './components/UsersList';
import AboutUs from './pages/About';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyOTP from './pages/VerifyOTP';
import RefundPolicy from './pages/RefundPolicy';
import DeliveryPolicy from './pages/DeliveryPolicy';
import RentalTerms from './pages/RentalTerms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/rent" element={<Rent />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
        <Route path='/blog' element={<BlogPosts />} />
        <Route path='/about' element={<AboutUs />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-otp" element={<VerifyOTP />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/delivery-policy" element={<DeliveryPolicy />} />
        <Route path="/rental-terms" element={<RentalTerms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="reset-password" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="sales-products" element={<SalesProducts />} />
          <Route path="rental-products" element={<RentalProducts />} />
          <Route path="rental-orders" element={<RentalOrders />} />
          <Route path="sales-orders" element={<SalesOrders />} />
          <Route path="support-tickets" element={<AdminSupportTickets />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="blog-posts" element={<AdminBlogPosts />} />
          <Route path="users" element={<UsersList />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default App;