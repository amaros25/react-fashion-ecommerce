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
    const imageMutation = userHooks.useUpdateImage({ userId, token });

    // 2. Combine loading states to provide a global loading indicator
    const isLoading =
        userQuery.isLoading ||
        addressMutation.isPending ||
        phoneMutation.isPending ||
        imageMutation.isPending;

    // 3. Aggregate error messages from all operations

    const getErrorMessage = (mutation) => {
        return mutation.error?.response?.data?.message || mutation.error?.message || null;
    };
    const error =
        getErrorMessage(phoneMutation) ||
        getErrorMessage(addressMutation) ||
        getErrorMessage(imageMutation) ||
        (userQuery.error ? "fetch_user_failed" : null);

    // 4. Return unified data, status, and action functions
    return {
        // Data and status
        user: userQuery.data,
        loading: isLoading,
        error: error,

        // Specific pending states (useful for disabling specific buttons)
        isUpdatingAddress: addressMutation.isPending,
        isUpdatingPhone: phoneMutation.isPending,
        isUpdatingImage: imageMutation.isPending,

        // Action functions
        updateAddress: addressMutation.mutateAsync,
        updatePhone: phoneMutation.mutateAsync,
        updateImage: imageMutation.mutateAsync,
        refetch: userQuery.refetch
    };
};