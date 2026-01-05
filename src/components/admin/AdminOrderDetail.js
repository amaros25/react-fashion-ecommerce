import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AdminOrderDetail.css';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const apiUrl = process.env.REACT_APP_API_URL;

    const [order, setOrder] = useState(null);
    const [user, setUser] = useState(null);
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch Order
                const orderRes = await fetch(`${apiUrl}/orders/${id}`);
                const orderData = await orderRes.json();
                if (!orderRes.ok) throw new Error(orderData.message);
                setOrder(orderData);

                // 2. Fetch User & Seller in parallel
                const [userRes, sellerRes] = await Promise.all([
                    fetch(`${apiUrl}/users/${orderData.userId}`),
                    fetch(`${apiUrl}/sellers/${orderData.sellerId}`)
                ]);

                const userData = await userRes.json();
                setUser(userData);
                const sellerData = await sellerRes.json();
                setSeller(sellerData);

                // 4. Fetch Products
                const productIds = orderData.items.map(item => item.productId).join(',');
                const productsRes = await fetch(`${apiUrl}/products/saved_ids?ids=${productIds}`);
                const productsData = await productsRes.json();
                const pMap = {};
                if (Array.isArray(productsData)) {
                    productsData.forEach(p => pMap[p._id] = p);
                }
                setProducts(pMap);

            } catch (err) {
                console.error("Error fetching order details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id, apiUrl]);

    if (loading) return <div className="admin-order-loading">LOADING...</div>;
    if (!order) return <div className="admin-order-error">ORDER NOT FOUND</div>;

    const currentStatus = order.status && order.status.length > 0
        ? order.status[order.status.length - 1].update
        : 0;

    const getReadableStatus = (status) => {
        switch (Number(status)) {
            case 0: return "Pending";
            case 1: return "Confirmed";
            case 2: return "Shipped";
            case 3: return "Delivered";
            case 10: return "No Response";
            case 11: return "1st Delivery Failed";
            case 12: return "2nd Delivery Attempt";
            case 13: return "Delivery Failed";
            case 20: return "Return Requested";
            case 21: return "Return Confirmed";
            case 22: return "Return Refused";
            case 23: return "Return Shipped";
            case 24: return "Return Received";
            case 25: return "Return Not Received";
            case 30: return "Cancelled by User";
            case 31: return "Cancelled by Seller";
            case 40: return "Ready to Pickup";
            case 41: return "Picked Up";
            case 42: return "Pickup Failed";
            default: return "Unknown (" + status + ")";
        }
    };

    const formatDate = (date) => date ? new Date(date).toLocaleString('de-DE', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    }) : '—';

    // Get latest contact info
    console.log("AdminOrderDetail: User Data", { user });
    const lastAddress = user?.address && user.address.length > 0 ? user.address[user.address.length - 1] : null;
    const lastPhone = user?.phone && user.phone.length > 0 ? user.phone[user.phone.length - 1] : null;

    console.log("AdminOrderDetail: User Data", { user, lastAddress, lastPhone });

    return (
        <div className="admin-order-container">
            <header className="admin-order-header">
                <button className="admin-order-back" onClick={() => navigate(-1)}>BACK</button>
                <h1>ORDER {order.orderNumber}</h1>
                <div className="admin-order-status-bar">
                    <span className="label">STATUS:</span>
                    <span className="value">{getReadableStatus(currentStatus).toUpperCase()}</span>
                </div>
            </header>

            <div className="admin-order-main-grid">
                {/* Column 1: Info */}
                <aside className="admin-order-sidebar">
                    <section className="info-block">
                        <h2 className="admin-order-subtitle">CUSTOMER</h2>
                        <p>{user?.firstName} {user?.lastName}</p>
                        <p className="email">{user?.email}</p>
                        <p>{lastPhone?.phone || lastPhone || 'NO PHONE'}</p>
                    </section>

                    <section className="info-block">
                        <h2 className="admin-order-subtitle">DELIVERY ADDRESS</h2>
                        {lastAddress ? (
                            <>
                                <p>{lastAddress.address}</p>
                                <p>{lastAddress.subCity} {lastAddress.city}</p>
                            </>
                        ) : (
                            <p>NO ADDRESS</p>
                        )}
                    </section>

                    <section className="info-block">
                        <h2 className="admin-order-subtitle">SELLER / SHOP</h2>
                        <p className="shop-name">{seller?.shopName || 'UNKNOWN SHOP'}</p>
                        <p>{seller?.firstName} {seller?.lastName}</p>
                        <p className="email">{seller?.email}</p>
                    </section>
                </aside>

                {/* Column 2: Items & Meta */}
                <main className="admin-order-content">
                    <section className="admin-order-section">
                        <h2 className="admin-order-subtitle">ORDER ITEMS</h2>
                        <div className="admin-order-items-list">
                            {order.items.map((item, idx) => {
                                const product = products[item.productId];
                                const itemPrice = product?.price || 0;
                                return (
                                    <div key={idx} className="admin-order-item-row">
                                        <div className="item-meta">
                                            <span className="item-name">{product?.name || 'Loading...'}</span>
                                            <span className="item-details">{item.size} / {item.color}</span>
                                            <span className="item-sku">{product?.productNumber}</span>
                                        </div>
                                        <div className="item-quantity">QTY: {item.quantity}</div>
                                        <div className="item-price">€{itemPrice.toFixed(3)}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="admin-order-total-bar">
                            <div className="total-row">
                                <span>SHIPPING</span>
                                <span>{order.is_delivery ? 'DELIVERY' : 'PICKUP'}</span>
                            </div>
                            {order.order_coupon && (
                                <div className="total-row">
                                    <span>COUPON</span>
                                    <span>{order.order_coupon}</span>
                                </div>
                            )}
                            <div className="total-row grand-total">
                                <span>TOTAL</span>
                                <span>€{(order.totalPrice || 0).toFixed(3)}</span>
                            </div>
                        </div>
                    </section>

                    {order.notes && (
                        <section className="admin-order-section">
                            <h2 className="admin-order-subtitle">NOTES</h2>
                            <p className="admin-order-notes">{order.notes}</p>
                        </section>
                    )}

                    <section className="admin-order-section">
                        <h2 className="admin-order-subtitle">HISTORY</h2>
                        <div className="admin-order-history">
                            {order.status.map((s, idx) => (
                                <div key={idx} className="history-step">
                                    <span className="date">{formatDate(s.date)}</span>
                                    <span className="update">{getReadableStatus(s.update).toUpperCase()}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
