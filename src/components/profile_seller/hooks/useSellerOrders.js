import { useState, useEffect, useCallback } from 'react';

export const useSellerOrders = (sellerId, refreshTrigger) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ordersPerPage = 5;
    const [searchOrder, setSearchOrder] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [products, setProducts] = useState({});

    const fetchOrders = useCallback(async () => {
        if (!sellerId) return;
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: ordersPerPage,
            });
            if (filterStatus) queryParams.append("status", filterStatus);
            if (searchOrder) queryParams.append("orderNumber", searchOrder);

            const res = await fetch(
                `${apiUrl}/orders/seller/${sellerId}?${queryParams.toString()}`
            );

            if (!res.ok) throw new Error("Serverfehler");

            const data = await res.json();
            const ordersList = data.orders || [];
            setOrders(ordersList);
            setTotalPages(Math.ceil(data.totalCount / ordersPerPage));

            // Fetch product details for these orders
            const newProductMap = {};
            for (const order of ordersList) {
                for (const item of order.items) {
                    if (!newProductMap[item.productId] && !products[item.productId]) {
                        try {
                            const prodRes = await fetch(`${apiUrl}/products/${item.productId}`);
                            const prodData = await prodRes.json();
                            newProductMap[item.productId] = prodData;
                        } catch (err) {
                            console.error("Product can not loaded:", item.productId, err);
                        }
                    }
                }
            }

            if (Object.keys(newProductMap).length > 0) {
                setProducts(prev => ({ ...prev, ...newProductMap }));
            }

        } catch (error) {
            console.error("Error loading orders:", error);
            setOrders([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [sellerId, currentPage, filterStatus, searchOrder, apiUrl, products]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders, refreshTrigger]);

    const handleFilter = () => {
        setCurrentPage(1);
        fetchOrders(); // This might be redundant as fetchOrders depends on currentPage, but explicit call ensures immediate reaction if needed or if logic changes
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return {
        orders,
        loading,
        currentPage,
        totalPages,
        searchOrder,
        setSearchOrder,
        filterStatus,
        setFilterStatus,
        products,
        handleFilter,
        paginate
    };
};
