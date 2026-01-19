import { useState, useEffect, useContext, useRef } from 'react';
import { FilterContext } from '../../filter_context/filter_context';

export const useHomeProducts = (page, limit, urlCategory, urlSubcategory, searchTerm, sortBy) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const {
        cachedHomeProducts, setCachedHomeProducts,
        cachedTotalPages, setCachedTotalPages,
        cacheParams, setCacheParams
    } = useContext(FilterContext);

    const [latestProducts, setLatestProducts] = useState(cachedHomeProducts || []);
    const [totalPages, setTotalPages] = useState(cachedTotalPages || 0);
    const [readingDataDone, setReadingDataDone] = useState(false);
    const [readingError, setReadingError] = useState(false);
    const lastFetchedParams = useRef("");
    const isInitialMount = useRef(true);

    useEffect(() => {
        const currentParams = { page, limit, urlCategory, urlSubcategory, searchTerm, sortBy };
        const paramsKey = JSON.stringify(currentParams);

        if (lastFetchedParams.current === paramsKey && !isInitialMount.current) return;
        isInitialMount.current = false;
        lastFetchedParams.current = paramsKey;

        const isSameAsCache = cacheParams && JSON.stringify(cacheParams) === paramsKey;
        if (isSameAsCache && cachedHomeProducts && cachedHomeProducts.length > 0) {
            setLatestProducts(cachedHomeProducts);
            setTotalPages(cachedTotalPages);
            setReadingDataDone(true);
            return;
        }

        setReadingDataDone(false);
        setReadingError(false);

        const controller = new AbortController();

        let url = `${apiUrl}/products/latest?page=${page}&limit=${limit}`;

        // Sauberere URL-Konstruktion
        if (urlCategory) url += `&category=${urlCategory}`;
        if (urlSubcategory) url += `&subcategory=${urlSubcategory}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
        if (sortBy) url += `&sort=${sortBy}`;

        fetch(url, { signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then(data => {
                if (controller.signal.aborted) return;

                setReadingDataDone(true);
                setCacheParams(currentParams);

                // Sequelize gibt die Produkte in data.products (rows) zurück
                const products = data.products || [];
                const totalP = data.totalPages || 0;
                console.log("products", products);
                setLatestProducts(products);
                setTotalPages(totalP);
                setCachedHomeProducts(products);
                setCachedTotalPages(totalP);
            })
            .catch(err => {
                if (err.name === 'AbortError') return;
                console.error('Error fetching latest products:', err);
                setReadingDataDone(true);
                setReadingError(true);
            });

        return () => controller.abort();
    }, [page, limit, urlCategory, urlSubcategory, searchTerm, sortBy, apiUrl]);

    return { latestProducts, totalPages, readingDataDone, readingError };
};