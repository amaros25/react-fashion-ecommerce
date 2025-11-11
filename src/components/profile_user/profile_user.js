import React, { useEffect, useState } from "react";
import "./profile_user.css";
import { Header } from "../header/header";
import { useNavigate, Link } from "react-router-dom";
import UserProfileHeader from "./user_profile_header";
import { useTranslation } from "react-i18next";

function ProfileUser() {
  const { t } = useTranslation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 10;

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // 🔹 Funktion zum Abrufen der Orders (nicht in useEffect!)
  const fetchOrders = async (page = 1) => {
    try {
      console.log("🟢 userID: ", userId);
      console.log("🟢 page: ", page); 
      console.log("🟢 ordersPerPage: ", ordersPerPage);
      console.log("🟢 apiUrl: ", apiUrl);
      const res = await fetch(
        `${apiUrl}/orders/user/id=${userId}?&page=${page}&limit=${ordersPerPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      console.log("🟢 data: ", data);
      if (!res.ok) {
        console.error("Fehler beim Laden:", data.message);
        setOrders([]);
        return;
      }

      const ordersArray = Array.isArray(data.orders) ? data.orders : [];
      setOrders(ordersArray);
      setTotalPages(data.totalPages || 1);

      // 🔹 Produkte der geladenen Seite abrufen
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
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    }
  };

  // 🔹 User abrufen
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${apiUrl}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("User konnte nicht geladen werden:", err);
      }
    };

    fetchUser();
  }, [apiUrl, userId, token]);

  // 🔹 Orders abrufen (bei Seitenwechsel)
  useEffect(() => {
    if (userId && token) {
      fetchOrders(currentPage);
    }
  }, [currentPage, userId, token]);

  if (!user) return <p>⏳ {t("loading_profile")}...</p>;

  const totalOrders = orders.length;
  const openOrders = orders.filter(
    (order) =>
      order.status?.length &&
      order.status[order.status.length - 1].update !== "delivered"
  ).length;

  return (
    <div className="profile-user-container">
      <Header />
      <UserProfileHeader
        user={user}
        totalOrders={totalOrders}
        openOrders={openOrders}
        t={t}
      />

      <h3>📦 {t("your_orders")}</h3>
      <div className="orders-list">
        {orders.length === 0 ? (
          <p>{t("no_orders_yet")}</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <span>{t("order_id")}:</span>{" "}
                <strong>{order.orderNumber}</strong>
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
                        <p className="order-product-title">
                          {product?.name || t("loading_product")}
                        </p>
                        <div className="order-product-variants">
                          <span>
                            {t("size")}: {item.size}
                          </span>
                          <span>
                            {t("color")}:{" "}
                            {t(`product_colors.${item.color.toLowerCase()}`, {
                              defaultValue: item.color,
                            })}
                          </span>
                          <span>
                            {t("quantity")}: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="order-item-right">
                      <p>
                        <strong>{t("price")}:</strong> €
                        {order.totalPrice.toFixed(2)}
                      </p>
                      <p>
                        <strong>{t("status")}:</strong>{" "}
                        {order.status?.length
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
