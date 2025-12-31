import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./i18n";
import "react-toastify/dist/ReactToastify.css";
import { Header } from "./components/header/header";
import Foot from "./components/foot/foot";
import Home from "./components/home/home.js";
import ProductPage from "./components/products/product_page.js";
import Login from "./components/login/login";
import Register from "./components/register/register";
import ProfileUser from "./components/profile_user/profile_user";
import ProfileSeller from "./components/profile_seller/profile_seller";
import AddProduct from './components/new_product/add_product.js';
import CartPage from './components/cart/cart_page.js';
import MainChat from './components/chat/main_chat.js';
import InfoPage from './components/info_pages/InfoPage.js';
import HelpCenter from './components/info_pages/HelpCenter.js';
import AdminProfile from "./components/admin/AdminProfile";
import ShopPage from './components/shop/ShopPage.js';
import ScrollToTop from './components/utils/ScrollToTop.js';
import { FilterProvider } from './components/filter_context/filter_context.js';
import { ToastContainer } from "react-toastify";
import SavedProducts from './components/saved_products/saved_products.js';
import Agb from './components/info_pages/agb.js';
import DataProtection from './components/info_pages/data_protection.js';
import ResetPassword from './components/reset_password/reset_password.js';
//import SeedProducts from './components/new_product/seed_products.js';
function App() {

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const hasUpdated = sessionStorage.getItem("lastOnlineUpdated");

    if (userId && !hasUpdated) {
      fetch(`${process.env.REACT_APP_API_URL}/auth/last-online`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role })
      }).then(() => {
        sessionStorage.setItem("lastOnlineUpdated", "true");
        console.log("Last online status updated.");
      }).catch(err => console.error("Failed to update last online:", err));
    }
  }, []);

  return (
    <FilterProvider>

      <Router>

        <Header />
        <Routes>

          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile_seller" element={<ProfileSeller />} />
          <Route path="/profile_user" element={<ProfileUser />} />
          <Route path="/add_product" element={<AddProduct />} />

          <Route path="/cart_page" element={<CartPage />} />
          <Route path="/chat" element={<MainChat />} />
          <Route path="/shop/:sellerId" element={<ShopPage />} />
          <Route path="/home/:category/:subcategory" element={<Home />} />
          <Route path="/home/:category" element={<Home />} />

          <Route path="/about-us" element={<InfoPage pageKey="about_us" />} />
          <Route path="/sustainability" element={<InfoPage pageKey="sustainability" />} />
          <Route path="/advertising" element={<InfoPage pageKey="advertising" />} />
          <Route path="/accessibility" element={<InfoPage pageKey="accessibility" />} />
          <Route path="/how-it-works" element={<InfoPage pageKey="how_it_works" />} />
          <Route path="/article-verification" element={<InfoPage pageKey="article_verification" />} />
          <Route path="/info-board" element={<InfoPage pageKey="info_board" />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/profile_admin" element={<AdminProfile />} />
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
          <Route path="/saved_products" element={<SavedProducts />} />
          <Route path="/agb" element={<Agb />} />
          <Route path="/data_protection" element={<DataProtection />} />
        </Routes>
        <Foot />

        <ToastContainer position="top-center" autoClose={3000} theme="colored" />

      </Router>
    </FilterProvider>
  );
}

export default App;