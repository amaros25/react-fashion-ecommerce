import { useState, useEffect } from 'react';



export const useProductData = (productId, refresh) => {
    console.log("# useProductData productId: ", productId);
    const apiUrl = process.env.REACT_APP_API_URL;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) return;

        setLoading(true);
        fetch(`${apiUrl}/products/${productId}`)
            .then(res => {
                if (!res.ok) throw new Error("product_not_found");
                return res.json();
            })
            .then(data => {
                setProduct(data);
                setError(null);
            })
            .catch(err => {
                setError(err.message === "product_not_found" ? "product_not_found" : "server_error");
            })
            .finally(() => setLoading(false));
    }, [productId, apiUrl, refresh]);

    return { product, loading, error };
};