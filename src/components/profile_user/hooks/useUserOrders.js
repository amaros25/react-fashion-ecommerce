import { useEffect, useState } from "react";

export function useUserOrders(apiUrl, userId, token, currentPage, ordersPerPage, refreshTrigger) {

  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {

    if (!userId || !token) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/orders/user/${userId}?page=${currentPage}&limit=${ordersPerPage}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!res.ok) return;

        const ordersArray = Array.isArray(data.orders) ? data.orders : [];
        setOrders(ordersArray);
        setTotalPages(data.totalPages || 1);
        const productMap = {};
        for (const order of ordersArray) {
          for (const item of order.items) {
            if (!productMap[item.productId]) {
              try {
                const prodRes = await fetch(`${apiUrl}/products/${item.productId}`);
                const prodData = await prodRes.json();
                productMap[item.productId] = prodData;
              } catch (err) {
                console.error("Product can not loaded:", item.productId, err);
              }
            }
          }
        }
        setProducts(productMap);
      } catch (err) {
        console.error("Fetch Orders Error:", err);
      }
    };

    const fetchAllOrders = async () => {
      try {
        const res = await fetch(`${apiUrl}/orders/user/${userId}?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.orders) {
          setAllOrders(data.orders);
        }
      } catch (error) {
        console.error("Error fetching all orders for stats:", error);
      }
    };

    fetchOrders();
    fetchAllOrders();
  }, [apiUrl, userId, token, currentPage, ordersPerPage, refreshTrigger]);

  return { orders, allOrders, products, totalPages };
}
