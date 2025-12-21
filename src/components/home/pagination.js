



export default function Pagination({ page, totalPages, onPageChange }) {
  const maxPagesToShow = 10; // Maximum number of page buttons to display at once

  /**
   * Calculates which page numbers to show in the pagination component.
   * If total pages <= maxPagesToShow, show all pages.
   * If more, show first page, last page, current page with some neighbors,
   * and ellipsis (...) where pages are skipped.
   */
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= maxPagesToShow) {
      // If total pages less or equal to maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // More than maxPagesToShow pages: show intelligent pagination

      // Define left and right bounds for the page numbers near current page
      const leftBound = Math.max(2, page - 2);
      const rightBound = Math.min(totalPages - 1, page + 2);

      pages.push(1); // Always show first page

      if (leftBound > 2) {
        pages.push('left-ellipsis'); // Show ellipsis if there's a gap after first page
      }

      // Show page numbers between leftBound and rightBound
      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < totalPages - 1) {
        pages.push('right-ellipsis'); // Show ellipsis if there's a gap before last page
      }

      pages.push(totalPages); // Always show last page
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageChange = (num) => {
    onPageChange(num);
    window.scrollTo(0, 0);
  };

  return (
    <div className="pagination-container">
      {pageNumbers.map((num, index) => {
        if (num === 'left-ellipsis' || num === 'right-ellipsis') {
          // Render ellipsis span for skipped pages
          return (
            <span key={index} className="pagination-ellipsis">…</span>
          );
        }

        // Render page button; highlight if active page
        return (
          <button
            key={index}
            className={`pagination-button ${page === num ? 'active' : ''}`}
            onClick={() => handlePageChange(num)}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}
