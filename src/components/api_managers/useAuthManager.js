import * as userHooks from '../api_hooks/user_hooks';


export const useAuthManager = () => {
    const createMutation = userHooks.useCreateUser();
    const register = async (formData) => {
        try {
            const result = await createMutation.mutateAsync(formData);
            if (result.token) {
                localStorage.setItem('token', result.token);
            }
            return result;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    };

    return {
        register,
        isRegistering: createMutation.isPending,
        error: createMutation.error?.response?.data?.message || null
    };
};