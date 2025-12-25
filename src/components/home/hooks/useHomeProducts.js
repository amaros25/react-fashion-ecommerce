import { useState, useEffect, useContext } from 'react';
import { FilterContext } from '../../filter_context/filter_context';

export const useHomeProducts = (page, limit, urlCategory, urlSubcategory, searchTerm, sortBy) => {
    const apiUrl = process.env.REACT_APP_API_URL;

    // Consume global cache from Context
    const {
        cachedHomeProducts,
        setCachedHomeProducts,
        cachedTotalPages,
        setCachedTotalPages,
        cacheParams,
        setCacheParams
    } = useContext(FilterContext);

    // Initialize state with cached values if they exist and params match?
    // Actually, local state might not be needed if we return context values, but purely using context values might cause jitter if we clear them.
    // Let's keep local state for component, but initialize via effect.

    // Better: We rely on the fact that if cache matches, we use it directly.
    // However, the hook returns `latestProducts` and `totalPages`.
    // We can sync local state with context.

    const [latestProducts, setLatestProducts] = useState(cachedHomeProducts || []);
    const [totalPages, setTotalPages] = useState(cachedTotalPages || 0);

    useEffect(() => {
        // Construct current params object for comparison
        const currentParams = {
            page,
            limit,
            urlCategory,
            urlSubcategory,
            searchTerm,
            sortBy
        };

        // Helper to compare params
        const isSameParams = (p1, p2) => {
            if (!p1 || !p2) return false;
            return JSON.stringify(p1) === JSON.stringify(p2);
        };

        // CHECK CACHE FIRST
        if (isSameParams(currentParams, cacheParams) && cachedHomeProducts.length > 0) {
            console.log("CACHE HIT: Using cached products, no fetch.");
            setLatestProducts(cachedHomeProducts);
            setTotalPages(cachedTotalPages);
            return; // EXIT EARLY - NO FETCH
        }

        console.log("CACHE MISS: Fetching new data...");
        // Do NOT clear products here to avoid white Flash if possible, or maybe just clear if we are indeed fetching new page.
        // If we switch page, we probably want to show loading or empty.
        // If we navigate back, we hit cache.
        // So for new fetch, clearing is okay, but maybe optional.
        // setLatestProducts([]); // Uncomment to show empty while loading, keep commented to show stale?
        // User asked: "prevent white page". So ideally don't clear if we can avoid it, but mixing data is bad.
        // But here we are fetching NEW data. So showing old data is misleading.
        // However, the "white page" complaint was about navigating BACK.
        // Navigation BACK implies params are same. So we hit the Cache block above.
        // So this block only runs for NEW params (e.g. Page 2).
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

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.products)) {
                    // Update Local State
                    setLatestProducts(data.products);
                    setTotalPages(data.totalPages);

                    // Update Cache in Context
                    setCachedHomeProducts(data.products);
                    setCachedTotalPages(data.totalPages);
                    setCacheParams(currentParams);
                } else {
                    setLatestProducts([]);
                    setTotalPages(0);
                }
            })
            .catch(err => console.error('Error fetching latest products:', err));
    }, [page, limit, urlCategory, urlSubcategory, searchTerm, sortBy, apiUrl, cacheParams, cachedHomeProducts, cachedTotalPages, setCachedHomeProducts, setCachedTotalPages, setCacheParams]);

    return {
        latestProducts,
        totalPages
    };
};
