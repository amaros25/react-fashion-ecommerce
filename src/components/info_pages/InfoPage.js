import React from 'react';
import { useTranslation } from 'react-i18next';

import './InfoPage.css';

const InfoPage = ({ pageKey }) => {
    const { t } = useTranslation();

    // Helper to render sections if they exist
    const renderSections = () => {
        const sections = t(`footer_pages.${pageKey}.sections`, { returnObjects: true });

        if (!Array.isArray(sections)) return null;

        return sections.map((section, index) => (
            <div key={index} className="info-section">
                {section.title && <h2>{section.title}</h2>}
                {section.image && (
                    <div className="section-image-wrapper">
                        <img src={section.image} alt={section.title || "Illustration"} className="section-image" />
                    </div>
                )}
                {section.content && <p>{section.content}</p>}
                {section.list && (
                    <ul className="section-list">
                        {section.list.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                )}
            </div>
        ));
    };

    return (
        <div className="info-page-wrapper">

            <div className="info-page-container">
                <h1>{t(`footer_pages.${pageKey}.title`)}</h1>

                {/* Render main content if sections are not used */}
                {t(`footer_pages.${pageKey}.content`) && (
                    <div className="info-page-content">
                        <p>{t(`footer_pages.${pageKey}.content`)}</p>
                    </div>
                )}

                {/* Render structured sections */}
                <div className="info-page-sections">
                    {renderSections()}
                </div>
            </div>

        </div>
    );
};

export default InfoPage;
