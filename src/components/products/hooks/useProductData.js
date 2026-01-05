import { useState, useEffect } from 'react';



export const useProductData = (productId, refresh) => {
    console.log("# useProductData productId: ", productId);
    const apiUrl = process.env.REACT_APP_API_URL;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) {
            console.log("DEBUG useProductData: No productId, setting loading false");
            setLoading(false);
            return;
        }

        console.log("DEBUG useProductData: Fetching product", productId);
        setLoading(true);
        fetch(`${apiUrl}/products/${productId}`)
            .then(res => {
                console.log("DEBUG useProductData: Fetch response received", res.status);
                if (!res.ok) throw new Error("product_not_found");
                return res.json();
            })
            .then(data => {
                console.log("DEBUG useProductData: Data received", data._id);
                setProduct(data);
                setError(null);
            })
            .catch(err => {
                console.error("DEBUG useProductData: Error", err);
                setError(err.message === "product_not_found" ? "product_not_found" : "server_error");
            })
            .finally(() => {
                console.log("DEBUG useProductData: Finally setting loading false");
                setLoading(false);
            });
    }, [productId, apiUrl, refresh]);

    return { product, loading, error };
};