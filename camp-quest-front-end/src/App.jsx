// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { Shop } from './pages/Shop/Shop';
import { Cart } from './pages/Cart/Cart';
import { Checkout } from './pages/Checkout/Checkout';
import { Payment } from './pages/Payment/Payment';
import { OrderConfirmation } from './pages/OrderConfirmation/OrderConfirmation';
import { OrderHistory } from './pages/OrderHistory/OrderHistory';
import { Rent } from './pages/Rent/Rent';
import { RentalPolicies } from './pages/RentalPolicies/RentalPolicies';
import { RentalList } from './pages/RentalList/RentalList';
import { RentalProvider } from './context/RentalContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import './index.css';

function App() {
  return (
    <RentalProvider>
      <CartProvider>
        <OrderProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/rent" element={<Rent />} />
              <Route path="/rental-policies" element={<RentalPolicies />} />
              <Route path="/rental-list" element={<RentalList />} />
            </Routes>
          </Router>
        </OrderProvider>
      </CartProvider>
    </RentalProvider>
  );
}

export default App;