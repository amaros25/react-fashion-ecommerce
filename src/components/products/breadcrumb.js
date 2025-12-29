import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categoryKeys, subCategories } from '../utils/const/category';

const Breadcrumb = ({ category, subCategory, productName }) => {
  const { t } = useTranslation();

  const currentCategoryKey = categoryKeys[category];
  const currentSubCategoryKey = subCategories[currentCategoryKey]?.[subCategory];

  return (
    <div className="breadcrumb">
      <Link to="/">{t("home")}</Link> &gt;

      <Link to={`/home/${currentCategoryKey}`}>{t(`main-categories.${currentCategoryKey}`)}</Link> &gt;

      <Link to={`/home/${currentCategoryKey}/${currentSubCategoryKey}`}>
        {t(`${currentSubCategoryKey}`)}
      </Link> &gt;

      <span>{productName}</span>
    </div>
  );
};

export default Breadcrumb;
