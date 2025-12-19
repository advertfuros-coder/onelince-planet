import { useState, useCallback } from "react";

/**
 * Custom hook for managing bulk selection in tables
 * Handles select all, individual selection, and batch operations
 */
export function useBulkSelection(items = []) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Toggle single item
  const toggleItem = useCallback((id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Toggle all items
  const toggleAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item._id || item.id)));
    }
  }, [items, selectedIds.size]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Check if item is selected
  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds]);

  // Check if all items are selected
  const isAllSelected = items.length > 0 && selectedIds.size === items.length;

  // Check if some (but not all) items are selected
  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < items.length;

  // Get selected items
  const getSelectedItems = useCallback(() => {
    return items.filter((item) => selectedIds.has(item._id || item.id));
  }, [items, selectedIds]);

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    clearSelection,
    getSelectedItems,
  };
}
