import { useState, useEffect } from 'react';



export const useProductData = (productId, refresh) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [product, setProduct] = useState(null);
    console.log("ProductPage useProductData productId:", productId);
    useEffect(() => {
        if (!productId) return;

        fetch(`${apiUrl}/products/${productId}`)
            .then(res => res.json())
            .then(data => setProduct(data))
            .catch(err => console.error("Error loading product:", err));
    }, [productId, apiUrl, refresh]);

    return { product };
};