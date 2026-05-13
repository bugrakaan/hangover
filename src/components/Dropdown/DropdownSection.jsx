import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropdownContext, SectionContext, SectionControlContext } from '../../context/DropdownContext';

/**
 * DropdownSection
 *
 * Groups DropdownGroups under a nav item's scope.
 *
 * Props:
 *  for      string — matches a DropdownNavItem id (JSX prop `for` is valid)
 *  children DropdownGroup elements
 */
function DropdownSection({ for: forProp, forId: forIdProp, title, children, ...rest }) {
  const { activeNavId, displayMode, registerSectionRef, hasNav } = useDropdownContext();
  const sectionRef = useRef(null);
  const forId = forProp || forIdProp || '__all__';

  // Group registry for expand/collapse all
  const groupTogglersRef = useRef(new Map());
  const [, tick] = useState(0);
  const forceUpdate = useCallback(() => tick(n => n + 1), []);

  const registerGroup = useCallback((key, set, initial) => {
    groupTogglersRef.current.set(key, { set, isExpanded: initial });
    forceUpdate();
  }, [forceUpdate]);

  const unregisterGroup = useCallback((key) => {
    groupTogglersRef.current.delete(key);
    forceUpdate();
  }, [forceUpdate]);

  const notifyGroupState = useCallback((key, isExpanded) => {
    const entry = groupTogglersRef.current.get(key);
    if (!entry || entry.isExpanded === isExpanded) return;
    entry.isExpanded = isExpanded;
    forceUpdate();
  }, [forceUpdate]);

  const sectionControlValue = useMemo(() => ({
    registerGroup,
    unregisterGroup,
    notifyGroupState,
  }), [registerGroup, unregisterGroup, notifyGroupState]);

  // Register this element so DropdownNavItem can scroll to it
  useEffect(() => {
    registerSectionRef(forId, sectionRef.current);
    return () => registerSectionRef(forId, null);
  }, [forId, registerSectionRef]);

  // Tab mode: hide sections that don't match active nav
  if (displayMode === 'tab' && activeNavId !== '__all__' && activeNavId !== forId) {
    return null;
  }

  const groups = [...groupTogglersRef.current.values()];
  const hasGroups = groups.length > 0;
  const allExpanded = hasGroups && groups.every(e => e.isExpanded);

  function handleToggleAll() {
    const next = !allExpanded;
    groupTogglersRef.current.forEach(({ set }) => set(next));
  }

  return (
    <SectionContext.Provider value={{ forId }}>
      <SectionControlContext.Provider value={sectionControlValue}>
        <div className="hangoverDropdown-section" ref={sectionRef} data-section-for={forId} {...rest}>
          {title && hasNav && !(displayMode === 'tab' && activeNavId === '__all__') && (
            <div
              className={`hangoverDropdown-section-title${hasGroups ? ' isClickable' : ''}`}
              onClick={hasGroups ? handleToggleAll : undefined}
              aria-label={hasGroups ? (allExpanded ? 'Collapse all groups' : 'Expand all groups') : undefined}
              role={hasGroups ? 'button' : undefined}
              tabIndex={hasGroups ? 0 : undefined}
              onKeyDown={hasGroups ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleAll(); } } : undefined}
            >
              <span>{title}</span>
            </div>
          )}
          {children}
        </div>
      </SectionControlContext.Provider>
    </SectionContext.Provider>
  );
}

export default DropdownSection;
