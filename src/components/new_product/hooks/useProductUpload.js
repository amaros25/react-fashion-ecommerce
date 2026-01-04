import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const useProductUpload = (userId) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const cloudName = process.env.REACT_APP_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [status, setStatus] = useState({
        visible: false,
        loading: false,
        success: false,
        error: false,
    });

    const uploadImages = async (imageFiles) => {
        const imageUrls = [];
        for (const file of imageFiles) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            if (!res.ok) throw new Error("Image upload failed");
            const data = await res.json();
            imageUrls.push(data.secure_url);
        }
        return imageUrls;
    };

    const createProduct = async (formData, imageFiles) => {
        setStatus({ visible: true, loading: true, success: false, error: false, errorKey: null });
        try {
            const imageUrls = await uploadImages(imageFiles);

            const productData = {
                ...formData,
                category: Number(formData.category),
                subcategory: Number(formData.subcategory),
                sizes: formData.sizes.map(s => ({
                    ...s,
                    size: s.size === t("custom_size") ? s.customSize : s.size
                })),
                sellerId: userId,
                price: parseFloat(formData.price),
                image: imageUrls,
                delprice: parseFloat(formData.shipment_price),
                state: 0
            };

            const res = await fetch(`${apiUrl}/products/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "error_adding_product");
            }

            setStatus({ visible: true, loading: false, success: true, error: false, errorKey: null });
            setTimeout(() => {
                setStatus({ visible: false, loading: false, success: false, error: false, errorKey: null });
                navigate("/profile_seller");
            }, 3000);
            return true;
        } catch (err) {
            console.error("🟢 : Error", err.message);
            setStatus({
                visible: true,
                loading: false,
                success: false,
                error: true,
                errorKey: err.message === "Image upload failed" ? "image_upload_failed" : (err.message || "server_error")
            });
            return false;
        }
    };

    return {
        status,
        createProduct
    };
};
