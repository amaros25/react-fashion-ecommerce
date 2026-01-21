import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '../api/user_api';
import { handleMutationError } from './hooks_error_handler';


const shouldNotRetry = (failureCount, error) => {
    if (error.response?.status === 403 || error.response?.status === 400) {
        return false;
    }
    return failureCount < 1;
};

export const useCreateUser = () => {
    return useMutation({
        mutationFn: (payload) => userApi.createUser({ payload }),
        onSuccess: (data) => {
            console.log("User created successfully:", data);
        },
        onError: (error) => {
            handleMutationError(error, "User Creation");
        },
        retry: false,

    });
};

export const useUser = (userId, token) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => userApi.fetchUser(userId, token),
        enabled: !!userId && !!token,
        staleTime: 1000 * 60 * 5,
        retry: shouldNotRetry,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export const useUpdateAddress = ({ userId, token }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (addressData) => userApi.updateAddress({ userId, addressData, token }),
        onSuccess: (response) => {
            queryClient.setQueryData(['user', userId], (oldUser) => {
                if (!oldUser) return oldUser;
                const source = response.user || response;
                return {
                    ...oldUser,
                    address: source.address ?? oldUser.address,
                    city: source.city ?? oldUser.city,
                    subCity: source.subCity ?? oldUser.subCity,
                };
            });
        },
        onError: (error) => {
            handleMutationError(error, "Address Update");
        },
        retry: false,
    });
};

export const useUpdatePhone = ({ userId, token }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (phone) => userApi.updatePhone({ userId, phone, token }),
        onSuccess: (response) => {
            queryClient.setQueryData(['user', userId], (oldUser) => {
                if (!oldUser) return oldUser;
                const source = response.user || response;
                return {
                    ...oldUser,
                    phone: source.phone ?? oldUser.phone
                };
            });
        },
        onError: (error) => {
            handleMutationError(error, "Phone Update");
        },
        retry: false,
    });
};

export const useUpdateImage = ({ userId, token }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ imageUrl }) => userApi.updateImage({ userId, imageUrl, token }),
        onSuccess: (response) => {
            queryClient.setQueryData(['user', userId], (oldUser) => {
                if (!oldUser) return oldUser;
                const source = response.user || response;
                return {
                    ...oldUser,
                    imageUrl: source.imageUrl ?? oldUser.imageUrl
                };
            });
        },
        onError: (error) => {
            handleMutationError(error, "Image Update");
        },
        retry: false,
    });
};

export const useIncrementViews = () => {
    return useMutation({
        mutationFn: (userId) => userApi.incrementViews(userId),
        onSuccess: (data) => {
            console.log("Views incremented:", data);
        },
        onError: (error) => {
            console.error("Failed to increment views:", error);
        }
    });
};

