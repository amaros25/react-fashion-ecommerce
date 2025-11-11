import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./components/home/home.js";
import ProductPage from "./components/products/product_page.js";
import Login from "./components/login/login";
import Register from "./components/register/register";
import ProfileUser from "./components/profile_user/profile_user";
import ProfileSeller from "./components/profile_seller/profile_seller";
import SellerOrders  from "./components/seller_order/seller_order";
import AddProduct from './components/new_product/add_product.js';
import CartPage from './components/cart/cart_page.js';
import { FilterProvider } from './components/filter_context/filter_context.js';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./i18n"; 
//import Homepage from "./components/learn_react/home.js";
function App() {
  
  return (
    <FilterProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<Homepage />} /> 
          <Route path="/" element={<Homepage />} /> 
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile_seller" element={<ProfileSeller />} />
          <Route path="/profile_user" element={<ProfileUser />} />
          <Route path="/add_product" element={<AddProduct />} />
          <Route path="/seller_orders" element={<SellerOrders />} />
          <Route path="/cart_page" element={<CartPage/>} />
          <Route path="/home/:category" element={<Homepage />} />
        </Routes>
      </Router>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />

    </FilterProvider>
  );
}

export default App;