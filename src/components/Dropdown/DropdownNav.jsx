import { Children, useEffect, useRef, useState } from 'react';
import DropdownNavItem from './DropdownNavItem';
import { useDropdownContext } from '../../context/DropdownContext';
import { isVisible, closestByVerticalPosition, scrollWithin } from '../../utils/keyboardNav';

/**
 * DropdownNav
 *
 * Left column navigation. Renders an optional "All" item at the top,
 * followed by children (DropdownNavItem elements).
 *
 * Props:
 *  showAll       bool — render an "All" item (default false)
 *  allLabel      string — label for All item (default "All")
 *  allIcon       ReactNode | FC
 *  children      DropdownNavItem elements
 *  component     custom wrapper component
 *  collapsed     bool — initial/default collapsed state (default false)
 *  autoCollapse  bool | 'auto' — true always collapses; 'auto' collapses when
 *                the panel does not fit. Both expand on hover or focus.
 *  autoCollapseDelay number — delay in ms before interactive expansion
 */
function DropdownNav({
  showAll = false,
  allLabel = 'All',
  allIcon,
  children,
  component: Comp,
  collapsed = false,
  autoCollapse = false,
  autoCollapseDelay = 0,
  ...rest
}) {
  const { setHasNav, contentRef } = useDropdownContext();
  const wrapperRef = useRef(null);
  const expandTimerRef = useRef(null);
  const [isAutoWidthCollapsed, setIsAutoWidthCollapsed] = useState(false);
  const [isInteractivelyExpanded, setIsInteractivelyExpanded] = useState(false);

  const childCount = Children.count(children);
  const isSingle = childCount <= 1;
  const canInteractivelyExpand = autoCollapse === true || autoCollapse === 'auto';
  const shouldCollapse = collapsed
    || autoCollapse === true
    || (autoCollapse === 'auto' && isAutoWidthCollapsed);
  const isCollapsed = shouldCollapse && !isInteractivelyExpanded;

  useEffect(() => {
    setHasNav(!isSingle);
    return () => setHasNav(false);
  }, [setHasNav, isSingle]);

  useEffect(() => {
    if (autoCollapse !== 'auto') {
      setIsAutoWidthCollapsed(false);
      return undefined;
    }

    const checkWidth = () => {
      const styles = getComputedStyle(document.documentElement);
      const navWidth = parseFloat(styles.getPropertyValue('--hangover-nav-width')) || 0;
      const contentMaxWidth = parseFloat(styles.getPropertyValue('--hangover-content-max-width')) || 0;
      setIsAutoWidthCollapsed(window.innerWidth < navWidth + contentMaxWidth + 32);
    };

    window.addEventListener('resize', checkWidth);
    checkWidth();

    return () => window.removeEventListener('resize', checkWidth);
  }, [autoCollapse]);

  const clearExpandTimer = () => {
    if (expandTimerRef.current === null) return;
    window.clearTimeout(expandTimerRef.current);
    expandTimerRef.current = null;
  };

  const expandInteractively = () => {
    if (!canInteractivelyExpand || isInteractivelyExpanded || expandTimerRef.current !== null) return;

    const delay = Number.isFinite(autoCollapseDelay)
      ? Math.max(0, autoCollapseDelay)
      : 0;
    if (delay === 0) {
      setIsInteractivelyExpanded(true);
      return;
    }

    expandTimerRef.current = window.setTimeout(() => {
      expandTimerRef.current = null;
      setIsInteractivelyExpanded(true);
    }, delay);
  };

  const collapseInteractively = () => {
    clearExpandTimer();
    setIsInteractivelyExpanded(false);
  };

  useEffect(() => {
    if (!canInteractivelyExpand) collapseInteractively();
  }, [canInteractivelyExpand]);

  useEffect(() => () => clearExpandTimer(), []);

  const handleBlur = e => {
    if (!wrapperRef.current?.contains(e.relatedTarget)) {
      collapseInteractively();
    }

    rest.onBlur?.(e);
  };

  const handleFocus = e => {
    expandInteractively();
    rest.onFocus?.(e);
  };

  const handleMouseEnter = e => {
    expandInteractively();
    rest.onMouseEnter?.(e);
  };

  const handleMouseLeave = e => {
    if (!wrapperRef.current?.contains(document.activeElement)) {
      collapseInteractively();
    }

    rest.onMouseLeave?.(e);
  };

  const inner = (
    <>
      {showAll && (
        <DropdownNavItem id="__all__" icon={allIcon}>
          {allLabel}
        </DropdownNavItem>
      )}
      {children}
    </>
  );

  // Keyboard navigation for the nav column:
  //  - ArrowDown/ArrowUp cycle (wrap) through nav items.
  //  - ArrowRight jumps to the position-closest item in the content column.
  function handleNavKeyDown(e) {
    expandInteractively();
    rest.onKeyDown?.(e);

    const navRoot = wrapperRef.current;
    if (!navRoot) return;
    const active = document.activeElement;

    // Contain keys so they don't bleed out and get captured by the host
    // application's own shortcuts. Escape and Tab pass through for close /
    // focus movement.
    if (e.key !== 'Escape' && e.key !== 'Tab') e.stopPropagation();

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const items = Array.from(navRoot.querySelectorAll('.hangoverDropdown-nav-item:not(:disabled)')).filter(isVisible);
      if (items.length === 0) return;
      e.preventDefault();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const idx = items.indexOf(active);
      const nextIdx = idx === -1
        ? (dir === 1 ? 0 : items.length - 1)
        : (idx + dir + items.length) % items.length;
      const target = items[nextIdx];
      target.focus({ preventScroll: true });
      scrollWithin(navRoot, target);
    } else if (e.key === 'ArrowRight') {
      const list = contentRef?.current;
      if (!list) return;
      const items = Array.from(navRoot.querySelectorAll('.hangoverDropdown-nav-item:not(:disabled)')).filter(isVisible);
      const firstItem = items[0];
      const panel = navRoot.closest('.hangoverDropdown-panel');
      const searchInput = panel?.querySelector('.hangoverDropdown-search-input');
      if (active === firstItem && searchInput && isVisible(searchInput)) {
        e.preventDefault();
        searchInput.focus();
        return;
      }

      const contentItems = Array.from(list.querySelectorAll('.hangoverDropdown-item')).filter(isVisible);
      if (contentItems.length === 0) return;
      e.preventDefault();
      const target = active && active.classList.contains('hangoverDropdown-nav-item')
        ? closestByVerticalPosition(contentItems, active)
        : contentItems[0];
      if (!target) return;
      target.focus({ preventScroll: true });
      const stickyEl = list.querySelector('.hangoverDropdown-section-title');
      const stickyHeight = stickyEl ? stickyEl.offsetHeight : 0;
      scrollWithin(list, target, stickyHeight);
    }
  }

  const colClass = `hangoverDropdown-column forNavigation${isCollapsed ? ' isCollapsed' : ''}`;

  if (isSingle) return null;

  if (Comp) {
    return (
      <Comp
        {...rest}
        ref={wrapperRef}
        className={colClass}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleNavKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <nav className="hangoverDropdown-nav">{inner}</nav>
      </Comp>
    );
  }

  return (
    <div
      {...rest}
      ref={wrapperRef}
      className={colClass}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleNavKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <nav className="hangoverDropdown-nav">{inner}</nav>
    </div>
  );
}

export default DropdownNav;
