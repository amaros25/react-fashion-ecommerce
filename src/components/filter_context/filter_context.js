// FilterContext.js
import React, { createContext, useState } from 'react';

export const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const handleSearch = (searchInput) => {
    setSearchTerm(searchInput);
  };

  return (
    <FilterContext.Provider value={{
      searchTerm,
      setSearchTerm,
      handleSearch,
      sortBy,
      setSortBy,
    }}>
      {children}
    </FilterContext.Provider>
  );
}
