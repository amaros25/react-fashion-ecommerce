import { useState, useEffect } from "react";

export const useSellerData = (sellerId) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sellerId) {
            console.log("DEBUG useSellerData: No sellerId, setting loading false");
            setSeller(null);
            setLoading(false);
            return;
        }
        console.log("DEBUG useSellerData: Fetching seller", sellerId);
        setLoading(true);
        fetch(`${apiUrl}/sellers/${sellerId}`)
            .then((res) => {
                console.log("DEBUG useSellerData: Fetch response received", res.status);
                if (!res.ok) {
                    throw new Error(res.status === 404 ? "seller_not_found" : "server_error");
                }
                return res.json();
            })
            .then((data) => {
                console.log("DEBUG useSellerData: Data received", data._id);
                setSeller(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("DEBUG useSellerData: Error", err);
                setError(err.message || "server_error");
                setSeller(null);
                setLoading(false);
            });
        window.scrollTo(0, 0);
    }, [sellerId, apiUrl]);

    return { seller, loading, error };
};
