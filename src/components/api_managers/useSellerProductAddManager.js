import { useCreateProduct } from '../api_hooks/seller_products_hook';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

/**
 * Manager to handle the complex flow of adding a product:
 * 1. Upload images to Cloudinary
 * 2. Map UI variants to Backend structure
 * 3. Save to Database via TanStack Query
 */
export const useSellerProductAddManager = (sellerId, token) => {
    const { t } = useTranslation();
    const createMutation = useCreateProduct(token);

    /**
     * Internal helper to upload multiple files to Cloudinary
     */
    const uploadImagesToCloudinary = async (imageFiles) => {
        const cloudName = process.env.REACT_APP_CLOUD_NAME;
        const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;
        const imageUrls = [];

        for (const file of imageFiles) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: "POST", body: formData }
            );

            if (!res.ok) throw new Error("Image upload failed");
            const data = await res.json();
            imageUrls.push(data.secure_url);
        }
        return imageUrls;
    };

    /**
     * Main function to be called from the AddProduct UI
     */
    const addProduct = async (rawFormData, imageFiles) => {
        try {
            // 1. Upload images first to get URLs
            const imageUrls = await uploadImagesToCloudinary(imageFiles);

            // 2. Map the size/color variants to match the Sequelize model
            const mappedVariants = rawFormData.sizes.map(s => {
                const isCustom = s.size === t("custom_size") || (s.customSize && s.customSize.length > 0);
                const finalSize = isCustom ? s.customSize : s.size;
                return {
                    size: finalSize,
                    color: s.color,
                    stock: parseInt(s.stock) || 0
                };
            });

            // 3. Construct the final payload for our Express API
            const productPayload = {
                name: rawFormData.name,
                description: rawFormData.description,
                price: parseFloat(rawFormData.price),
                delprice: parseFloat(rawFormData.shipment_price),
                category: Number(rawFormData.category),
                subcategory: Number(rawFormData.subcategory),
                sellerId: sellerId,
                images: imageUrls,
                variants: mappedVariants,
                state: 0 // Initial state: Pending
            };

            // 4. Trigger the TanStack Query mutation
            // This will automatically invalidate the 'seller-products' cache on success
            await createMutation.mutateAsync(productPayload, token);

            toast.success(t("product_added_successfully") || "Product added!");
            return { success: true };

        } catch (err) {
            console.error("Manager Error while adding product:", err);

            // Determine the correct error message to show
            const errorKey = err.message === "Image upload failed"
                ? "image_upload_failed"
                : (err.response?.data?.error || "server_error");

            toast.error(t(errorKey));
            return { success: false, error: errorKey };
        }
    };

    return {
        addProduct,
        isSubmitting: createMutation.isPending
    };
};