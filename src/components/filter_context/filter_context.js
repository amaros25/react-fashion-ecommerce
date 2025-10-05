// FilterContext.js
import React, { createContext, useState } from 'react';

export const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (searchInput) => {
    setSearchTerm(searchInput);
    setSelectedCategory("");
  };

  return (
    <FilterContext.Provider value={{
      selectedCategory,
      setSelectedCategory,
      searchTerm,
      setSearchTerm,
      handleSearch,
    }}>
      {children}
    </FilterContext.Provider>
  );
}
