import React, { useRef, useEffect, useState } from 'react'; // Import React and hooks: useRef, useEffect, useState
import { useMemo } from 'react';

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
        'https://res.cloudinary.com/ddclvkost/image/upload/v1759689511/banner1_bkjkc4.png',
        './images/banner2.jpg',
        './images/banner3.jpg',
    ];

    // Extract offers and bestOrders arrays safely from fetched sections (or default to empty arrays)
    const offers = useMemo(() => sections?.offers || [], [sections]);
    const bestOrders = useMemo(() => sections?.bestOrders || [], [sections]);
    const [offersToShow, setOffersToShow] = useState([]);
    const [bestOrdersToShow, setBestOrdersToShow] = useState([]);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth); // Track screen width

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


    // Update screen width when window is resized
    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [])

    // Function to select 3 random items from a given array
    const getRandomItems = (array, numItems) => {
        const shuffled = [...array].sort(() => 0.5 - Math.random()); // Shuffle the array
        return shuffled.slice(0, numItems); // Return the first 'numItems' items
    };

    // Select random items based on screen size (only for mobile/tablet)
    useEffect(() => {
        if (screenWidth <= 768) {  // For mobile or tablet
            setOffersToShow(getRandomItems(offers, 6)); // Select 3 random offers
            setBestOrdersToShow(getRandomItems(bestOrders, 6)); // Select 3 random best orders
        } else {
            setOffersToShow(offers); // Show all offers on larger screens
            setBestOrdersToShow(bestOrders); // Show all best orders on larger screens
        }
    }, [screenWidth, offers, bestOrders]); // Re-run when screen width or offers change

    return (
        <div className="banner-wrapper"> {/* Wrapper div for the whole banner and sections */}
            <div className="banner-slider"> {/* Banner slider container */}
                <button className="arrow left" onClick={prevSlide}>‹</button> {/* Left arrow button */}
                <img src={banners[current]} alt="Banner" className="banner-image" loading="lazy" /> {/* Current banner image */}
                <button className="arrow right" onClick={nextSlide}>›</button> {/* Right arrow button */}
            </div>

            {/* Section grid containing best offers and best orders */}
            <div className="section-grid">

                <TopSection title={t("categoryBanner.bestOffers")} products={offersToShow} /> {/* Best Offers section */}
                <TopSection title={t("categoryBanner.bestOrders")} products={bestOrdersToShow} className="best-orders" /> {/* Best Orders section */}

            </div>
        </div>
    );
}

export default TopBannerSlider; // Export component for use in other parts of the app
