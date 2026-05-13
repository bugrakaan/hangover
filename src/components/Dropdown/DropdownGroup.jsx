import { Children, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GroupContext, SectionControlContext, useDropdownContext } from '../../context/DropdownContext';
import { getMatchingItemIds } from '../../utils/fuzzySearch';
import { renderIcon } from '../../utils/renderIcon';
import DropdownItem from './DropdownItem';

const GROUP_PALETTE = [
  '#16A34A', // green
  '#7C3AED', // purple
  '#0EA5E9', // sky
  '#F59E0B', // amber
  '#EC4899', // pink
  '#EF4444', // red
  '#84CC16', // lime
  '#06B6D4', // cyan
];

// Single chevron — CSS handles rotation
function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8.47143 6.19526C8.21108 5.93491 7.78897 5.93491 7.52862 6.19526L4.86195 8.86193C4.67129 9.05259 4.61425 9.33934 4.71744 9.58846C4.82063 9.83757 5.06372 10 5.33336 10H10.6667C10.9363 10 11.1794 9.83757 11.2826 9.58846C11.3858 9.33934 11.3288 9.05259 11.1381 8.86193L8.47143 6.19526Z" fill="currentColor" />
    </svg>
  );
}

// Module-level counter for color cycling.
// Incremented on each group mount — sufficient for stable color assignment
// within a single panel open session.
let _groupColorIndex = 0;

// Reset counter when all groups unmount (panel closes)
let _mountedGroupCount = 0;
function onGroupMount() {
  if (_mountedGroupCount === 0) { _groupColorIndex = 0; }
  _mountedGroupCount++;
}
function onGroupUnmount() {
  _mountedGroupCount--;
}

/**
 * DropdownGroup
 *
 * A collapsible group of DropdownItems with a colored left border.
 *
 * Props:
 *  label              string (required)
 *  color              string — CSS color for left border accent
 *  showSelectAll      bool (default false)
 *  selectAllPosition  "top" | "bottom" (default "bottom")
 *  component          custom wrapper component
 *  children           DropdownItem elements
 */
function DropdownGroup({
  id,
  label,
  icon,
  color,
  defaultExpanded = undefined,
  showSelectAll = false,
  selectAllPosition = 'bottom',
  emptyText = 'Nothing to show here',
  noResultsText = 'No results',
  component: Comp,
  children,
  ...rest
}) {
  const { fireEvent, checkedItems, firstGroupClaimedRef, defaultGroupExpanded, displayMode, activeNavId, registerGroupItems, searchQuery } = useDropdownContext();

  // Determine initial expanded state
  const expandedInitRef = useRef(null);
  if (expandedInitRef.current === null) {
    if (defaultExpanded !== undefined) {
      // explicit prop always wins
      expandedInitRef.current = defaultExpanded;
    } else if (defaultGroupExpanded === true) {
      expandedInitRef.current = true;
    } else if (defaultGroupExpanded === false) {
      expandedInitRef.current = false;
    } else {
      // 'first' — only the first group across all sections
      if (firstGroupClaimedRef && !firstGroupClaimedRef.current) {
        firstGroupClaimedRef.current = true;
        expandedInitRef.current = true;
      } else {
        expandedInitRef.current = false;
      }
    }
  }

  const [isExpanded, setIsExpanded] = useState(expandedInitRef.current);

  // Register with parent section for expand/collapse all
  const sectionControl = useContext(SectionControlContext);
  const groupKeyRef = useRef(null);
  if (groupKeyRef.current === null) {
    groupKeyRef.current = Math.random().toString(36).slice(2);
  }

  useEffect(() => {
    if (!sectionControl) return;
    const key = groupKeyRef.current;
    sectionControl.registerGroup(key, setIsExpanded, expandedInitRef.current);
    return () => sectionControl.unregisterGroup(key);
  }, [sectionControl]);

  useEffect(() => {
    if (!sectionControl) return;
    sectionControl.notifyGroupState(groupKeyRef.current, isExpanded);
  }, [isExpanded, sectionControl]);

  // Tab mode: reset to default when active tab changes
  useEffect(() => {
    if (displayMode === 'tab') {
      setIsExpanded(expandedInitRef.current);
    }
  }, [activeNavId, displayMode]);

  // Assign auto color
  const colorIndexRef = useRef(null);
  if (colorIndexRef.current === null) {
    colorIndexRef.current = _groupColorIndex++;
  }

  useEffect(() => {
    onGroupMount();
    return () => onGroupUnmount();
  }, []);

  const resolvedColor = color || GROUP_PALETTE[colorIndexRef.current % GROUP_PALETTE.length];

  // Collect child item ids for selectAll
  const itemIds = Children.toArray(children)
    .filter(c => c?.props?.id)
    .map(c => c.props.id);

  const groupId = id ?? label.replace(/\s+/g, '_').toLowerCase();

  // Register group items in main context (for imperative selectAll)
  useEffect(() => {
    return registerGroupItems(groupId, itemIds, label);
  }, [groupId, itemIds, label, registerGroupItems]);

  function handleToggle() {
    const next = !isExpanded;
    setIsExpanded(next);
    fireEvent('groupToggle', { groupId, groupLabel: label, expanded: next });
  }

  const selectAllChecked = checkedItems.get(groupId + '__all') ?? false;

  function handleSelectAll() {
    fireEvent('selectAll', { groupId, groupLabel: label, itemIds });
  }

  const selectAllItem = (
    <div
      key="__selectAll__"
      role="checkbox"
      aria-checked={selectAllChecked}
      tabIndex={0}
      title="Select all"
      className={`hangoverDropdown-item isCheckboxType${selectAllChecked ? ' isChecked' : ''}`}
      onClick={handleSelectAll}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectAll(); } }}
    >
      <span className="hangoverDropdown-item-label">Select all</span>
      <span className={`hangoverDropdown-item-check-icon${selectAllChecked ? ' isVisible' : ''}`}>
        {selectAllChecked && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M12.4714 4.86195C12.7317 5.1223 12.7317 5.54441 12.4714 5.80476L7.13805 11.1381C6.8777 11.3984 6.45559 11.3984 6.19524 11.1381L3.52858 8.47142C3.26823 8.21108 3.26823 7.78897 3.52858 7.52862C3.78892 7.26827 4.21103 7.26827 4.47138 7.52862L6.66665 9.72388L11.5286 4.86195C11.7889 4.6016 12.211 4.6016 12.4714 4.86195Z" fill="currentColor" />
          </svg>
        )}
      </span>
    </div>
  );

  const visibleItemIds = useMemo(() => {
    const searchableItems = Children.toArray(children).map(child => ({
      id: child?.props?.id,
      label: typeof child?.props?.children === 'string' ? child.props.children : '',
    }));

    return getMatchingItemIds(searchableItems, searchQuery);
  }, [children, searchQuery]);

  const groupContextValue = { groupLabel: label, groupId, resolvedColor, visibleItemIds };

  const header = (
    <div
      className={`hangoverDropdown-group-header${isExpanded ? ' isExpanded' : ''}`}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleToggle();
        }
      }}
      aria-expanded={isExpanded}
      aria-label={`${label} — ${isExpanded ? 'collapse' : 'expand'}`}
      title={label}
    >
      <div className="hangoverDropdown-group-header-accent" />
      <div className="hangoverDropdown-group-header-body">
        <div className="hangoverDropdown-group-header-inner">
          {icon && (
              <span className="hangoverDropdown-group-header-icon">
                {renderIcon(icon)}
              </span>
            )}
            <span className="hangoverDropdown-group-header-label">{label}</span>
          <span className="hangoverDropdown-group-header-chevron">
            <Chevron />
          </span>
        </div>
      </div>
    </div>
  );

  const hasChildren = Children.count(children) > 0;

  const hasVisibleItems = !searchQuery || visibleItemIds.size > 0;

  const items = (
    <div className={`hangoverDropdown-group-items-wrap${isExpanded ? ' isExpanded' : ''}`}>
      <div role="group" aria-label={label} className="hangoverDropdown-group-items">
        {showSelectAll && selectAllPosition === 'top' && selectAllItem}
        {hasChildren
          ? hasVisibleItems
            ? children
            : <div className="hangoverDropdown-group-empty">{noResultsText}</div>
          : <div className="hangoverDropdown-group-empty">{emptyText}</div>
        }
        {showSelectAll && selectAllPosition === 'bottom' && selectAllItem}
      </div>
    </div>
  );

  const groupContent = (
    <GroupContext.Provider value={groupContextValue}>
      {header}
      {items}
    </GroupContext.Provider>
  );

  if (Comp) {
    return (
      <Comp
        isExpanded={isExpanded}
        onToggle={handleToggle}
        label={label}
        style={{ '--hangover-group-color': resolvedColor }}
        className="hangoverDropdown-group"
        {...rest}
      >
        {groupContent}
      </Comp>
    );
  }

  return (
    <div
      className="hangoverDropdown-group"
      style={{ '--hangover-group-color': resolvedColor }}
      data-group-label={label}
      {...rest}
    >
      {groupContent}
    </div>
  );
}

export default DropdownGroup;
