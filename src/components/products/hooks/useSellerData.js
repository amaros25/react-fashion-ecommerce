import { useState, useEffect } from "react";

export const useSellerData = (sellerId) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sellerId) {
            setSeller(null);
            setLoading(false);
            return;
        }
        const fetchSeller = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${apiUrl}/users/public-seller/${sellerId}`, { method: "GET", });
                if (!res.ok) {
                    throw new Error(res.status === 404 ? "user_not_found" : "server_error");
                }
                const data = await res.json();
                console.log("Seller: ", data);
                setSeller(data);
            } catch (err) {
                setError(err.message);
                setSeller(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSeller();
        window.scrollTo(0, 0);
    }, [sellerId, apiUrl]);
    return { seller, loading, error };
};
