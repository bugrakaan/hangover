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
 *  autoCollapse  bool | 'auto' — automatically collapse when window is too narrow
 *                to fit the panel. In 'auto' mode, a collapsed nav expands
 *                while hovered or keyboard-focused.
 */
function DropdownNav({
  showAll = false,
  allLabel = 'All',
  allIcon,
  children,
  component: Comp,
  collapsed = false,
  autoCollapse = false,
  ...rest
}) {
  const { setHasNav, contentRef } = useDropdownContext();
  const wrapperRef = useRef(null);
  const naturalWidthRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isInteractivelyExpanded, setIsInteractivelyExpanded] = useState(false);

  const childCount = Children.count(children);
  const isSingle = childCount <= 1;
  const shouldAutoCollapse = autoCollapse === true || autoCollapse === 'auto';
  const canInteractivelyExpand = autoCollapse === 'auto' && collapsed;

  useEffect(() => {
    setHasNav(!isSingle);
    return () => setHasNav(false);
  }, [setHasNav, isSingle]);

  // collapsed prop always sets the base state
  useEffect(() => {
    if (canInteractivelyExpand && isInteractivelyExpanded) {
      setIsCollapsed(false);
      return;
    }

    setIsCollapsed(collapsed);
  }, [canInteractivelyExpand, collapsed, isInteractivelyExpanded]);

  useEffect(() => {
    if (!shouldAutoCollapse) return;

    function getNaturalWidth() {
      const styles = getComputedStyle(document.documentElement);
      const navWidth = parseFloat(styles.getPropertyValue('--hangover-nav-width')) || 0;
      const contentMaxWidth = parseFloat(styles.getPropertyValue('--hangover-content-max-width')) || 0;
      return navWidth + contentMaxWidth;
    }

    function check() {
      if (naturalWidthRef.current === null) {
        naturalWidthRef.current = getNaturalWidth();
      }
      const panelTooWide = window.innerWidth < naturalWidthRef.current + 32;
      setIsCollapsed(canInteractivelyExpand && isInteractivelyExpanded
        ? false
        : panelTooWide || collapsed);
    }

    window.addEventListener('resize', check);
    window.addEventListener('scroll', check, { passive: true });
    check();

    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('scroll', check);
      naturalWidthRef.current = null;
      setIsCollapsed(collapsed);
    };
  }, [canInteractivelyExpand, collapsed, isInteractivelyExpanded, shouldAutoCollapse]);

  const expandInteractively = () => {
    if (canInteractivelyExpand) {
      setIsInteractivelyExpanded(true);
    }
  };

  const collapseInteractively = () => {
    if (canInteractivelyExpand) {
      setIsInteractivelyExpanded(false);
    }
  };

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
      const items = Array.from(navRoot.querySelectorAll('.hangoverDropdown-nav-item')).filter(isVisible);
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
      const items = Array.from(navRoot.querySelectorAll('.hangoverDropdown-nav-item')).filter(isVisible);
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
