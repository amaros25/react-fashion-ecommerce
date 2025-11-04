import {useEffect} from 'react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import './product_card.css';

function ProductCard({product}) {
 
   const { t, i18n } = useTranslation();
  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  return (
      <Link 
            key={product._id} 
            to={`/product/${product._id}`} 
            className="product-card-item">
            <img 
              src={product.image[0]} 
              alt={product.name} 
              className="product-card-image" 
              loading="lazy"/>
              <h2>{product.name}</h2>
          
              <div className="product-sizes">
                <p>{t("sizes")}: {product.sizes.map(sizeObj => sizeObj.size).join(", ")}</p>
              </div> 
                    
              <div className="product-sizes">
                <p>{t("color")}: {product.sizes.map(sizeObj => sizeObj.color).join(", ")}</p>
              </div> 
              <div className="product-card-price">
                <p>{product.price} DT</p>
             </div>
          </Link>
  );
}

export default ProductCard;
