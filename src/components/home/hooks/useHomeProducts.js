import { useState, useEffect } from 'react';

export const useHomeProducts = (page, limit, urlCategory, urlSubcategory, searchTerm, sortBy) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [latestProducts, setLatestProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        setLatestProducts([]);
        setTotalPages(0);

        let url = `${apiUrl}/products/latest?page=${page}&limit=${limit}`;

        // Send numeric category if available
        if (urlCategory !== null && !isNaN(urlCategory)) {
            url += `&category=${urlCategory}`;
        }

        // Send numeric subcategory if available
        // urlSubcategory 0 = "all-*" (z.B. "all-women") -> send nothing (get all)
        // urlSubcategory 1+ = specific subcategory -> send index-1 (because first real subcategory is index 0 in DB)
        if (urlSubcategory !== null && !isNaN(urlSubcategory) && urlSubcategory > 0) {
            url += `&subcategory=${urlSubcategory - 1}`;
        }

        if (searchTerm) {
            url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        if (sortBy) {
            url += `&sort=${sortBy}`;
        }

        console.log("Fetching products with URL:", url);

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.products)) {
                    console.log("Fetched products:", data.products);
                    setLatestProducts(data.products);
                    setTotalPages(data.totalPages);
                } else {
                    setLatestProducts([]);
                    setTotalPages(0);
                }
            })
            .catch(err => console.error('Error fetching latest products:', err));
    }, [page, urlCategory, urlSubcategory, searchTerm, sortBy, apiUrl, limit]);

    return {
        latestProducts,
        totalPages
    };
};
