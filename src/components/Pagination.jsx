// ============================================
// Reusable Pagination Component
// ============================================

import { Pagination as BsPagination } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const Pagination = ({ pagination, onPageChange }) => {
  const { t } = useTranslation();

  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, totalItems, itemsPerPage, hasNextPage, hasPreviousPage } = pagination;

  // Build page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range to always show maxVisible middle pages
      if (currentPage <= 3) {
        end = Math.min(maxVisible, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 1);
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="d-flex justify-content-between align-items-center px-3 py-2">
      <small className="text-muted">
        {t('pagination.showing', { start: startItem, end: endItem, total: totalItems })}
      </small>
      <BsPagination size="sm" className="mb-0">
        <BsPagination.Prev
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(currentPage - 1)}
        />
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <BsPagination.Ellipsis key={`ellipsis-${idx}`} disabled />
          ) : (
            <BsPagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </BsPagination.Item>
          )
        )}
        <BsPagination.Next
          disabled={!hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </BsPagination>
    </div>
  );
};

export default Pagination;
