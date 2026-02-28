import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import "./css/rating_trigger.css";

const RatingTrigger = ({ rating, onRateClick, t, isRated, label }) => {
    const renderStars = (currentRating) => (
        <div className="rating-trigger-stars">
            {[...Array(5)].map((_, i) => (
                i < currentRating ?
                    <FaStar key={i} className="star-active" /> :
                    <FaRegStar key={i} className="star-empty" />
            ))}
        </div>
    );

    return (
        <div
            className={`rating-trigger-container ${!isRated ? 'clickable' : ''}`}
            onClick={!isRated ? onRateClick : undefined}
            role={!isRated ? "button" : "presentation"}
        >
            <div className="rating-trigger-content">
                {renderStars(isRated ? rating : 0)}
            </div>
        </div>
    );
};

export default RatingTrigger;
