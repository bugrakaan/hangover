import { useCallback } from 'react';
import { useDropdownContext } from '../context/DropdownContext';

/**
 * useDropdown — public hook for reading and controlling a <Dropdown> from
 * any component rendered inside its tree.
 *
 * Must be called inside a <Dropdown> (or a component passed via `component` prop).
 *
 * Returns:
 *
 * State (reactive — triggers re-render on change):
 *  isOpen        boolean
 *  selectedItem  { id, label } | null
 *  checkedItems  Map<id, boolean>
 *  activeNavId   string
 *  activeNavLabel string
 *  searchQuery   string
 *  displayMode   'scroll' | 'tab'
 *  darkMode      boolean
 *
 * Actions (stable references — safe to use in dependency arrays):
 *  open()              Open the panel
 *  close()             Close the panel
 *  toggle()            Toggle open/closed
 *  setSearch(query)    Programmatically update the search query
 *
 * Escape hatch:
 *  fireEvent(type, payload)   Fire any internal event directly.
 *                             Return null from onEvent to cancel it.
 */
export function useDropdown() {
  const {
    isOpen,
    selectedItem,
    checkedItems,
    activeNavId,
    activeNavLabel,
    searchQuery,
    displayMode,
    darkMode,
    fireEvent,
  } = useDropdownContext();

  const open = useCallback(
    () => fireEvent('open', { trigger: 'imperative' }),
    [fireEvent]
  );

  const close = useCallback(
    () => fireEvent('close', { trigger: 'imperative' }),
    [fireEvent]
  );

  // isOpen is reactive so toggle always reflects current state
  const toggle = useCallback(
    () => fireEvent(isOpen ? 'close' : 'open', { trigger: 'imperative' }),
    [fireEvent, isOpen]
  );

  const setSearch = useCallback(
    (query) => fireEvent('search', { query }),
    [fireEvent]
  );

  return {
    // State
    isOpen,
    selectedItem,
    checkedItems,
    activeNavId,
    activeNavLabel,
    searchQuery,
    displayMode,
    darkMode,
    // Actions
    open,
    close,
    toggle,
    setSearch,
    // Escape hatch for advanced / unforeseen use cases
    fireEvent,
  };
}
