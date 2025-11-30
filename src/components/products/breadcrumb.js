import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Breadcrumb = ({ category, productName }) => {
  const { t } = useTranslation();

  return (
    <div className="breadcrumb">
      <Link to="/">{t("home")}</Link> &gt;
 
      <Link to={`/home/${category}`}>{t(`categories.${category}`)}</Link> &gt;
      <span>{productName}</span>
    </div>
  );
};

export default Breadcrumb;
