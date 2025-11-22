import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { FilterContext } from "../filter_context/filter_context";

// === Mock Login & Register ===
jest.mock("../login/login", () => () => <div>Mocked Login</div>);
jest.mock("../register/register", () => () => <div>Mocked Register</div>);
jest.mock("../header/header.css", () => ({}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "fr", changeLanguage: jest.fn() },
  }),
}));

// **Import Header nach den Mocks**
import { Header } from "../header/header";
console.log("Header: ", Header);

const mockFilterContext = {
  selectedCategory: "",
  setSelectedCategory: jest.fn(),
  handleSearch: jest.fn(),
  searchTerm: "",
  setSearchTerm: jest.fn(),
};

function renderHeader() {
  return render(
    <FilterContext.Provider value={mockFilterContext}>
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    </FilterContext.Provider>
  );
}

test("header renders without crashing", () => {
  renderHeader();
  expect(screen.getByText("myshop")).toBeInTheDocument();
});
