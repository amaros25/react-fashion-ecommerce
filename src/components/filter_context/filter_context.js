// FilterContext.js
import React, { createContext, useState } from 'react';

export const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Home Page Cache
  const [cachedHomeProducts, setCachedHomeProducts] = useState([]);
  const [cachedTotalPages, setCachedTotalPages] = useState(0);
  const [cacheParams, setCacheParams] = useState(null);

  const handleSearch = (searchInput) => {
    setSearchTerm(searchInput);
    // Optional: Reset cache on new search so we force fetch?
    // Actually, useHomeProducts logic will see mismatched params and fetch anyway.
  };

  return (
    <FilterContext.Provider value={{
      searchTerm,
      setSearchTerm,
      handleSearch,
      sortBy,
      setSortBy,
      cachedHomeProducts,
      setCachedHomeProducts,
      cachedTotalPages,
      setCachedTotalPages,
      cacheParams,
      setCacheParams
    }}>
      {children}
    </FilterContext.Provider>
  );
}
