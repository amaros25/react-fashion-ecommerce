import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product_api';

/**
 * Hook zum Abrufen von Produktdetails.
 * @param {number|string} id - Die Produkt-ID.
 * @param {boolean} hasInitialData - Flag, ob Basis-Daten bereits vorhanden sind (aus location.state).
 */
export const useProductDetailQuery = (id, initialProduct) => {
    return useQuery({
        // Der QueryKey unterscheidet sich je nach Modus, um Cache-Konflikte zu vermeiden
        queryKey: ['product', id],

        queryFn: async () => {
            if (initialProduct) {
                const remainingData = await productApi.getRemainingProductDetails(id);
                return { ...initialProduct, ...remainingData };
            } else {
                // Alles laden (bei F5 oder Direkt-Link)
                return await productApi.getProductDetailsComplete(id);
            }
        },

        // Verhindert unnötiges Refetchen beim Navigieren
        staleTime: 1000 * 60 * 10, // 10 Minuten Cache

        // Behält die alten Daten, während im Hintergrund neue geladen werden
        keepPreviousData: true,
        placeholderData: initialProduct ? initialProduct : undefined,
        // Fehlerbehandlung (Optional)
        retry: 1,
        enabled: !!id, // Query wird nur ausgeführt, wenn eine ID vorhanden ist
    });
};