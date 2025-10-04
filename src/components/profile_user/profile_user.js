import React, { useEffect, useState } from "react";
import "./profile_user.css";
import Header from "../header/header";
import { useNavigate } from "react-router-dom";

function ProfileUser() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    // Benutzerdaten laden
    const fetchUser = async () => {
      const res = await fetch(`${apiUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    };

    // Bestellungen laden
    const fetchOrders = async () => {
      const res = await fetch(`${apiUrl}/orders?user=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    };

    // Zufällige Produkte laden
    const fetchSuggestedProducts = async () => {
      const res = await fetch(`${apiUrl}/products/latest`);
      const data = await res.json();
      // Shuffle (Fisher-Yates) + z.B. 6 Produkte
      const shuffled = data.sort(() => 0.5 - Math.random());
      setSuggestedProducts(shuffled.slice(0, 6));
    };

    fetchUser();
    fetchOrders();
    fetchSuggestedProducts();
  }, [userId, token]);

  if (!user) return <p>⏳ Profil wird geladen...</p>;

  const totalOrders = orders.length;
  const openOrders = orders.filter(order =>
    order.status?.length && order.status[order.status.length - 1].update !== "delivered"
  ).length;

  return (
    <div className="profile-user-container">
      <Header />

      <div className="profile-header">
        <img src={user.image} alt={user.firstName} className="profile-image" />
        <div className="profile-info">
          <h2>{user.firstName} {user.lastName}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat">
          <h4>Total Orders</h4>
          <p>{totalOrders}</p>
        </div>
        <div className="stat">
          <h4>Open Orders</h4>
          <p>{openOrders}</p>
        </div>
        
      </div>

      <h3>🔮 Für dich empfohlen</h3>
      <div className="product-list">
        {suggestedProducts.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.image[0]} alt={product.name} />
            <h4>{product.name}</h4>
            <p>Preis: €{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfileUser;
