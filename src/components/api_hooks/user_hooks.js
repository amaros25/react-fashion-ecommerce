import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '../api/user_api';


export const useCreateUser = () => {
    return useMutation({
        mutationFn: (payload) => userApi.createUser({ payload }),
        onSuccess: (data) => {
            console.log("User created successfully:", data);
        },

    });
};

export const useUser = (userId, token) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => userApi.fetchUser(userId, token),
        enabled: !!userId && !!token,
        staleTime: 1000 * 60 * 5,
    });
};

export const useUpdateAddress = ({ userId, token }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (addressData) => userApi.updateAddress({ userId, addressData, token }),
        onSuccess: (response) => {
            queryClient.setQueryData(['user', userId], (oldUser) => {
                if (!oldUser) return oldUser;
                return {
                    ...oldUser,
                    address: response.address,
                    city: response.city,
                    subCity: response.subCity,
                };
            });
        },
    });
};

export const useUpdatePhone = ({ userId, token }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (phone) => userApi.updatePhone({ userId, phone, token }),
        onSuccess: (response) => {
            queryClient.setQueryData(['user', userId], (oldUser) => {
                if (!oldUser) return oldUser;
                return {
                    ...oldUser,
                    phone: response.phone
                };
            });
        },
    });
};

export const useUpdateImage = ({ userId, token }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ imageUrl }) => userApi.updateImage({ userId, imageUrl, token }),
        onSuccess: (response) => {
            queryClient.setQueryData(['user', userId], (oldUser) => {
                if (!oldUser) return oldUser;
                return {
                    ...oldUser,
                    imageUrl: response.imageUrl
                };
            });
        },
    });
};

