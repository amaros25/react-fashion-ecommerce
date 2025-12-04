import { useState, useEffect } from 'react';

export const useProductData = (productId, refresh) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [mainImage, setMainImage] = useState("");

    useEffect(() => {
        fetch(`${apiUrl}/products/${productId}`)
            .then((res) => res.json())
            .then((data) => {
                setProduct(data);
                console.log(data);
                if (Array.isArray(data.image) && data.image.length > 0) {
                    setMainImage(data.image[0]);
                } else if (data.image) {
                    setMainImage(data.image);
                }

                if (data.sellerId) {
                    fetch(`${apiUrl}/sellers/${data.sellerId}`)
                        .then((res) => {
                            if (!res.ok) {
                                throw new Error(`Error fetching seller: ${res.status}`);
                            }
                            return res.json();
                        })
                        .then((sellerData) => {
                            setSeller(sellerData);
                        })
                        .catch((err) => {
                            console.error("Error loading seller:", err);
                            setSeller(null);
                        });
                } else {
                    setSeller(null);
                }
            })
            .catch((err) => {
                console.error("Error loading product:", err);
            });
        window.scrollTo(0, 0);
    }, [productId, apiUrl, refresh]);

    return {
        product,
        seller,
        mainImage,
        setMainImage
    };
};
