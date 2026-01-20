// FilterContext.js
import React, { createContext, useState } from 'react';

export const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Die Cache-States für Produkte wurden entfernt, 
  // da TanStack Query das intern im Speicher verwaltet.

  const handleSearch = (searchInput) => {
    setSearchTerm(searchInput);
    // Kein manuelles Cache-Reset nötig! 
    // TanStack Query erkennt die Änderung im searchTerm 
    // und lädt automatisch neu oder nutzt den passenden Cache.
  };

  return (
    <FilterContext.Provider value={{
      searchTerm,
      setSearchTerm,
      handleSearch,
      sortBy,
      setSortBy
    }}>
      {children}
    </FilterContext.Provider>
  );
}