import { Children, useEffect, useRef, useState } from 'react';
import DropdownNavItem from './DropdownNavItem';
import { useDropdownContext } from '../../context/DropdownContext';

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
 *  autoCollapse  bool — automatically collapse when window is too narrow to fit the panel (default false)
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
  const { setHasNav } = useDropdownContext();
  const wrapperRef = useRef(null);
  const naturalWidthRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const childCount = Children.count(children);
  const isSingle = childCount <= 1;

  useEffect(() => {
    setHasNav(!isSingle);
    return () => setHasNav(false);
  }, [setHasNav, isSingle]);

  // collapsed prop always sets the base state
  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  useEffect(() => {
    if (!autoCollapse) return;

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
      setIsCollapsed(panelTooWide || collapsed);
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
  }, [autoCollapse, collapsed]);

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

  const colClass = `hangoverDropdown-column forNavigation${isCollapsed ? ' isCollapsed' : ''}`;

  if (isSingle) return null;

  if (Comp) {
    return (
      <Comp ref={wrapperRef} className={colClass} {...rest}>
        <nav className="hangoverDropdown-nav">{inner}</nav>
      </Comp>
    );
  }

  return (
    <div ref={wrapperRef} className={colClass} {...rest}>
      <nav className="hangoverDropdown-nav">{inner}</nav>
    </div>
  );
}

export default DropdownNav;
