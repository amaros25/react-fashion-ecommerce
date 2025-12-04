import { useEffect, useState } from "react";

export default function useRelatedProducts(category, currentProductId) {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [latestProducts, setLatestProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let controller = new AbortController();

        const fetchProducts = async () => {
            try {
                let url = `${apiUrl}/products/latest?page=1&limit=12`;

                if (category) url += `&category=${category}`;
                if (currentProductId) url += `&not=${currentProductId}`;

                const res = await fetch(url, { signal: controller.signal });
                const data = await res.json();

                if (Array.isArray(data.products)) {
                    const filtered = data.products.filter(
                        (p) => p._id !== currentProductId
                    );
                    setLatestProducts(filtered);
                } else {
                    setLatestProducts([]);
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Error fetching related products:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        return () => controller.abort();
    }, [apiUrl, category, currentProductId]);

    return { latestProducts, loading };
}
