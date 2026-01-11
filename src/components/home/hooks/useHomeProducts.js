import { useState, useEffect, useContext, useRef } from 'react';
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
    const lastFetchedParams = useRef("");
    const isInitialMount = useRef(true);

    useEffect(() => {
        const currentParams = {
            page,
            limit,
            urlCategory,
            urlSubcategory,
            searchTerm,
            sortBy
        };
        const paramsKey = JSON.stringify(currentParams);

        // 1. Skip if these exact params are already being fetched or were just fetched
        if (lastFetchedParams.current === paramsKey && !isInitialMount.current) return;
        isInitialMount.current = false;
        lastFetchedParams.current = paramsKey;

        // 2. Check if we have these parameters in our context cache
        const isSameAsCache = cacheParams && JSON.stringify(cacheParams) === paramsKey;
        if (isSameAsCache && cachedHomeProducts.length > 0) {
            setLatestProducts(cachedHomeProducts);
            setTotalPages(cachedTotalPages);
            setReadingDataDone(true);
            return;
        }

        // 3. If no cache, prepare for fetch
        setReadingDataDone(false);
        setReadingError(false);
        // We don't clear products immediately to avoid flickering, but we can if desired
        // setLatestProducts([]); 

        const controller = new AbortController();
        let url = `${apiUrl}/products/latest?page=${page}&limit=${limit}`;
        if (urlCategory !== null && !isNaN(urlCategory)) url += `&category=${urlCategory}`;
        if (urlSubcategory !== null && !isNaN(urlSubcategory)) url += `&subcategory=${urlSubcategory}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
        if (sortBy) url += `&sort=${sortBy}`;

        fetch(url, { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                if (controller.signal.aborted) return;

                setReadingDataDone(true);

                // Always update cache params to prevent infinite loop on empty results
                setCacheParams(currentParams);

                if (!data.products || data.totalItems === 0) {
                    setLatestProducts([]);
                    setTotalPages(0);
                    setCachedHomeProducts([]);
                    setCachedTotalPages(0);
                    return;
                }

                if (Array.isArray(data.products)) {
                    setLatestProducts(data.products);
                    setTotalPages(data.totalPages);
                    setCachedHomeProducts(data.products);
                    setCachedTotalPages(data.totalPages);
                }
            })
            .catch(err => {
                if (err.name === 'AbortError') return;
                console.error('Error fetching latest products:', err);
                setReadingDataDone(true);
                setReadingError(true);
            });

        return () => controller.abort();
    }, [page, limit, urlCategory, urlSubcategory, searchTerm, sortBy, apiUrl]);
    return {
        latestProducts,
        totalPages,
        readingDataDone,
        readingError
    };
};
