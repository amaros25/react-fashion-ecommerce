import { useEffect, useState } from "react";

export function useUserOrders(apiUrl, userId, token, currentPage, ordersPerPage) {

  const [orders, setOrders] = useState([]);
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
    fetchOrders();
  }, [apiUrl, userId, token, currentPage, ordersPerPage]);

  return { orders, products, totalPages };
}
