import React from "react";
import {render, screen} from "@testing-library/react";
import ProductInfo from "../product_info";
import '@testing-library/jest-dom'
import { I18nextProvider } from 'react-i18next'; // Importiere I18nextProvider

describe("ProductInfo", () => {

    it("renders product info when product object is passed", () => {
        const mockProduct = {
        createdAt: "2025-11-12T21:55:28.655Z",
        name: "Stylish Shirt",
        price: "29.99",
        description: "A comfortable and stylish shirt.",
        sizes: [
            { color: "Red", size: "M", stock: 10 },
            { color: "Blue", size: "L", stock: 5 },
        ],
        };
        render(<ProductInfo product={mockProduct}/>);
        expect(screen.getByText("Stylish Shirt")).toBeInTheDocument();
        expect(screen.getByText("29.99 DT")).toBeInTheDocument();
        expect(screen.getByText("A comfortable and stylish shirt.")).toBeInTheDocument();
        expect(screen.getByText("12.11.2025")).toBeInTheDocument();
        expect(screen.getByText("Red")).toBeInTheDocument();
        expect(screen.getByText("M")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("Blue")).toBeInTheDocument();
        expect(screen.getByText("L")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });
    
    //should return null if no product is passed
    it("should return null if no product is passed", () => {
        render(<ProductInfo product={null} />);
        expect(screen.queryByText(/Stylish Shirt/)).toBeNull();
    });

    //should display color name if not translated
    it("should display color name if not translated", () => {
        const mockProduct = {
            createdAt: "2025-11-12T21:55:28.655Z",
            name: "Stylish Shirt",
            price: "29.99",
            description: "A comfortable and stylish shirt.",
            sizes: [{ color: "Green", size: "M", stock: 10 }],
        };
        render(<ProductInfo product={mockProduct} />);
        expect(screen.getByText("Green")).toBeInTheDocument();
    });

    //should display the correct price
    it("should display the correct price", () => {
    const mockProduct = {
        createdAt: "2025-11-12T21:55:28.655Z",
        name: "Stylish Shirt",
        price: "29.99",
        description: "A comfortable and stylish shirt.",
        sizes: [{ color: "Red", size: "M", stock: 10 }],
    };
    render(<ProductInfo product={mockProduct} />);
    expect(screen.getByText("29.99 DT")).toBeInTheDocument();
    });

    //should not render sizes table if no sizes are available
    it("should not render sizes table if no sizes are available", () => {
        const mockProduct = {
            createdAt: "2025-11-12T21:55:28.655Z",
            name: "Stylish Shirt",
            price: "29.99",
            description: "A comfortable and stylish shirt.",
            sizes: [],
        };
        render(<ProductInfo product={mockProduct} />);
        expect(screen.queryByRole("table")).toBeNull();
    });

    //should format the creation date correctly
    it("should format the creation date correctly", () => {
        const mockProduct = {
            createdAt: "2025-11-12T21:55:28.655Z",
            name: "Stylish Shirt",
            price: "29.99",
            description: "A comfortable and stylish shirt.",
            sizes: [{ color: "Red", size: "M", stock: 10 }],
        };
        render(<ProductInfo product={mockProduct} />);
        expect(screen.getByText("12.11.2025")).toBeInTheDocument();
    });

    //should not render correctly even if some attributes are missing
    it("should not render correctly if any essential attribute is missing", () => {
    const mockProduct = {
            createdAt: "2025-11-12T21:55:28.655Z",
            price: "29.99",
            description: "A stylish and comfortable shirt.",
            sizes: [{ color: "Red", size: "M", stock: 10 }],
        };
        render(<ProductInfo product={mockProduct} />);
        expect(screen.queryByText("Stylish Shirt")).toBeNull();
        expect(screen.queryByText("29.99 DT")).toBeNull();
        expect(screen.queryByText("A stylish and comfortable shirt.")).toBeNull();
    });

    //should handle missing sizes gracefully
    it("should handle missing sizes gracefully", () => {
        const mockProduct = {
            createdAt: "2025-11-12T21:55:28.655Z",
            name: "Stylish Shirt",
            price: "29.99",
            description: "A comfortable and stylish shirt.",
            sizes: null,
        };
        render(<ProductInfo product={mockProduct} />);
        expect(screen.queryByRole("table")).toBeNull();
    });

});
 
 

 