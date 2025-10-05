import React, { useRef, useEffect, useState } from 'react'; // Import React and hooks: useRef, useEffect, useState

import './top_banner_slider.css'; // Import CSS for styling this component
import TopSection from '../top_section/top_section'; // Import TopSection component (e.g., for offers, bestsellers)
import { useTranslation } from "react-i18next"; // Import i18n hook for translations

function TopBannerSlider() {
    const apiUrl = process.env.REACT_APP_API_URL; // Get API base URL from environment variables
    const { t, i18n } = useTranslation(); // Initialize translation function and i18n object

    const [current, setCurrent] = useState(0); // State to track current banner index in slider
    // State to hold homepage sections data like offers and best orders
    const [sections, setSections] = useState([]);

    // Array of banner image paths for the slider
    const banners = [
        './images/banner1.png',
        './images/banner2.jpg',
        './images/banner3.jpg',
    ];

    // Extract offers and bestOrders arrays safely from fetched sections (or default to empty arrays)
    const offers = sections?.offers || [];
    const bestOrders = sections?.bestOrders || [];

    // useEffect to fetch sections data once on component mount
    useEffect(() => {
        fetch(`${apiUrl}/sections/`) // Fetch sections data from API
        .then(res => res.json())    // Parse response as JSON
        .then(data => setSections(data)) // Save data in sections state
        .catch(err => console.error('Error fetching sections:', err)); // Log any errors
    }, []); // Empty dependency array ensures this runs only once on mount

    // Function to go to previous banner slide (with wrap-around)
    const prevSlide = () => {
        setCurrent((current - 1 + banners.length) % banners.length);
    };

    // Function to go to next banner slide (with wrap-around)
    const nextSlide = () => {
        setCurrent((current + 1) % banners.length);
    };

    return (
    <div className="banner-wrapper"> {/* Wrapper div for the whole banner and sections */}
        <div className="banner-slider"> {/* Banner slider container */}
            <button className="arrow left" onClick={prevSlide}>‹</button> {/* Left arrow button */}
            <img src={banners[current]} alt="Banner" className="banner-image" /> {/* Current banner image */}
            <button className="arrow right" onClick={nextSlide}>›</button> {/* Right arrow button */}
        </div>

        {/* Section grid containing best offers and best orders */}
        <div className="section-grid">
            <TopSection title={t("categoryBanner.bestOffers")} products={offers} /> {/* Best Offers section */}
            <TopSection title={t("categoryBanner.bestOrders")} products={bestOrders} /> {/* Best Orders section */}
        </div>
    </div>
    );
}

export default TopBannerSlider; // Export component for use in other parts of the app
