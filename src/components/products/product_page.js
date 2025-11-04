import React, {useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import "./product_page.css";
import { Header } from '../header/header.js';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./loading_spinner.js";
import RelatedProducts from "../related_products/related_product.js"
import Foot from '../foot/foot';
import  ProductImage from './product_images.js'
import ProductInfo from "./product_info";
import SellerInfo from "./seller_info.js";

function ProductPage() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [seller, setSeller] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("role")?.toLowerCase());
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  console.log("***** Role:", localStorage.getItem("role"));

  useEffect(() => {
      if (role === "seller") {
          toast.error(t("seller_cannot_buy_alter"));
        }
    }, []);

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
    function getStockForSelection() {
    if (!selectedSize || !selectedColor || !product?.sizes) return 0;

    const match = product.sizes.find(
      (s) =>
        s.size.trim().toLowerCase() === selectedSize.trim().toLowerCase() &&
        s.color.trim().toLowerCase() === selectedColor.trim().toLowerCase()
    );

    return match ? match.stock : 0;
  }

  const availableSizes = product?.sizes
    ? Array.from(new Set(product.sizes.map(s => s.size)))
    : [];
 
  const availableColors = product?.sizes && selectedSize
    ? product.sizes
        .filter((s) => s.size.trim().toLowerCase() === selectedSize.trim().toLowerCase())
        .map((s) => s.color)
    : [];
 
  const uniqueColors = Array.from(new Set(availableColors));
  useEffect(() => {
    fetch(`${apiUrl}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        if (Array.isArray(data.image) && data.image.length > 0) {
          setMainImage(data.image[0]); 
        } else if (data.image) {
          setMainImage(data.image ); 
        }

        if (data.sellerId) {
          fetch(`${apiUrl}/sellers/${data.sellerId}`)
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Error fetching seller: ${res.status}`);
              }
              return res.json();
            })
            .then((sellerData) => {
              setSeller(sellerData);
            })
            .catch((err) => {
              console.error("Error loading seller:", err);
              setSeller(null);
            });
        } else {
          console.error("No sellerId found in the product!");
          setSeller(null);
        }
      })
      .catch((err) => {
        console.error("Error loading product:", err);
      });
  }, [id]);


  if (!product || !seller) {
    return <LoadingSpinner />;
  }

  const handleBuyClick = () => {
  if (role === "seller") {
    toast.error(t("seller_cannot_buy_alter"));
    return;
  }
  if (!selectedSize || !selectedColor) {
    toast.warn(t("product_page.select_size_alert"));
    return;
  }

  if (!isLoggedIn) {
    toast.info(t("product_page.must_login"));
    return;
  }

  const stockInfo = product.sizes.find(
    (s) => s.size === selectedSize && s.color === selectedColor
  );

  if (!stockInfo) {
    toast.error(t("product_page.invalid_selection"));
    return;
  }

  if (quantity > stockInfo.stock) {
    toast.error(`${t("product_page.exceeds_stock")} (${stockInfo.stock} ${t("product_page.available")})`);

    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const newItem = {
    productId: product._id,
    name: product.name,
    price: product.price,
    image: mainImage,
    size: selectedSize,
    color: selectedColor,
    quantity: quantity,
    sellerId: seller._id,
  };

  // Prüfen, ob Item schon im Cart existiert
  const existingIndex = cart.findIndex(
    (item) =>
      item.productId === newItem.productId &&
      item.size === newItem.size &&
      item.color === newItem.color
  );

  if (existingIndex >= 0) {
    const totalQuantity = cart[existingIndex].quantity + newItem.quantity;
 
    // Menge erhöhen
    cart[existingIndex].quantity = totalQuantity;
    toast.success(t("product_page.cart_updated"));
  } else {
    // Neu hinzufügen
    cart.push(newItem);
   }

  localStorage.setItem("cart", JSON.stringify(cart));
  toast.success(t("product_page.added_to_cart"));
  navigate("/cart_page");
};
  return (
    <div className="product-page">
      <Header /> 

        <div className="product-main-content"> 
      <ProductImage
        mainImage={mainImage}
        setMainImage={setMainImage}
        product={product}
      />
      <div className="product-info-main">

      <ProductInfo product={product} />

        <div className="product-buy-box">

          <div className="selection">
            <div className="selection-row" style={{ display: "flex", gap: "1rem" }}>
              <div className="selection">
                <label>{t("product_page.size")}:</label>
                <select
                  value={selectedSize}
                  onChange={(e) => {
                    setSelectedSize(e.target.value);
                    setSelectedColor(""); 
                    setQuantity(0); 
                  }}
                >
                  <option value="">{t("product_page.select_size")}</option>
                  {availableSizes.map((sizeOption, index) => (
                    <option key={index} value={sizeOption}>
                      {sizeOption}
                    </option>
                  ))}
                </select>
              </div>
           <div className="selection">
              <label>{t("product_page.color")}:</label>
              <select
                value={selectedColor}
                onChange={(e) => {
                  if (!selectedSize) {
                    alert(t("product_page.select_size_first"));
                    return;
                  }
                  setSelectedColor(e.target.value);
                }}
                disabled={!selectedSize}
              >
                <option value="">{t("product_page.select_color")}</option>
                {uniqueColors.map((color, index) => (
                  <option key={index} 
                  value= {color}>  {t(`product_colors.${color.toLowerCase()}`, { defaultValue: color })}
                  </option>
                ))}
              </select>
            </div>
          <div className="selection">
     <div className="selection">
        <label>{t("product_page.quantity")}:</label>
        <input
          type="number"
          min="1"
          max={getStockForSelection()}
          value={quantity}
          onChange={(e) => {
            const val = Number(e.target.value);
            const stock = getStockForSelection();
            if (val > stock) {
              alert(`Maximal verfügbar: ${stock}`);
              setQuantity(stock);
            } else {
              setQuantity(val);
            }
          }}
          disabled={getStockForSelection() === 0}
        />
        {getStockForSelection() === 0 && selectedSize && selectedColor && (
        <p style={{ color: "red", fontSize: "0.9rem" }}>
          {t("variant_out_of_stock")}
        </p>
        )}
      </div>
          </div>
            </div>
          </div>
          <button className="buy-button" 
            onClick={handleBuyClick} 
            disabled={role === "seller"}
          >
            {t("product_page.submit_order")}
          </button>
       
        </div>
        <hr className="product-divider" />

          <SellerInfo seller={seller} />
    </div>

      </div>

    <RelatedProducts 
      category={product.category} 
      currentProductId={product._id} 
    />
      <Foot/>
    </div>
  );
}

export default ProductPage;
