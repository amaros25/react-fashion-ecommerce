



export default function Pagination({ page, totalPages, onPageChange }) {
  const maxPagesToShow = 10;

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftBound = Math.max(2, page - 2);
      const rightBound = Math.min(totalPages - 1, page + 2);

      pages.push(1);

      if (leftBound > 2) {
        pages.push('left-ellipsis');
      }

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < totalPages - 1) {
        pages.push('right-ellipsis');
      }

      pages.push(totalPages);
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
          return (
            <span key={index} className="pagination-ellipsis">…</span>
          );
        }
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
