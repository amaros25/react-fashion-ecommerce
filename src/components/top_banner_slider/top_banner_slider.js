import React, { useState } from 'react';
import './top_banner_slider.css';

const banners = [
    './images/banner1.png',
    './images/banner2.jpg',
    './images/banner3.jpg',
];

function TopBannerSlider() {
    const [current, setCurrent] = useState(0);

    const prevSlide = () => {
        setCurrent((current - 1 + banners.length) % banners.length);
    };

    const nextSlide = () => {
        setCurrent((current + 1) % banners.length);
    };

    return (
        <div className="banner-slider">
            <button className="arrow left" onClick={prevSlide}>‹</button>
            <img src={banners[current]} alt="Banner" className="banner-image" />
            <button className="arrow right" onClick={nextSlide}>›</button>
        </div>
    );
}

export default TopBannerSlider;
