import { useState } from "react";

export default function useRegisterApi(apiUrl, cloudName, uploadPreset) {

    const uploadImage = async (imageFile) => {

        if (!imageFile) return "";

        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Image upload failed");

        const data = await res.json();
        return data.secure_url;
    };

    const registerUser = async (endpoint, payload) => {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const text = await res.text();
        let data = {};

        try {
            data = JSON.parse(text);
        } catch {
            data = { message: "Unknown error" };
        }

        if (!res.ok) {
            throw new Error(data.message || "Registration failed");
        }

        return data;
    };

    return { uploadImage, registerUser };
}
