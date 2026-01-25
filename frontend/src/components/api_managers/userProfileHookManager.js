import { useEffect } from 'react';
import * as userHooks from '../api_hooks/user_hooks';


/**
 * Manager hook that orchestrates user-related queries and mutations.
 * It provides a unified interface for fetching and updating user profile data.
 */
export const useUserProfileManager = (userId, token) => {
    // 1. Initialize individual query and mutation hooks
    const userQuery = userHooks.useUser(userId, token);
    const addressMutation = userHooks.useUpdateAddress({ userId, token });
    const phoneMutation = userHooks.useUpdatePhone({ userId, token });
    const shopNameMutation = userHooks.useUpdateShopName({ userId, token });
    const imageMutation = userHooks.useUpdateImage({ userId, token });




    // 2. Combine loading states to provide a global loading indicator
    const isProcessing =
        userQuery.isLoading ||
        addressMutation.isPending ||
        phoneMutation.isPending ||
        shopNameMutation.isPending ||
        imageMutation.isPending;

    // 3. Aggregate error messages from all operations

    const extractBackendError = (err) => {
        if (!err) return null;
        return err.response?.data?.message || err.message || "operation_failed";
    };

    const combinedError =
        extractBackendError(phoneMutation.error) ||
        extractBackendError(shopNameMutation.error) ||
        extractBackendError(addressMutation.error) ||
        extractBackendError(imageMutation.error) ||
        extractBackendError(userQuery.error);

    // 4. Return unified data, status, and action functions
    return {
        // Data and status
        user: userQuery.data,
        loading: isProcessing,
        error: combinedError,

        addressMutation,
        phoneMutation,
        imageMutation,

        // Specific pending states (useful for disabling specific buttons)
        isUpdatingAddress: addressMutation.isPending,
        isUpdatingPhone: phoneMutation.isPending,
        isUpdatingShopName: shopNameMutation.isPending,
        isUpdatingImage: imageMutation.isPending,

        // Action functions
        updateAddress: addressMutation.mutateAsync,
        updatePhone: phoneMutation.mutateAsync,
        updateShopName: shopNameMutation.mutateAsync,
        updateImage: imageMutation.mutateAsync,
        refetch: userQuery.refetch
    };
};