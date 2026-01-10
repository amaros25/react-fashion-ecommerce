import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import howItWorksData from '../../data/howItWorksData.json';
import './HowItWorks.css';

const HowItWorks = () => {
    const { i18n } = useTranslation();
    const [expandedSections, setExpandedSections] = useState({});
    const [lightboxImage, setLightboxImage] = useState(null);

    // Get current language data
    const currentLang = i18n.language || 'en';
    const data = howItWorksData[currentLang] || howItWorksData.en;
    console.log(data);
    // Check if current language is RTL
    const isRTL = currentLang === 'ar';

    // Toggle section expansion
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Open lightbox
    const openLightbox = (imageSrc) => {
        setLightboxImage(imageSrc);
    };

    // Close lightbox
    const closeLightbox = () => {
        setLightboxImage(null);
    };

    const shouldUseGlobalStepImage = (steps = []) => {
        if (steps.length === 0) return false;

        const stepsWithImages = steps.filter(step => step.image);

        return (
            stepsWithImages.length === 1 &&
            steps[0].image &&
            !steps[1]?.image
        );
    };

    const getFirstStepImage = (steps = []) => {
        const stepsWithImages = steps.filter(step => step.image);
        return stepsWithImages.length > 0 ? stepsWithImages[0].image : null;
    };

    return (
        <div className={`how-it-works-wrapper ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="how-it-works-container">
                {/* Page Title */}
                <h1 className="how-it-works-title">{data.title}</h1>

                {/* Introduction - Always Visible */}
                <div className="how-it-works-intro">
                    <p>{data.intro}</p>
                </div>

                {/* Collapsible Sections */}
                <div className="how-it-works-sections">
                    {data.sections.map((section) => {
                        const isExpanded = expandedSections[section.id];

                        return (
                            <div key={section.id} className={`section-item ${isExpanded ? 'expanded' : 'collapsed'}`}>
                                {/* Section Header - Clickable */}
                                <button
                                    className="section-header"
                                    onClick={() => toggleSection(section.id)}
                                    aria-expanded={isExpanded}
                                >
                                    <h2 className="section-title">{section.title}</h2>
                                    <span className={`section-icon ${isExpanded ? 'expanded' : ''}`}>
                                        {isExpanded ? '−' : '+'}
                                    </span>
                                </button>

                                {/* Section Content - Collapsible */}
                                <div className={`section-content ${isExpanded ? 'show' : 'hide'}`}>
                                    {/* Section Description */}
                                    <p className="section-description">{section.content}</p>

                                    {/* Steps with Images Side by Side */}
                                    {/* Ersetze den Bereich innerhalb von section.steps.map durch diese Logik */}
                                    {section.steps && (
                                        <div className="section-steps-with-images">
                                            {section.steps.reduce((acc, step) => {
                                                // Wenn der Step ein Bild hat oder noch keine Gruppe existiert, erstelle neue Gruppe
                                                if (step.image || acc.length === 0) {
                                                    acc.push({ image: step.image, steps: [step] });
                                                } else {
                                                    // Wenn kein Bild, füge Text der letzten Gruppe hinzu
                                                    acc[acc.length - 1].steps.push(step);
                                                }
                                                return acc;
                                            }, []).map((group, groupIndex) => (
                                                <div key={groupIndex} className="step-group">
                                                    {/* Linke Seite: Alle Texte dieser Gruppe rücken direkt untereinander */}
                                                    <div className="step-texts-column">
                                                        {group.steps.map((s, i) => (
                                                            <div key={i} className="step-item">
                                                                <div className="step-number">{s.number}</div>
                                                                <div className="step-content">
                                                                    <h3 className="step-title">{s.title}</h3>
                                                                    <p className="step-description">{s.description}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Rechte Seite: Das Bild für diese Gruppe */}
                                                    {group.image && (
                                                        <div className="step-image-column">
                                                            <div className="step-image-container">
                                                                <img
                                                                    src={group.image}
                                                                    alt="Step illustration"
                                                                    className="step-image clickable"
                                                                    onClick={() => openLightbox(group.image)}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Note (if exists) */}
                                    {section.note && (
                                        <div className="section-note">
                                            <p>{section.note}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <div className="lightbox-content">
                        <button className="lightbox-close" onClick={closeLightbox}>×</button>
                        <img src={lightboxImage} alt="Enlarged view" className="lightbox-image" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HowItWorks;
