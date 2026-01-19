import imageCompression from 'browser-image-compression';

/**
 * Hook for uploading images to Cloudinary with automatic compression.
 * Balances quality and file size for professional results.
 */
export default function useUploadImageApi(cloudName, uploadPreset) {

    const uploadImage = async (imageFile) => {
        if (!imageFile) return "";

        const options = {
            maxSizeMB: 2,             // 2MB limit for high quality product/profile images
            maxWidthOrHeight: 2048,   // 2K resolution (good for zoom)
            useWebWorker: true,
            initialQuality: 0.9,      // High initial quality (90%)
        };

        try {
            // 1. Compress image locally in the browser
            const compressedFile = await imageCompression(imageFile, options);

            // 2. Prepare FormData
            const formData = new FormData();
            formData.append("file", compressedFile);
            formData.append("upload_preset", uploadPreset); // Fixed name to match argument

            // 3. Upload to Cloudinary
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Image upload failed");

            const data = await res.json();

            // Pro-Tip: Add Cloudinary optimization flags to the URL
            // This ensures f_auto (WebP/AVIF) and q_auto (AI-compression) on delivery
            const optimizedUrl = data.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");

            return optimizedUrl;

        } catch (error) {
            console.error("Image processing/upload failed:", error);
            throw error; // Rethrow so the component can show a toast error
        }
    };

    return { uploadImage };
}