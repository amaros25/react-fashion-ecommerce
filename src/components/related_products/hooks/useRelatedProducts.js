import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function useRelatedProducts(category, currentProductId) {

    const apiUrl = process.env.REACT_APP_API_URL;
    const [latestProducts, setLatestProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async (page = 1, limit = 12) => {
        try {
            let url = `${apiUrl}/products/latest?page=${page}&limit=${limit}`;
            if (category) url += `&category=${category}`;
            if (currentProductId) url += `&not=${currentProductId}`;

            const res = await fetch(url);
            const data = await res.json();

            if (Array.isArray(data.products)) {
                return data.products;
            }
            return [];
        } catch (error) {
            console.error("Error fetching related products:", error);
            toast.error("Error fetching related products");
            return [];
        }
    };

    useEffect(() => {
        let controller = new AbortController();

        const loadRelatedProducts = async () => {
            try {
                const products = await fetchProducts(1, 12);
                let filtered = products.filter((p) => p._id !== currentProductId);

                if (filtered.length === 12) {
                    setLatestProducts(filtered);
                }
                else if (filtered.length >= 6 && filtered.length < 12) {
                    setLatestProducts(filtered.slice(0, 6));
                }
                else {
                    setLatestProducts(filtered);
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Failed to load related products:", error);
                    toast.error("Failed to load related products");
                }
            } finally {
                setLoading(false);
            }
        };

        loadRelatedProducts();

        return () => controller.abort();
    }, [apiUrl, category, currentProductId]);

    return { latestProducts, loading };
}
