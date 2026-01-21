import React from "react";
import { render, screen } from "@testing-library/react";
import SellerInfo from "../seller_info";
import '@testing-library/jest-dom';

describe("SellerInfo", () => {
  it("renders seller info when seller object is passed", () => {
    const mockSeller = {
      shopName: "Amazing Shop",
      city: "New York",
      image: "https://media.istockphoto.com/id/1403500817/photo/the-craggies-in-the-blue-ridge-mountains.jpg?s=612x612&w=0&k=20&c=N-pGA8OClRVDzRfj_9AqANnOaDS3devZWwrQNwZuDSk=",
    };

    render(<SellerInfo seller={mockSeller} />);
    expect(screen.getByText("Amazing Shop")).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
    const imgElement = screen.getByAltText("Amazing Shop");
    expect(imgElement).toHaveAttribute("src", "https://media.istockphoto.com/id/1403500817/photo/the-craggies-in-the-blue-ridge-mountains.jpg?s=612x612&w=0&k=20&c=N-pGA8OClRVDzRfj_9AqANnOaDS3devZWwrQNwZuDSk=");
    expect(screen.getByText(/New York/i)).toBeInTheDocument();
  });

  it("does not render anything if no seller object is passed", () => {
    render(<SellerInfo seller={null} />);
    expect(screen.queryByText(/Amazing Shop/i)).toBeNull();
    expect(screen.queryByText(/New York/i)).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
