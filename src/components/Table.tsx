import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from './Pagination';

interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  renderExpandableContent?: (item: T) => React.ReactNode;
  renderActions?: (item: T) => React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  getRowId: (item: T) => string;
  pagination?: PaginationProps;
}

/**
 * Reusable Table component with expandable rows
 * Features: Expandable content on left, action buttons on right, mobile-responsive
 */
function Table<T>({
  columns,
  data,
  renderExpandableContent,
  renderActions,
  isLoading = false,
  emptyMessage = 'No data available',
  getRowId,
  pagination,
}: TableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {renderExpandableContent && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                    {/* Expand/collapse column */}
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
                {renderActions && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((item) => {
                const rowId = getRowId(item);
                const isExpanded = expandedRows.has(rowId);

                return (
                  <React.Fragment key={rowId}>
                    <tr className="hover:bg-gray-50 transition duration-150">
                      {renderExpandableContent && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleRow(rowId)}
                            className="p-1 rounded-lg hover:bg-gray-200 transition duration-300"
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          >
                            <svg
                              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className={`px-6 py-4 ${column.className || ''}`}>
                          {column.render(item)}
                        </td>
                      ))}
                      {renderActions && (
                        <td className="px-6 py-4 text-right">
                          {renderActions(item)}
                        </td>
                      )}
                    </tr>
                    {renderExpandableContent && (
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <td
                              colSpan={
                                columns.length +
                                (renderExpandableContent ? 1 : 0) +
                                (renderActions ? 1 : 0)
                              }
                              className="px-6 py-4 bg-gray-50"
                            >
                              <div className="flex items-start gap-6">
                                <div className="flex-1">{renderExpandableContent(item)}</div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {data.map((item) => {
            const rowId = getRowId(item);
            const isExpanded = expandedRows.has(rowId);

            return (
              <div key={rowId} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {columns.map((column) => (
                      <div key={column.key} className="mb-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          {column.header}
                        </div>
                        <div className="text-sm text-gray-800">{column.render(item)}</div>
                      </div>
                    ))}
                  </div>
                  {renderExpandableContent && (
                    <button
                      onClick={() => toggleRow(rowId)}
                      className="p-2 rounded-lg hover:bg-gray-200 transition duration-300 flex-shrink-0"
                      aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                    >
                      <svg
                        className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {renderExpandableContent && (
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        {renderExpandableContent(item)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {renderActions && (
                  <div className="mt-4 flex justify-end gap-2">{renderActions(item)}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}

export default memo(Table) as <T>(props: TableProps<T>) => JSX.Element;

