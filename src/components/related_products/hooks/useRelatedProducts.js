import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function useRelatedProducts(category, currentProductId) {
    const { t } = useTranslation();
    const apiUrl = process.env.REACT_APP_API_URL;
    const [latestProducts, setLatestProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async (page = 1, limit = 12) => {
        try {
            let url = `${apiUrl}/products/latest?page=${page}&limit=${limit}`;
            if (category) url += `&category=${category}`;
            if (currentProductId) url += `&not=${currentProductId}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("fetch_related_products_failed");
            const data = await res.json();
            if (Array.isArray(data.products)) {
                return data.products;
            }
            return [];
        } catch (error) {
            console.error("Error fetching related products:", error);
            setError(error.message || "fetch_related_products_failed");
            toast.error(t(error.message || "fetch_related_products_failed"));
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
                setError(null);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Failed to load related products:", error);
                    setError(error.message || "fetch_related_products_failed");
                    toast.error(t(error.message || "fetch_related_products_failed"));
                }
            } finally {
                setLoading(false);
            }
        };

        loadRelatedProducts();

        return () => controller.abort();
    }, [apiUrl, category, currentProductId]);

    return { latestProducts, loading, error };
}
