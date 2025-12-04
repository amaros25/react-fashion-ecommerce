// import React, { useState } from "react";
// import { useTranslation } from "react-i18next";
// import { toast } from "react-toastify";

// import "./product_info.css";

// function ProductInfo({ product }) {

//   const { t } = useTranslation();
//   const [toastShown, setToastShown] = useState(false); // New state to track if toast has been shown

//   if (!product || !product.name || !product.createdAt || !product.price || !product.description || !product.sizes) {
//     toast.error(t("errors.product_infos_loading_failed"));
//     return null;
//   }

//   const formattedDate = new Date(product.createdAt).toLocaleDateString();
//   const translateColor = (color) => {
//     if (!color && !toastShown) {
//       toast.error(t("errors.product_color_loading_failed"));
//       setToastShown(true); // Set the toast flag to true, so it's not shown again
//       return "";
//     }
//     if (color && !toastShown) {
//       const colorKey = color.toLowerCase();
//       const translated = t(`product_colors.${colorKey}`);
//       return translated !== `product_colors.${colorKey}` ? translated : color;
//     }

//   };
//   console.log("ProductInfo product: ", product)
//   return (
//     <div className="product-info-box">
//       <div className="product-info-header">
//         <h1 className="product-info-title">{product.name}</h1>
//         <span className="product-info-date">{formattedDate}</span>
//       </div>
//       <hr className="product-divider" />
//       <span className="product-info-price">{product.price} {t("price_suf")}</span>
//       <p className="product-info-description">{product.description}</p>
//       {product.sizes && product.sizes.length > 0 && <hr className="product-divider" />}
//       {product.sizes && product.sizes.length > 0 && (
//         <table className="product-sizes-table">
//           <thead>
//             <tr>
//               <th>{t("color")}</th>
//               <th>{t("sizes")}</th>
//               <th>{t("stock")}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {product.sizes.map((variant, index) => (
//               <tr key={index}>
//                 <td>{translateColor(variant.color)}</td>
//                 <td>{variant.size}</td>
//                 <td>{variant.stock}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// export default ProductInfo;
