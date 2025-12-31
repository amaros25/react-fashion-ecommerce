import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProfile.css';

const AdminProfile = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSellers: 0,
        totalProducts: 0,
        totalOrders: 0
    });
    const [activeTab, setActiveTab] = useState('products');
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchStats();
        fetchTabData('products'); // Initial load
    }, []);

    useEffect(() => {
        setCurrentPage(1); // Reset page on tab change
        fetchTabData(activeTab);
    }, [activeTab]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${apiUrl}/admin/stats`);
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    const fetchTabData = async (tab) => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/admin/${tab}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setDataList(data);
            } else {
                console.error("API did not return an array:", data);
                setDataList([]);
            }
        } catch (err) {
            console.error(`Error fetching ${tab}:`, err);
            setDataList([]);
        } finally {
            setLoading(false);
        }
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = dataList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(dataList.length / ITEMS_PER_PAGE);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    const renderContent = () => {
        if (loading) return <div className="loading-spinner">Loading...</div>; // You might want a better spinner

        // Helper to get base URL for images
        const baseUrl = apiUrl.replace('/api', '');

        if (activeTab === 'products') {
            return (
                <div className="product-list">
                    <div className="list-header product-item-grid">
                        <span>Img</span>
                        <span>Title</span>
                        <span>Product No.</span>
                        <span>Stock</span>
                    </div>
                    {currentItems.map(item => (
                        <div key={item._id} className="list-item product-item-grid">
                            <img
                                src={item.images && item.images.length > 0
                                    ? (item.images[0].startsWith('http') ? item.images[0] : `${baseUrl}/images/${item.images[0]}`)
                                    : '/placeholder.png'
                                }
                                alt={item.name}
                                className="product-img-small"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                            />
                            <span>{item.name}</span>
                            <span>{item.productNumber}</span>
                            {/* Summing stock from all sizes */}
                            <span>
                                {(item.sizes || []).reduce((acc, curr) => acc + Number(curr.stock || 0), 0)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }

        if (activeTab === 'orders') {
            return (
                <div className="order-list">
                    <div className="list-header" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                        <span>Order #</span>
                        <span>User</span>
                        <span>Total</span>
                        <span>Status</span>
                    </div>
                    {currentItems.map(item => {
                        const currentStatus = item.status && item.status.length > 0
                            ? item.status[item.status.length - 1].update
                            : 'Unknown';
                        return (
                            <div key={item._id} className="list-item" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                                <span>{item.orderNumber}</span>
                                <span>{item.user ? item.user.email : 'Guest'}</span>
                                <span>${item.totalPrice}</span>
                                <span className={`status-badge status-${getStatusColor(currentStatus)}`}>
                                    {getReadableStatus(currentStatus)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (activeTab === 'users' || activeTab === 'sellers') {
            return (
                <div className="user-list">
                    <div className="list-header" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr' }}>
                        <span>Name</span>
                        <span>Email</span>
                        <span>Joined</span>
                        <span>Last Online</span>
                        <span>Active</span>
                    </div>
                    {currentItems.map(item => (
                        <div key={item._id} className="list-item" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr' }}>
                            <span>{item.firstName} {item.lastName}</span>
                            <span>{item.email}</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            <span>
                                {item.lastOnline
                                    ? new Date(item.lastOnline).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })
                                    : 'Never'}
                            </span>
                            <span>
                                <button
                                    className={`toggle-btn ${item.active ? 'active' : 'inactive'}`}
                                    onClick={() => toggleActivation(activeTab === 'users' ? 'user' : 'seller', item._id, item.active)}
                                >
                                    {item.active ? 'Active' : 'Inactive'}
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
    };

    const getStatusColor = (status) => {
        // Simple mapping, adjust as needed
        if ([3, 30, 31].includes(status)) return 'danger'; // Cancelled/Failed
        if ([13, 2, 42].includes(status)) return 'success'; // Delivered/Return Received
        return 'pending';
    };

    const toggleActivation = async (type, id, currentStatus) => {
        try {
            const endpoint = type === 'user' ? 'toggle-user' : 'toggle-seller';
            const res = await fetch(`${apiUrl}/admin/${endpoint}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ active: !currentStatus })
            });

            if (res.ok) {
                // Optimistic update
                setDataList(prev => prev.map(item =>
                    item._id === id ? { ...item, active: !currentStatus } : item
                ));
            }
        } catch (err) {
            console.error("Error toggling activation:", err);
        }
    };

    const getReadableStatus = (status) => {
        // Map status codes to readable text (using translation keys roughly)
        // See order_status.js for codes
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

    return (
        <div className="admin-profile-container">
            <div className="admin-header-top">
                <div className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <p>Overview of your store performance</p>
                </div>
                <div className="header-actions">
                    <button className="action-btn btn-messages" onClick={() => navigate('/chat')}>
                        Messages
                    </button>
                    <button className="action-btn btn-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="admin-stats-grid">
                <div className="stat-card">
                    <h3>Total Products</h3>
                    <div className="stat-value">{stats.totalProducts}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Orders</h3>
                    <div className="stat-value">{stats.totalOrders}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <div className="stat-value">{stats.totalUsers}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Sellers</h3>
                    <div className="stat-value">{stats.totalSellers}</div>
                </div>
            </div>

            <div className="admin-tabs">
                <div className="tab-headers">
                    {['products', 'orders', 'users', 'sellers'].map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="tab-content">
                    {renderContent()}
                </div>
                {/* Pagination Controls */}
                {dataList.length > ITEMS_PER_PAGE && (
                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="page-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="page-btn"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProfile;
