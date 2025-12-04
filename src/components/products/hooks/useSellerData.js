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

        setLoading(true);
        fetch(`${apiUrl}/sellers/${sellerId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Error fetching seller: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setSeller(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading seller:", err);
                setError(err);
                setSeller(null);
                setLoading(false);
            });
        window.scrollTo(0, 0);
    }, [sellerId, apiUrl]);

    return { seller, loading, error };
};
