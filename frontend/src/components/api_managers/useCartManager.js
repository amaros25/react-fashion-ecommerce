import { useState, useEffect, useMemo } from 'react';
import { useSellersByIds } from '../api_hooks/cart_hooks';
import { useCreateOrder } from '../api_hooks/order_hooks';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

/**
 * Manager to handle Cart logic: localStorage state, grouping, and order submission.
 */
export const useCartManager = (userId, token, queryClient) => {
    const { t } = useTranslation();
    const [cart, setCart] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Initial load from localStorage
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);
    }, []);

    // Group items by sellerId
    const groupedCart = useMemo(() => {
        return cart.reduce((acc, item) => {
            if (!acc[item.sellerId]) acc[item.sellerId] = [];
            acc[item.sellerId].push(item);
            return acc;
        }, {});
    }, [cart]);

    // Unique seller IDs for fetching names
    const sellerIds = useMemo(() => Object.keys(groupedCart), [groupedCart]);

    // Fetch seller details (shopNames)
    const { data: sellersData, isLoading: isLoadingSellers } = useSellersByIds(sellerIds, token);

    // Normalize sellers into a map
    const sellersMap = useMemo(() => {
        if (!sellersData || !Array.isArray(sellersData)) return {};
        return sellersData.reduce((acc, seller) => {
            acc[seller.id] = seller;
            return acc;
        }, {});
    }, [sellersData]);

    const { mutateAsync: createOrderMutation } = useCreateOrder(userId);

    const handleRemoveItem = (sellerId, index) => {
        const itemToRemove = groupedCart[sellerId][index];

        let removed = false;
        const newCart = cart.filter((item) => {
            if (!removed &&
                item.productId === itemToRemove.productId &&
                item.variantId === itemToRemove.variantId) {
                removed = true;
                return false;
            }
            return true;
        });

        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    const submitGroups = async (user_data, isDelivery, orderStatus, paymentMethod) => {
        if (!userId || !token) {
            toast.error(t("product_page.must_login"));
            return { success: false, loginRequired: true };
        }

        if (!user_data?.phone) {
            toast.error(t("error_missing_phone") || "Phone number is missing");
            return { success: false };
        }

        if (isDelivery) {
            if (!user_data?.address) {
                toast.error(t("cart_page.address_required") || "Please add your delivery address first");
                return { success: false };
            }
            if (user_data.city === null || user_data.city === undefined) {
                toast.error(t("error_missing_city") || "City is missing");
                return { success: false };
            }
        }

        const selectedAddress = {
            phone: user_data.phone || "",
            ...(isDelivery && {
                address: user_data.address || "",
                city: user_data.city || 0,
                subCity: user_data.subCity || 0
            })
        };

        setIsSubmitting(true);
        try {
            for (const [sellerId, items] of Object.entries(groupedCart)) {
                const formattedItems = items.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    color: item.color,
                    size: item.size,
                    quantity: item.quantity,
                }));

                const orderData = {
                    userId,
                    sellerId,
                    items: formattedItems,
                    status: [{ update: orderStatus, date: new Date() }],
                    notes: "",
                    paymentMethod: paymentMethod,
                    is_delivery: isDelivery,
                    selectedAddress,
                };

                const result = await createOrderMutation({ orderData, token });

                // If Flouci returns a payment URL, redirect to it
                if (result.success && result.result_url) {
                    window.location.href = result.result_url;
                    return { success: true, redirecting: true };
                }
            }

            toast.success(t("orders_created_success"));
            localStorage.removeItem("cart");
            setCart([]);
            return { success: true };
        } catch (err) {
            console.error("Error creating multiple orders:", err);
            const msg = err.response?.data?.message || "orders_created_error";
            toast.error(t(msg));
            return { success: false };
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        cart,
        groupedCart,
        sellersMap,
        isLoadingSellers,
        isSubmitting,
        handleRemoveItem,
        submitGroups,
    };
};
