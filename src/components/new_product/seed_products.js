import { useEffect } from "react";

const randomCategories = [
    "womensClothing",
    "mensClothing",
    "shoes",
    "womensUnderwear",
    "mensUnderwear",
    "bags",
    "kidsClothing",
    "babyClothing",
];

const randomSizes = ["XS", "S", "M", "L", "XL", "42", "33"];
const randomColors = ["red", "blue", "green", "black", "white", "yellow", "pink"];

const sampleImages = [
    "/images/test.jpg",
    "/images/test2.jpg",
    "/images/test3.jpg"
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default function SeedProducts() {
    const apiUrl = process.env.REACT_APP_API_URL;
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        async function seedProducts() {
            const products = [];

            for (let i = 0; i < 100; i++) {
                // zufällige Anzahl Größen pro Produkt (1-4)
                const sizesCount = getRandomInt(1, 4);
                const sizes = [];

                for (let j = 0; j < sizesCount; j++) {
                    sizes.push({
                        size: getRandomFromArray(randomSizes),
                        stock: getRandomInt(1, 50),
                        color: getRandomFromArray(randomColors),
                    });
                }

                const product = {
                    sellerId: userId,
                    name: `Sample Product ${i + 1}`,
                    description: `Beschreibung für Produkt ${i + 1}`,
                    price: parseFloat((Math.random() * 200 + 10).toFixed(2)),
                    image: sampleImages,
                    category: getRandomFromArray(randomCategories),
                    type: "random",
                    sizes: sizes,
                };

                products.push(product);
            }

            try {
                for (const p of products) {
                    const res = await fetch(`${apiUrl}/products/create`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(p),
                    });

                    if (!res.ok) {
                        console.error("Fehler beim Hinzufügen von Produkt:", p.name);
                    } else {
                        console.log("Produkt hinzugefügt:", p.name);
                    }
                }
            } catch (err) {
                console.error("SeedProducts Error:", err);
            }
        }

        // einmal ausführen
        seedProducts();
    }, [apiUrl, userId]);

    return null; // keine UI-Komponente
}
