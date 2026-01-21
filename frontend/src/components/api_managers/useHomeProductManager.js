import { useLatestProductsQuery } from '../api_hooks/product_hooks';
import { useTranslation } from "react-i18next";

export const useHomeProductManager = (page, limit, urlCategory, urlSubcategory, searchTerm, sortBy) => {
    const { t } = useTranslation();

    // 1. Definiere die aktuellen Parameter
    const currentParams = {
        page,
        limit,
        category: urlCategory,
        subcategory: urlSubcategory,
        search: searchTerm,
        sort: sortBy
    };

    // 2. Nutze den Query Hook. 
    // Er erkennt automatisch anhand der params (im QueryKey), ob er Daten aus dem Cache nimmt oder neu lädt.
    const { data, isLoading, isError } = useLatestProductsQuery(currentParams);

    // 3. Daten ableiten (Kein useState/useEffect nötig!)
    const latestProducts = data?.products || [];
    const totalPages = data?.totalPages || 0;

    // 4. Fehler-Logik zentralisieren
    let fetchError = null;
    if (isError) {
        fetchError = t("home_error.error_while_reading_data");
    } else if (!isLoading && latestProducts.length === 0) {
        fetchError = t("home_error.noProducts");
    }

    return {
        latestProducts,
        totalPages,
        readingDataDone: !isLoading,
        readingError: isError || (latestProducts.length === 0 && !isLoading),
        fetchError
    };
};