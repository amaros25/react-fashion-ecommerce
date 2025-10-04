import React, { useEffect, useState } from "react";

function SellerOpenOrders({ orders, handleStatusChange }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [statusUpdates, setStatusUpdates] = useState({});
  const [ordersWithDetails, setOrdersWithDetails] = useState([]);

  // Status im State aktualisieren
  const onStatusChange = (orderId, newStatus) => {
    setStatusUpdates(prev => ({ ...prev, [orderId]: newStatus }));
  };

  // Status an Backend schicken
  const onSubmit = (orderId) => {
    const newStatus = statusUpdates[orderId];
    if (newStatus) {
      handleStatusChange(orderId, newStatus);
    }
  };

  // Hol User und Produktdaten für jede Order
  useEffect(() => {
    async function fetchDetails() {
      const detailedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            // Produktdaten laden
            const productRes = await fetch(`${apiUrl}/products/${order.productID}`);
            const product = await productRes.json();

            console.log("🟡 product: ", {product});
            // Userdaten laden
            const userRes = await fetch(`${apiUrl}/users/${order.userId}`);
            const user = await userRes.json();

            return {
              ...order,
              product,
              user,
            };
          } catch (error) {
            console.error("Fehler beim Laden von Produkt oder User", error);
            return order; // fallback: return bare order
          }
        })
      );
      setOrdersWithDetails(detailedOrders);
    }

    if (orders && orders.length > 0) {
      fetchDetails();
    } else {
      setOrdersWithDetails([]);
    }
  }, [orders]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      height: '500px',
      overflowY: 'auto',
      border: '1px solid #f1f1f1ff',
      borderRadius: '8px',
      padding: '10px',
      margin: 'auto',
      boxSizing: 'border-box',
      position: 'relative', 
    }}>

 


  {ordersWithDetails.map(order => (
    <div key={order._id} style={{
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #eee',
      padding: '10px 0',
      gap: '10px',
      minHeight: '80px',
      boxSizing: 'border-box',
      position: 'relative', // Hier hinzufügen!!!
    }}>
      {/* Datum */}
      <div style={{
        fontSize: '12px',
        position: 'absolute',
        top: '5px',
        right: '5px',
        color: '#777',
      }}>
        {new Date(order.createdAt).toLocaleDateString()}
      </div>
          {/* Produkt Bild (erstes Bild im Array) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Produktbild */}
            <img
              src={order.product?.image?.[0] || ''}
              alt={order.product?.name || 'Produktbild'}
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '5px',
                marginBottom: '10px' // Abstand zwischen Bild und Name
              }}
            />

            {/* Produktname */}
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {order.product?.name || 'Kein Produktname'}
            </div>
          </div>

            {/* Kunden Name und Telefon untereinander */}
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
          {/* Kunden Name */}
          <div style={{ width: '150px', marginBottom: '5px' }}>
            {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Kein Nutzer'}
          </div>

          {/* Telefon */}
          <div style={{ width: '120px' }}>
            {order.user?.phone || 'Keine Telefonnummer'}
          </div>
        </div>

          {/* Adresse */}
          <div style={{ flex: 1, fontSize: '14px' }}>
            {order.shippingAddress
              ? `${order.shippingAddress.street}, ${order.shippingAddress.postalCode} ${order.shippingAddress.city}, ${order.shippingAddress.country}`
              : 'Keine Adresse'}
          </div>

 
        {/* Mengen nach Größe anzeigen */}
        <div style={{  width: '100px', fontSize: '14px' }}>
          {order.sizes?.map(({ size, quantity }) => (
            <div key={size}>
              {size}: {quantity}
            </div>
          )) || 'Keine Größen verfügbar'}
        </div>

          {/* Status Dropdown */}
          <select
            style={{ width: '130px', padding: '5px' }}
            value={statusUpdates[order._id] ?? order.status?.slice(-1)[0]?.update ?? 'pending'}
            onChange={e => onStatusChange(order._id, e.target.value)}
          >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>

          </select>

          {/* Submit Button */}
          <button
            style={{
              marginLeft: '10px',
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
            }}
            onClick={() => onSubmit(order._id)}
          >
            Update
          </button>
        </div>
      ))}
    </div>
  );
}

export default SellerOpenOrders;
