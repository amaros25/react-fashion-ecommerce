import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminApi } from './hooks/useAdminApi';
import { toast } from 'react-toastify';
import './AdminProfile.css';

const AdminProfile = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const { loading, fetchStats, fetchTabData, toggleActivation: toggleActivationApi, updateProductStatus: updateProductStatusApi, updateOrderStatus: updateOrderStatusApi } = useAdminApi(apiUrl);

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSellers: 0,
        totalProducts: 0,
        totalOrders: 0,
        activeUsers: 0
    });
    const [activeTab, setActiveTab] = useState('products');
    const [dataList, setDataList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Status Modal State
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState(''); // 'user', 'seller', 'product', 'order'

    const filteredData = dataList.filter(item => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        if (activeTab === 'products') {
            return item.productNumber?.toLowerCase().includes(query) || item.name?.toLowerCase().includes(query);
        }
        if (activeTab === 'orders') {
            return item.orderNumber?.toLowerCase().includes(query);
        }
        if (activeTab === 'users' || activeTab === 'sellers') {
            const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
            return fullName.includes(query) || item.email?.toLowerCase().includes(query);
        }
        return true;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeTab]);

    const loadStats = useCallback(async () => {
        const result = await fetchStats();
        if (result.success) {
            setStats(result.data);
        } else {
            toast.error(t(result.errorKey));
        }
    }, [fetchStats, t]);

    const loadTabData = useCallback(async (tab) => {
        const result = await fetchTabData(tab);
        if (result.success) {
            if (Array.isArray(result.data)) {
                setDataList(result.data);
            } else {
                console.error("API did not return an array:", result.data);
                setDataList([]);
            }
        } else {
            toast.error(t(result.errorKey));
            setDataList([]);
        }
    }, [fetchTabData, t]);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
            navigate('/login');
            return;
        }
        loadStats();
        loadTabData('products'); // Initial load
    }, [navigate, loadStats, loadTabData]);

    useEffect(() => {
        setCurrentPage(1); // Reset page on tab change
        loadTabData(activeTab);
    }, [activeTab, loadTabData]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    const handleRowClick = (item, e) => {
        // Prevent row click if clicking a button or specific action
        if (e.target.closest('.status-badge') || e.target.closest('.toggle-btn')) return;

        if (activeTab === 'products') {
            navigate(`/product/${item.id}`);
        } else if (activeTab === 'orders') {
            navigate(`/admin/order/${item.id}`);
        }
    };

    const openStatusModal = (item, type) => {
        setSelectedItem(item);
        setModalType(type);
        setShowStatusModal(true);
    };

    const handleStatusUpdate = async (newStatus) => {
        let result;
        if (modalType === 'user' || modalType === 'seller') {
            // New logic: send newStatus string directly
            result = await toggleActivationApi(modalType, selectedItem.id, newStatus);
        } else if (modalType === 'product') {
            result = await updateProductStatusApi(selectedItem.id, newStatus);
        } else if (modalType === 'order') {
            result = await updateOrderStatusApi(selectedItem.id, newStatus);
        }

        if (result.success) {
            setDataList(prev => prev.map(item =>
                item.id === selectedItem.id ? {
                    ...item,
                    active: modalType === 'user' || modalType === 'seller' ? result.active : item.active,
                    currentState: modalType === 'product' ? result.status : item.currentState,
                    currentStatus: modalType === 'order' ? result.status : item.currentStatus
                } : item
            ));
            toast.success(t("success_update_status"));
            setShowStatusModal(false);
        } else {
            toast.error(t(result.errorKey));
        }
    };

    const StatusModal = () => {
        if (!showStatusModal) return null;

        const options = [];
        if (modalType === 'user' || modalType === 'seller') {
            options.push({ value: 'pending', label: 'Pending', class: 'status-pending' });
            options.push({ value: 'active', label: 'Active', class: 'status-1' });
            options.push({ value: 'banned', label: 'Banned', class: 'status-3' });
            options.push({ value: 'deleted', label: 'Deleted', class: 'status-3' });
            options.push({ value: 'verified', label: 'Verified', class: 'status-1' });
            options.push({ value: 'unverified', label: 'Unverified', class: 'status-pending' });
        } else if (modalType === 'product') {
            options.push({ value: 0, label: 'Pending', class: 'status-pending' });
            options.push({ value: 1, label: 'Active', class: 'status-1' });
            options.push({ value: 2, label: 'Blocked', class: 'status-3' });
            options.push({ value: 3, label: 'Deleted', class: 'status-3' });
        } else if (modalType === 'order') {
            // Subset of most common admin statuses
            [0, 1, 2, 3, 20, 21, 30, 31, 40, 41].forEach(s => {
                options.push({ value: s, label: getReadableStatus(s), class: `status-${getStatusColor(s)}` });
            });
        }

        return (
            <div className="admin-modal-overlay" onClick={() => setShowStatusModal(false)}>
                <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                    <h3>Update Status</h3>
                    <p>{modalType.toUpperCase()} ID: {selectedItem.id}</p>
                    <div className="status-options-grid">
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                className={`status-option-btn ${opt.class}`}
                                onClick={() => handleStatusUpdate(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button className="modal-close-btn" onClick={() => setShowStatusModal(false)}>Close</button>
                </div>
            </div>
        );
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    const renderContent = () => {
        if (loading) return <div className="loading-spinner">Loading...</div>;

        const baseUrl = apiUrl.replace('/api', '');

        const searchPlaceholder = activeTab === 'products' ? 'Search by Product No. or Name...' :
            activeTab === 'orders' ? 'Search by Order Number...' : 'Search by Name or Email...';

        return (
            <div className="tab-container">
                <StatusModal />
                <div className="search-bar-container">
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {activeTab === 'products' && (
                    <div className="product-list">
                        <div className="list-header product-item-grid-admin">
                            <span>ID</span>
                            <span>Img</span>
                            <span>Title</span>
                            <span>Product No.</span>
                            <span>Stock</span>
                            <span>Status</span>
                        </div>
                        {currentItems.map(item => {
                            const productImg = (item.images && item.images.length > 0) ? item.images[0] :
                                (item.image && item.image.length > 0) ? item.image[0] : null;

                            return (
                                <div key={item.id} className="list-item product-item-grid-admin clickable-row" onClick={(e) => handleRowClick(item, e)}>
                                    <span className="admin-id-col">{item.id}</span>
                                    <img
                                        src={productImg
                                            ? (productImg.startsWith('http') ? productImg : `${baseUrl}/images/${productImg}`)
                                            : '/placeholder.png'
                                        }
                                        alt={item.name}
                                        className="product-img-small"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                                    />
                                    <span>{item.name}</span>
                                    <span>{item.productNumber}</span>
                                    <span>
                                        {(item.sizes || []).reduce((acc, curr) => acc + Number(curr.stock || 0), 0)}
                                    </span>
                                    <span
                                        className={`status-badge status-${item.currentState === 1 ? 'success' : item.currentState === 0 ? 'pending' : 'danger'}`}
                                        onClick={() => openStatusModal(item, 'product')}
                                    >
                                        {item.currentState === 0 ? 'Pending' :
                                            item.currentState === 1 ? 'Active' :
                                                item.currentState === 2 ? 'Blocked' :
                                                    item.currentState === 3 ? 'Deleted' : 'Unknown'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="order-list">
                        <div className="list-header" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr 1fr' }}>
                            <span>ID</span>
                            <span>Order #</span>
                            <span>User</span>
                            <span>Total</span>
                            <span>Status</span>
                        </div>
                        {currentItems.map(item => {
                            const currentStatus = item.currentStatus || (item.status && item.status.length > 0
                                ? item.status[item.status.length - 1].update
                                : 1);
                            return (
                                <div key={item.id} className="list-item clickable-row" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr 1fr' }} onClick={(e) => handleRowClick(item, e)}>
                                    <span className="admin-id-col">{item.id}</span>
                                    <span>{item.orderNumber}</span>
                                    <span>{item.buyer ? `${item.buyer.firstName} ${item.buyer.lastName}` : (item.buyerSnapshot?.email || 'Guest')}</span>
                                    <span>€{Number(item.totalPrice || 0).toFixed(2)}</span>
                                    <span
                                        className={`status-badge status-${getStatusColor(currentStatus)}`}
                                        onClick={() => openStatusModal(item, 'order')}
                                    >
                                        {getReadableStatus(currentStatus)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {(activeTab === 'users' || activeTab === 'sellers') && (
                    <div className="user-list">
                        <div className="list-header" style={{ gridTemplateColumns: '80px 1.5fr 2fr 1fr 1fr 120px' }}>
                            <span>ID</span>
                            <span>Name</span>
                            <span>Email</span>
                            <span>Joined</span>
                            <span>Last Online</span>
                            <span>Status</span>
                        </div>
                        {currentItems.map(item => {
                            const statusColorClass = (item.active === 'active' || item.active === 'verified') ? 'status-success' :
                                (item.active === 'pending' || item.active === 'unverified') ? 'status-pending' : 'status-danger';

                            return (
                                <div key={item.id} className="list-item" style={{ gridTemplateColumns: '80px 1.5fr 2fr 1fr 1fr 120px' }}>
                                    <span className="admin-id-col">{item.id}</span>
                                    <span>{item.firstName} {item.lastName}</span>
                                    <span>{item.email}</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    <span>
                                        {item.updatedAt
                                            ? new Date(item.updatedAt).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })
                                            : 'Never'}
                                    </span>
                                    <span>
                                        <button
                                            className={`status-badge ${statusColorClass}`}
                                            onClick={() => openStatusModal(item, activeTab === 'users' ? 'user' : 'seller')}
                                            style={{ border: 'none', cursor: 'pointer', width: '100%', textTransform: 'capitalize' }}
                                        >
                                            {item.active}
                                        </button>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const getStatusColor = (status) => {
        // Simple mapping, adjust as needed
        if ([3, 30, 31].includes(status)) return 'danger'; // Cancelled/Failed
        if ([13, 2, 42].includes(status)) return 'success'; // Delivered/Return Received
        return 'pending';
    };

    const toggleActivation = async (type, id, currentStatus) => {
        const result = await toggleActivationApi(type, id, currentStatus);
        if (result.success) {
            // Optimistic update
            setDataList(prev => prev.map(item =>
                item._id === id ? { ...item, active: result.active } : item
            ));
            toast.success(t("success_update_status"));
        } else {
            toast.error(t(result.errorKey));
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
                <div className="stat-card active-users-card">
                    <h3>Active Users</h3>
                    <div className="stat-value pulse">{stats.activeUsers}</div>
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
