import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './foot.css';

export default function Foot() {
  const { t } = useTranslation();

  return (
    <footer className="footer-container">
      <div className="footer-columns">
        <div className="footer-column">
          <h3>Cmandi</h3>
          <ul>
            <li><Link to="/about-us">{t('footer_pages.about_us.title')}</Link></li>
            <li><Link to="/sustainability">{t('footer_pages.sustainability.title')}</Link></li>
            <li><Link to="/press">{t('footer_pages.press.title')}</Link></li>
            <li><Link to="/advertising">{t('footer_pages.advertising.title')}</Link></li>
            <li><Link to="/accessibility">{t('footer_pages.accessibility.title')}</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Discover</h3>
          <ul>
            <li><Link to="/how-it-works">{t('footer_pages.how_it_works.title')}</Link></li>
            <li><Link to="/article-verification">{t('footer_pages.article_verification.title')}</Link></li>
            <li><Link to="/mobile-apps">{t('footer_pages.mobile_apps.title')}</Link></li>
            <li><Link to="/info-board">{t('footer_pages.info_board.title')}</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Help</h3>
          <ul>
            <li><Link to="/help-center">{t('footer_pages.help_center.title')}</Link></li>
            <li><Link to="/sell">{t('footer_pages.sell.title')}</Link></li>
            <li><Link to="/buy">{t('footer_pages.buy.title')}</Link></li>
            <li><Link to="/trust-safety">{t('footer_pages.trust_safety.title')}</Link></li>
          </ul>
        </div>
      </div>
      <hr className="footer-divider" />
      <nav className="footer-horizontal-menu">
        <ul>
          <li><Link to="/privacy-center">{t('footer_pages.privacy_center.title')}</Link></li>
          <li><Link to="/cookie-notices">{t('footer_pages.cookie_notices.title')}</Link></li>
          <li><Link to="/cookie-settings">{t('footer_pages.cookie_settings.title')}</Link></li>
          <li><Link to="/terms-conditions">{t('footer_pages.terms_conditions.title')}</Link></li>
          <li><Link to="/our-platform">{t('footer_pages.our_platform.title')}</Link></li>
        </ul>
      </nav>
    </footer>
  );
}
