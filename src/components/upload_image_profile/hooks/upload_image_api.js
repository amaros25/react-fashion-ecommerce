
export default function useUploadImageApi(cloudName, uploadPreset) {

    const uploadImage = async (imageFile) => {
        if (!imageFile) return "";
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", uploadPreset);
        console.log("uploadImage formData: ", formData);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });
        if (!res.ok) throw new Error("Image upload failed");
        const data = await res.json();
        console.log("uploadImage data: ", data);
        return data.secure_url;
    };

    const updateImage = async (endpoint, payload) => {
        console.log("updateImage endpoint: ", endpoint);
        console.log("updateImage payload: ", payload);
        try {
            const res = await fetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            console.log("data: ", data);
            if (res.ok) {
                return { success: true };
            } else {
                console.log("data.message: ", data.message);
                return { success: false, error: data.message };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };
    return { uploadImage, updateImage };
}