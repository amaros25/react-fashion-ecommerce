import { useState } from 'react';
import { toast } from 'react-toastify';

export const useProductReview = (productId, userId, onReviewAdded) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) return toast.error("Please select a rating");

        try {
            const res = await fetch(`${apiUrl}/products/${productId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, rating, comment })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Review added successfully");
                setComment('');
                setRating(0);
                if (onReviewAdded) onReviewAdded();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Failed to add review");
        }
    };

    return {
        rating,
        setRating,
        comment,
        setComment,
        hover,
        setHover,
        handleSubmit
    };
};
