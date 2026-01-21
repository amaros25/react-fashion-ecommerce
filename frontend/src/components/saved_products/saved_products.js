import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./saved_products.css";
import ProductCard from '../product_card/product_card';
import { toast } from "react-toastify";

function SavedProducts() {
    const apiUrl = process.env.REACT_APP_API_URL;
    const { t, i18n } = useTranslation();
    const [savedProductsList, setSavedProductsList] = useState([]);
    const savedProductsKey = `saved_products_${localStorage.getItem('userId')}`;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (i18n.language === "ar") {
            document.body.classList.add("rtl");
        } else {
            document.body.classList.remove("rtl");
        }
    }, [i18n.language]);

    const getSavedProducts = () => {
        try {
            const saved = localStorage.getItem(savedProductsKey);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Error getting saved products:", error);
            toast.error(t('Failed to load saved products'));
            return [];
        }
    };

    const loadSavedProducts = () => {
        const savedProductIds = getSavedProducts();
        if (savedProductIds.length > 0) {
            let url = `${apiUrl}/products/saved_ids?ids=${savedProductIds.join(",")}`;
            fetch(url)
                .then((res) => res.json())
                .then((data) => {
                    setSavedProductsList(data);
                })
                .catch((err) => {
                    console.error("Error loading products:", err);
                    toast.error(t('Failed to load saved products'));
                });
        } else {
            setSavedProductsList([]);
        }
    };
    useEffect(() => {
        loadSavedProducts();
    }, [apiUrl]);

    const handleProductRemoved = (productId) => {
        try {
            setSavedProductsList(prevList => prevList.filter(p => p._id !== productId));
        } catch (error) {
            console.error("Error removing product:", error);
            toast.error(t('Failed to remove product'));
        }
    };

    return (
        <div className="msaved-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
            <div className="collection-header">
                <h2>{t('saved_products.title')}</h2>
                <span className="collection-count">{savedProductsList.length} {t('cart_page.items')}</span>
            </div>

            <div className="product-card-list">
                {savedProductsList.length > 0 ? (
                    savedProductsList.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onProductRemoved={handleProductRemoved}
                        />
                    ))
                ) : (
                    <p className="no-products">{t("saved_products.no_saved_products")}</p>
                )}
            </div>
        </div>
    );
}

export default SavedProducts;
