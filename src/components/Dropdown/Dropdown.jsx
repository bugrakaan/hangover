import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DropdownContext } from '../../context/DropdownContext';
import { buildFromConfig } from '../../utils/buildFromConfig';

/**
 * Dropdown — root provider component.
 *
 * All state lives here. Sub-components access it via DropdownContext.
 *
 * Props:
 *  displayMode          "scroll" (default) | "tab"
 *  defaultOpen          bool (default false)
 *  defaultGroupExpanded true | false | "first" (default true)
 *  hideOnSelection      bool (default true) — close panel on click-item select
 *  onEvent              ({ type, payload, prev }) => any
 *  children
 */
const Dropdown = forwardRef(function Dropdown(
  {
    displayMode: displayModeProp = 'scroll',
    defaultOpen: defaultOpenProp = false,
    defaultGroupExpanded: defaultGroupExpandedProp = true,
    hideOnSelection: hideOnSelectionProp = true,
    onEvent: onEventProp,
    fromConfig,
    darkMode: darkModeProp = false,
    searchQuery: searchQueryProp,
    defaultSearchQuery: defaultSearchQueryProp = '',
    useTranslationFunction: useTranslationFunctionProp,
    groupHeaderStyle: groupHeaderStyleProp = 'accent',
    autoFocusSearch: autoFocusSearchProp = true,
    children,
    ...rest
  },
  ref
) {
  const displayMode = fromConfig?.displayMode ?? displayModeProp;
  const defaultOpen = fromConfig?.defaultOpen ?? defaultOpenProp;
  const defaultGroupExpanded = fromConfig?.defaultGroupExpanded ?? defaultGroupExpandedProp;
  const hideOnSelection = fromConfig?.hideOnSelection ?? hideOnSelectionProp;
  const onEvent = fromConfig?.onEvent ?? onEventProp;
  const darkMode = fromConfig?.darkMode ?? darkModeProp;
  const defaultSearchQuery = fromConfig?.defaultSearchQuery ?? defaultSearchQueryProp;
  const controlledSearchQuery = fromConfig?.searchQuery ?? searchQueryProp;
  const translationFn = fromConfig?.useTranslationFunction ?? useTranslationFunctionProp;
  const groupHeaderStyle = fromConfig?.groupHeaderStyle ?? groupHeaderStyleProp;
  const autoFocusSearch = fromConfig?.autoFocusSearch ?? autoFocusSearchProp;

  // Translation helper. Every user-facing string is routed through this.
  // - With a translation function: returns translationFn(str, payload).
  // - Without one: returns the string, interpolating any {placeholder}
  //   tokens from the optional payload object.
  const t = useCallback((str, payload) => {
    if (typeof str !== 'string') return str;
    if (typeof translationFn === 'function') return translationFn(str, payload);
    if (payload) {
      return str.replace(/\{(\w+)\}/g, (match, key) => (key in payload ? payload[key] : match));
    }
    return str;
  }, [translationFn]);

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedItem, setSelectedItem] = useState(null);
  const [checkedItems, setCheckedItems] = useState(() => new Map());
  const [activeNavId, setActiveNavId] = useState('__all__');
  const [activeNavLabel, setActiveNavLabel] = useState('');
  const [searchQuery, setSearchQuery] = useState(defaultSearchQuery);
  const [hasNav, setHasNav] = useState(false);

  // Controlled searchQuery — sync internal state whenever the prop changes
  const isControlledSearch = controlledSearchQuery !== undefined;
  useEffect(() => {
    if (isControlledSearch) setSearchQuery(controlledSearchQuery);
  }, [isControlledSearch, controlledSearchQuery]);

  const triggerRef = useRef(null);
  const contentRef = useRef(null); // scroll container inside DropdownContent
  const firstGroupClaimedRef = useRef(false);

  // Sync refs — give stable callbacks access to current state without
  // closing over it. Updated synchronously during render (not in effects),
  // so they're always current by the time any event handler runs.
  const isOpenRef = useRef(isOpen);
  const selectedItemRef = useRef(selectedItem);
  const checkedItemsRef = useRef(checkedItems);
  const activeNavIdRef = useRef(activeNavId);
  const searchQueryRef = useRef(searchQuery);
  const hideOnSelectionRef = useRef(hideOnSelection);
  const onEventRef = useRef(onEvent);
  isOpenRef.current = isOpen;
  selectedItemRef.current = selectedItem;
  checkedItemsRef.current = checkedItems;
  activeNavIdRef.current = activeNavId;
  searchQueryRef.current = searchQuery;
  hideOnSelectionRef.current = hideOnSelection;
  onEventRef.current = onEvent;

  // Group registry: Map<groupId, { itemIds, groupLabel }>
  const groupItemsRegistry = useRef(new Map());
  const registerGroupItems = useCallback((groupId, itemIds, groupLabel) => {
    groupItemsRegistry.current.set(groupId, { itemIds, groupLabel });
    return () => groupItemsRegistry.current.delete(groupId);
  }, []);

  // Reset first-group claim whenever the dropdown opens
  useEffect(() => {
    if (isOpen) {
      firstGroupClaimedRef.current = false;
    }
  }, [isOpen]);

  // Nav label registry: Map<id, label>  (populated by DropdownNavItem on mount)
  const navLabels = useRef(new Map());
  const registerNavLabel = useCallback((id, label) => {
    navLabels.current.set(id, label);
  }, []);

  // Section refs registry: Map<forId, HTMLElement>  (populated by DropdownSection on mount)
  const sectionRefs = useRef(new Map());
  const registerSectionRef = useCallback((forId, el) => {
    if (el) {
      sectionRefs.current.set(forId, el);
    } else {
      sectionRefs.current.delete(forId);
    }
  }, []);

  /**
   * fireEvent — central event dispatcher.
   *
   * 1. Compute `prev` snapshot.
   * 2. Call onEvent callback, capture return value.
   * 3. Apply state update based on return (null = cancel).
   * 4. Dispatch native CustomEvent on trigger element.
   */
  const fireEvent = useCallback((type, payload) => {
    // Read from sync refs so this callback is stable ([] deps) while always
    // seeing the current state values at call time.
    const selectedItem    = selectedItemRef.current;
    const checkedItems    = checkedItemsRef.current;
    const activeNavId     = activeNavIdRef.current;
    const searchQuery     = searchQueryRef.current;
    const hideOnSelection = hideOnSelectionRef.current;
    const onEvent         = onEventRef.current;

    // Build prev snapshot
    const prev = (() => {
      switch (type) {
        case 'select': return selectedItem ? { ...selectedItem } : null;
        case 'check': return { checked: checkedItems.get(payload.id) ?? false };
        case 'selectAll': return { checked: checkedItems.get(payload.groupId + '__all') ?? false };
        case 'navChange': return { id: activeNavId };
        case 'search': return { query: searchQuery };
        default: return null;
      }
    })();

    // Call user callback
    const result = onEvent ? onEvent({ type, payload, prev }) : undefined;

    // Apply state changes
    switch (type) {
      case 'open':
        setIsOpen(true);
        break;

      case 'close':
        setIsOpen(false);
        setSearchQuery('');
        break;

      case 'select': {
        // null return = cancel; undefined = uncontrolled (use payload)
        if (result === null) {
          break;
        }
        const next = result !== undefined ? result : { id: payload.id, label: payload.label };
        setSelectedItem(next);
        if (hideOnSelection) {
          setIsOpen(false);
        }
        break;
      }

      case 'check': {
        if (result === null) {
          break;
        }
        const nextChecked = result !== undefined ? Boolean(result) : !checkedItems.get(payload.id);
        setCheckedItems(prev => {
          const m = new Map(prev);
          m.set(payload.id, nextChecked);
          return m;
        });
        break;
      }

      case 'selectAll': {
        if (result === null) {
          break;
        }
        const currentAll = checkedItems.get(payload.groupId + '__all') ?? false;
        const nextAll = result !== undefined ? Boolean(result)
          : (payload._checked !== undefined ? payload._checked : !currentAll);
        setCheckedItems(prev => {
          const m = new Map(prev);
          // toggle all items in the group
          payload.itemIds.forEach(id => m.set(id, nextAll));
          m.set(payload.groupId + '__all', nextAll);
          return m;
        });
        break;
      }

      case 'navChange': {
        setActiveNavId(payload.id);
        const label = navLabels.current.get(payload.id) ?? '';
        setActiveNavLabel(label);
        break;
      }

      case 'search': {
        setSearchQuery(payload.query);
        break;
      }

      case 'groupToggle':
        // no state to update, purely informational
        break;

      default:
        break;
    }

    // Dispatch native CustomEvent on trigger element
    if (triggerRef.current) {
      triggerRef.current.dispatchEvent(
        new CustomEvent(`HO:${type}`, {
          detail: { payload, prev },
          bubbles: true,
          composed: true,
        })
      );
    }

    return result;
  }, []); // stable — reads state via sync refs, all setters are stable

  // Expose imperative handle — stable because fireEvent is stable and all
  // state is read from sync refs at call time.
  useImperativeHandle(ref, () => ({
    open() { fireEvent('open', { trigger: 'imperative' }); },
    close() { fireEvent('close', { trigger: 'imperative' }); },
    toggle() {
      if (isOpenRef.current) {
        fireEvent('close', { trigger: 'imperative' });
      } else {
        fireEvent('open', { trigger: 'imperative' });
      }
    },
    isOpen() { return isOpenRef.current; },
    getSelected() { return selectedItemRef.current; },
    getChecked() { return new Map(checkedItemsRef.current); },
    getActiveNavItem() { return activeNavIdRef.current; },
    setSearch(query) { fireEvent('search', { query }); },
    selectAll(groupId, checked) {
      const entry = groupItemsRegistry.current.get(groupId);
      if (!entry) return;
      fireEvent('selectAll', {
        groupId,
        groupLabel: entry.groupLabel,
        itemIds: entry.itemIds,
        _checked: checked,
      });
    },
  }), [fireEvent]); // fireEvent is stable, handle is created once

  const setScrollSpyActive = useCallback((id) => {
    setActiveNavId(id);
    const label = navLabels.current.get(id) ?? '';
    setActiveNavLabel(label);
  }, []);

  // useMemo so context object identity is stable when nothing relevant changed.
  // All callbacks/refs inside are already stable — only the 7 state values and
  // 2 props below can trigger consumer re-renders.
  const contextValue = useMemo(() => ({
    // State
    isOpen,
    selectedItem,
    checkedItems,
    activeNavId,
    activeNavLabel,
    searchQuery,
    displayMode,
    hasNav,
    darkMode,
    setHasNav,
    // i18n
    t,
    // Appearance
    groupHeaderStyle,
    // Behavior
    autoFocusSearch,
    // Refs
    triggerRef,
    contentRef,
    firstGroupClaimedRef,
    // Config
    defaultGroupExpanded,
    // Actions
    fireEvent,
    registerGroupItems,
    setActiveNavId,
    setScrollSpyActive,
    setSearchQuery,
    // Registries
    navLabels: navLabels.current,
    registerNavLabel,
    sectionRefs: sectionRefs.current,
    registerSectionRef,
  }), [
    isOpen, selectedItem, checkedItems,
    activeNavId, activeNavLabel, searchQuery,
    hasNav, displayMode, defaultGroupExpanded, darkMode,
    // all others are stable references
    fireEvent, registerGroupItems, setScrollSpyActive,
    registerNavLabel, registerSectionRef, t, groupHeaderStyle, autoFocusSearch,
  ]);
  const resolvedChildren = (() => {
    if (fromConfig && children) {
      console.warn(
        '[Dropdown] `fromConfig` and `children` cannot be used together. ' +
        '`fromConfig` takes precedence — `children` will be ignored.'
      );
      return buildFromConfig(fromConfig);
    }
    if (fromConfig) return buildFromConfig(fromConfig);
    return children;
  })();

  return (
    <DropdownContext.Provider value={contextValue}>
      <div className={`hangoverDropdown${darkMode ? ' hangoverDropdown--dark' : ''}`} {...rest}>
        {resolvedChildren}
      </div>
    </DropdownContext.Provider>
  );
});

export default Dropdown;
