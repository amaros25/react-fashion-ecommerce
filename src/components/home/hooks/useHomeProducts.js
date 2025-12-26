import { useState, useEffect, useContext } from 'react';
import { FilterContext } from '../../filter_context/filter_context';

export const useHomeProducts = (page, limit, urlCategory, urlSubcategory, searchTerm, sortBy) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const {
        cachedHomeProducts,
        setCachedHomeProducts,
        cachedTotalPages,
        setCachedTotalPages,
        cacheParams,
        setCacheParams
    } = useContext(FilterContext);

    const [latestProducts, setLatestProducts] = useState(cachedHomeProducts || []);
    const [totalPages, setTotalPages] = useState(cachedTotalPages || 0);
    const [readingDataDone, setReadingDataDone] = useState(false);
    const [readingError, setReadingError] = useState(false);
    useEffect(() => {
        const currentParams = {
            page,
            limit,
            urlCategory,
            urlSubcategory,
            searchTerm,
            sortBy
        };
        const isSameParams = (p1, p2) => {
            if (!p1 || !p2) return false;
            return JSON.stringify(p1) === JSON.stringify(p2);
        };
        if (isSameParams(currentParams, cacheParams) && cachedHomeProducts.length > 0) {
            console.log("CACHE HIT: Using cached products, no fetch.");
            setLatestProducts(cachedHomeProducts);
            setTotalPages(cachedTotalPages);
            setReadingDataDone(true);
            return;
        }
        console.log("CACHE MISS: Fetching new data...");
        setLatestProducts([]);
        setTotalPages(0);

        let url = `${apiUrl}/products/latest?page=${page}&limit=${limit}`;
        if (urlCategory !== null && !isNaN(urlCategory)) {
            url += `&category=${urlCategory}`;
        }
        if (urlSubcategory !== null && !isNaN(urlSubcategory) && urlSubcategory > 0) {
            url += `&subcategory=${urlSubcategory - 1}`;
        }
        if (searchTerm) {
            url += `&search=${encodeURIComponent(searchTerm)}`;
        }
        if (sortBy) {
            url += `&sort=${sortBy}`;
        }
        setReadingDataDone(false);
        setReadingError(false);
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setReadingDataDone(true);
                if (data.totalItems == 0) {
                    setLatestProducts([]);
                    setTotalPages(0);
                    return;
                }
                if (Array.isArray(data.products)) {
                    setLatestProducts(data.products);
                    setTotalPages(data.totalPages);
                    setCachedHomeProducts(data.products);
                    setCachedTotalPages(data.totalPages);
                    setCacheParams(currentParams);
                } else {
                    setLatestProducts([]);
                    setTotalPages(0);
                }
            })
            .catch(err => {
                console.error('Error fetching latest products:', err);
                setReadingDataDone(true);
                setReadingError(true);
            });
    }, [page, limit, urlCategory, urlSubcategory, searchTerm, sortBy, apiUrl, cacheParams, cachedHomeProducts, cachedTotalPages, setCachedHomeProducts, setCachedTotalPages, setCacheParams]);
    return {
        latestProducts,
        totalPages,
        readingDataDone,
        readingError
    };
};
