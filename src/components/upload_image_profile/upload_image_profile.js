
import { toast } from "react-toastify";
import useUploadImageApi from "./hooks/upload_image_api";

export default function useProfileImageUpload(t) {
    const apiUrl = process.env.REACT_APP_API_URL;
    const cloudName = process.env.REACT_APP_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;

    const { uploadImage, updateImage } = useUploadImageApi(cloudName, uploadPreset);

    const uploadProfileImage = async (imageFile, userId, role) => {
        if (!imageFile) {
            console.log("No Image Selected");
            return;
        }

        try {
            const imageUrl = await uploadImage(imageFile);

            if (!imageUrl) {
                toast.error(t("register.error.image_upload_failed"));
                return;
            }

            const endpoint =
                role === "seller"
                    ? `${apiUrl}/sellers/${userId}/updateImage`
                    : `${apiUrl}/users/${userId}/updateImage`;

            const updateResponse = await updateImage(endpoint, { imageUrl });

            if (!updateResponse.success) {
                console.error("Error updating image URL:", updateResponse.error);
            } else {
                toast.success(t("register.image_updated_successfully"));
            }
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error(t("register.error.image_upload_failed"));
        }
    };
    return { uploadProfileImage };

}