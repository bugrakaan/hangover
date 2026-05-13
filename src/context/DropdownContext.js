import { createContext, useContext } from 'react';

export const DropdownContext = createContext(null);

export function useDropdownContext() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('useDropdownContext must be used inside <Dropdown>');
  return ctx;
}

// Passed down from DropdownSection so DropdownGroup/Item know their forId
export const SectionContext = createContext(null);

// Passed down from DropdownSection so DropdownGroup can register for expand/collapse all
export const SectionControlContext = createContext(null);

// Passed down from DropdownGroup so DropdownItem knows its groupLabel + auto-color index
export const GroupContext = createContext(null);
