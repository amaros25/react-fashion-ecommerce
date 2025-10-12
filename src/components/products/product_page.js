import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import "./product_page.css";
import { Header } from '../header/header.js';

function ProductPage() {
  const apiUrl = process.env.REACT_APP_API_URL;
 
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [seller, setSeller] = useState(null);

  const handleBuyClick = () => {
    if (!size) {
      alert("Please select a size.");
      return;
    }
    setShowModal(true);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      alert("You must be logged in to place an order.");
      return;
    }

    const orderData = {
      productID: product._id,
      userId,
      sellerId: seller._id,
      sizes: [{ size, quantity: Number(quantity) }],
      totalPrice: product.price * quantity,
      shippingAddress: address,
      status: [
        {
          update: "pending",
          date: new Date(),
        },
      ],
    };

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        throw new Error("Order could not be created.");
      }

      setOrderSuccess(true);
      setShowModal(false);
      alert("Order placed successfully!");
    } catch (err) {
      console.error(err);
      alert("Error placing the order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${apiUrl}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);

        console.log("🟢 data.image: ", data.image);
 
        if (Array.isArray(data.image) && data.image.length > 0) {
            console.log("🟢 data.image isArray: ", data.image);
          setMainImage(data.image[0]); 
        } else if (data.image) {
          setMainImage(data.image ); 
        }

        if (data.sellerId) {
          fetch(`${apiUrl}/sellers/${data.sellerId}`)
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Fehler beim Abrufen des Verkäufers: ${res.status}`);
              }
              return res.json();
            })
            .then((sellerData) => {
              setSeller(sellerData);
            })
            .catch((err) => {
              console.error("Fehler beim Laden des Verkäufers:", err);
              setSeller(null);
            });
        } else {
          console.error("Keine sellerId im Produkt vorhanden!");
          setSeller(null);
        }
      })
      .catch((err) => {
        console.error("Fehler beim Laden des Produkts:", err);
      });
  }, [id]);

  if (!product) {
    return <div>Produkt wird geladen...</div>;
  }
  if (!seller) {
    return <div>Verkäufer werden geladen...</div>;
  }

  return (
    <div className="product-page">
      <Header /> 
      {/* Links: Produktbilder */}
      <div className="product-images">
        <img src={mainImage} alt={product.name} className="main-image"  loading="lazy" />
        <div className="thumbnail-row">
          {/* Überprüfen, ob es mehrere Bilder gibt */}
          {product.image && product.image.length > 0 ? (
            product.image.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.name}-${index}`}
                className={`thumbnail ${mainImage === img ? "active" : ""}`}
                loading="lazy" 
                onClick={() => setMainImage(img)}
              />
            ))
          ) : (
            product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="thumbnail active"
                loading="lazy" 
                onClick={() => setMainImage(product.image)}
              />
            )
          )}
        </div>
      </div>

      {/* Rechts: Produktinformationen und Verkäuferdaten */}
      <div className="product-info">
        <h1>{product.name}</h1>
        <p>{product.description}</p>

        <div className="seller-info">
          <div className="seller-details">
            {seller.image && (
              <img src={seller.image} alt={seller.shopName} className="seller-image"  loading="lazy" />
            )}
            <div>
              <h3>{seller.shopName}</h3>
              <div className="seller-rating">
                <span>Bewertung: {seller.rating.toFixed(1)} / 5</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Buy-Box */}
        <div className="product-buy-box">
          <h2>{product.price} €</h2>
          <div className="selection">
            <label>Größe:</label>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="">Select size</option>
              {product.sizes.map((s) => (
                <option key={s.size} value={s.size}>
                  {s.size} ({s.stock} in stock)
                </option>
              ))}
            </select>
          </div>

          <div className="selection">
            <label>Menge:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <button className="buy-button" onClick={handleBuyClick}>
            Order Now
          </button>
        </div>
      </div>

      {/* Modal für Versandadresse */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Enter Shipping Address</h2>
            <form onSubmit={handleOrderSubmit}>
              <label>Street:</label>
              <input
                type="text"
                required
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
              <label>City:</label>
              <input
                type="text"
                required
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
              <label>Postal Code:</label>
              <input
                type="text"
                required
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              />
              <label>Country:</label>
              <input
                type="text"
                required
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
              />

              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Placing Order..." : "Submit Order"}
                </button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
