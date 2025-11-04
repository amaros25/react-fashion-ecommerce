import React from "react";
import { useTranslation } from "react-i18next";
import "./product_info.css";

function ProductInfo({ product }) {
  const { t } = useTranslation();

  if (!product) return null;

  const formattedDate = new Date(product.createdAt).toLocaleDateString();

  // Hilfsfunktion für Farbübersetzung
const translateColor = (color) => {
  if (!color) return ""; // falls keine Farbe angegeben ist
  const colorKey = color.toLowerCase();
  const translated = t(`product_colors.${colorKey}`);
  return translated !== `product_colors.${colorKey}` ? translated : color;
};

  return (
    <div className="product-info-box">
      <div className="product-info-header">
        <h1 className="product-info-title">{product.name}</h1>
        <span className="product-info-date">{formattedDate}</span>
      </div>
      <hr className="product-divider" />
      <span className="product-info-price">{product.price} DT</span>
      <p className="product-info-description">{product.description}</p>

      {/* Horizontale Linie als Trennung */}
      {product.sizes && product.sizes.length > 0 && <hr className="product-divider" />}

      {/* Tabelle für Größen, Farben und Lagerbestand */}
      {product.sizes && product.sizes.length > 0 && (
        <table className="product-sizes-table">
          <thead>
            <tr>
              <th>{t("color")}</th>
              <th>{t("sizes")}</th>
              <th>{t("stock")}</th>
            </tr>
          </thead>
          <tbody>
            {product.sizes.map((variant, index) => (
              <tr key={index}>
                <td>{translateColor(variant.color)}</td>
                <td>{variant.size}</td>
                <td>{variant.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductInfo;
