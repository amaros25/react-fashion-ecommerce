import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Breadcrumb = ({ category, subCategory, productName }) => {
  const { t } = useTranslation();

  const categoryKeys = ["womens", "mens", "kids"];

  const subCategories = {
    womens: ["clothes", "shoes", "bags", "accessories", "beauty", "other-women"],
    mens: ["clothes", "shoes", "accessories", "other-mens"],
    kids: ["girls-clothing", "boys-lothing", "baby-clothing", "other-kids"]
  };

  return (
    <div className="breadcrumb">
      <Link to="/">{t("home")}</Link> &gt;

      <Link to={`/home/${category}`}>{t(`main-categories.${categoryKeys[category]}`)}  &gt;
        {t(`${subCategories[categoryKeys[category]][subCategory]}`)}</Link> &gt;

      <span>{productName}</span>
    </div>
  );
};

export default Breadcrumb;
