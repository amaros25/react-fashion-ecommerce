import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home/home.js";
import ProductPage from "./components/products/product_page.js";
import Login from "./components/login/login";
import Register from "./components/register/register";
import ProfileUser from "./components/profile_user/profile_user";
import ProfileSeller from "./components/profile_seller/profile_seller";
import SellerOrders from "./components/seller_order/seller_order";
import AddProduct from './components/new_product/add_product.js';
import CartPage from './components/cart/cart_page.js';
import MainChat from './components/chat/main_chat.js';
import InfoPage from './components/info_pages/InfoPage.js';

import { FilterProvider } from './components/filter_context/filter_context.js';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./i18n";

function App() {

  return (
    <FilterProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile_seller" element={<ProfileSeller />} />
          <Route path="/profile_user" element={<ProfileUser />} />
          <Route path="/add_product" element={<AddProduct />} />
          <Route path="/seller_orders" element={<SellerOrders />} />
          <Route path="/cart_page" element={<CartPage />} />
          <Route path="/chat" element={<MainChat />} />
          <Route path="/home/:category" element={<Home />} />

          {/* Footer Pages */}
          <Route path="/about-us" element={<InfoPage pageKey="about_us" />} />
          <Route path="/sustainability" element={<InfoPage pageKey="sustainability" />} />
          <Route path="/advertising" element={<InfoPage pageKey="advertising" />} />
          <Route path="/accessibility" element={<InfoPage pageKey="accessibility" />} />
          <Route path="/how-it-works" element={<InfoPage pageKey="how_it_works" />} />
          <Route path="/article-verification" element={<InfoPage pageKey="article_verification" />} />
          <Route path="/info-board" element={<InfoPage pageKey="info_board" />} />
          <Route path="/help-center" element={<InfoPage pageKey="help_center" />} />
          <Route path="/sell" element={<InfoPage pageKey="sell" />} />
          <Route path="/buy" element={<InfoPage pageKey="buy" />} />
          <Route path="/trust-safety" element={<InfoPage pageKey="trust_safety" />} />
          <Route path="/privacy-center" element={<InfoPage pageKey="privacy_center" />} />
          <Route path="/cookie-notices" element={<InfoPage pageKey="cookie_notices" />} />
          <Route path="/cookie-settings" element={<InfoPage pageKey="cookie_settings" />} />
          <Route path="/terms-conditions" element={<InfoPage pageKey="terms_conditions" />} />
          <Route path="/our-platform" element={<InfoPage pageKey="our_platform" />} />
          <Route path="/press" element={<InfoPage pageKey="press" />} />
          <Route path="/mobile-apps" element={<InfoPage pageKey="mobile_apps" />} />
        </Routes>
      </Router>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />

    </FilterProvider>
  );
}

export default App;