import React, { useEffect, useState } from "react";
import "./profile_user.css";
import { Header } from "../header/header";
import { useNavigate, Link } from "react-router-dom";
import UserProfileHeader from "./user_profile_header"; // Header import
import { useTranslation } from "react-i18next"; // Translation hook

function ProfileUser() {
  const { t } = useTranslation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${apiUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    };

    const fetchOrders = async () => {
      const res = await fetch(`${apiUrl}/orders/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const ordersArray = Array.isArray(data) ? data : data.orders || data.data || [];
      ordersArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ordersArray);

      // Produkte laden
      const productMap = {};
      for (const order of ordersArray) {
        for (const item of order.items) {
          if (!productMap[item.productId]) {
            try {
              const prodRes = await fetch(`${apiUrl}/products/${item.productId}`);
              const prodData = await prodRes.json();
              productMap[item.productId] = prodData;
            } catch (err) {
              console.error("Produkt nicht geladen:", item.productId, err);
            }
          }
        }
      }
      setProducts(productMap);
    };

    fetchUser();
    fetchOrders();
  }, [userId, token]);

  if (!user) return <p>⏳ {t("loading_profile")}...</p>;

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const totalOrders = orders.length;
  const openOrders = orders.filter(
    (order) =>
      order.status?.length && order.status[order.status.length - 1].update !== "delivered"
  ).length;

  return (
    <div className="profile-user-container">
      <Header />
      
      {/* Übersetzbarer Header */}
      <UserProfileHeader 
        user={user} 
        totalOrders={totalOrders} 
        openOrders={openOrders} 
        t={t} 
      />

      <h3>📦 {t("your_orders")}</h3>
      <div className="orders-list">
        {currentOrders.length === 0 ? (
          <p>{t("no_orders_yet")}</p>
        ) : (
          currentOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <span>{t("order_id")}:</span> <strong>{order.orderNumber}</strong>
              </div>

              {order.items.map((item, i) => {
                const product = products[item.productId];
                return (
                  <Link
                    key={i}
                    to={`/product/${item.productId}`}
                    className="order-item-card clickable"
                  >
                    <div className="order-item-left">
                      {product?.image?.[0] && (
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className="order-product-image"
                        />
                      )}
                      <div className="order-product-info">
                        <p className="order-product-title">{product?.name || t("loading_product")}</p>
                        <div className="order-product-variants">
                          <span>{t("size")}: {item.size}</span> | 
                          <span>{t("color")}: {item.color}</span> | 
                          <span>{t("quantity")}: {item.quantity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="order-item-right">
                      <p><strong>{t("price")}:</strong> €{order.totalPrice.toFixed(2)}</p>
                      <p><strong>{t("status")}:</strong> {order.status?.length
                        ? order.status[order.status.length - 1].update
                        : t("pending")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfileUser;
