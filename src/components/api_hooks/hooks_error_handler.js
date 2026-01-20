import { toast } from 'react-toastify';


export const handleMutationError = (error, contextLabel) => {
    const backendMessage = error.response?.data?.message;
    const fallbackMessage = error.message || "An unexpected error occurred";
    const finalMessage = backendMessage || fallbackMessage;

    console.error(`${contextLabel} Failed:`, finalMessage);
    toast.error(finalMessage);
};
