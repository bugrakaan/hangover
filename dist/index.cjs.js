'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var reactDom = require('react-dom');
var jsxRuntime = require('react/jsx-runtime');

const DropdownContext = /*#__PURE__*/react.createContext(null);
function useDropdownContext() {
  const ctx = react.useContext(DropdownContext);
  if (!ctx) throw new Error('useDropdownContext must be used inside <Dropdown>');
  return ctx;
}

// Passed down from DropdownSection so DropdownGroup/Item know their forId
const SectionContext = /*#__PURE__*/react.createContext(null);

// Passed down from DropdownSection so DropdownGroup can register for expand/collapse all
const SectionControlContext = /*#__PURE__*/react.createContext(null);

// Passed down from DropdownGroup so DropdownItem knows its groupLabel + auto-color index
const GroupContext = /*#__PURE__*/react.createContext(null);

/**
 * DropdownTrigger
 *
 * Wraps any single child and turns it into the dropdown trigger.
 * Injects: ref, onClick, aria-expanded, aria-haspopup
 */
function DropdownTrigger({
  children
}) {
  const {
    triggerRef,
    isOpen,
    fireEvent,
    t
  } = useDropdownContext();
  const child = react.Children.only(children);
  function handleClick(e) {
    if (isOpen) {
      fireEvent('close', {
        trigger: 'click'
      });
    } else {
      fireEvent('open', {
        trigger: 'click'
      });
    }
    child.props.onClick?.(e);
  }
  const childChildren = child.props.children;
  const translatedChildren = typeof childChildren === 'string' ? t(childChildren) : childChildren;
  return /*#__PURE__*/react.cloneElement(child, {
    ref: triggerRef,
    onClick: handleClick,
    'aria-expanded': isOpen,
    'aria-haspopup': 'dialog'
  }, translatedChildren);
}

/**
 * calculatePosition
 * Pure function — no DOM side effects.
 *
 * @param {DOMRect} triggerRect
 * @param {DOMRect} popoverRect
 * @param {string}  placement   "bottom-start" | "bottom-end" | "bottom" |
 *                               "top-start"    | "top-end"    | "top"    |
 *                               "left"         | "right"
 * @param {number}  offset      gap between trigger and popover (px)
 * @param {number}  viewportPadding  min distance from viewport edge (px)
 * @returns {{ top: number, left: number, actualPlacement: string }}
 *
 * Coordinates are viewport-relative (for position:fixed).
 */
function calculatePosition(triggerRect, popoverRect, placement = 'bottom-start', offset = 8, viewportPadding = 8) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const [side, align] = placement.split('-'); // e.g. "bottom", "start"

  // --- Candidate positions for each side ---
  function coords(s, a) {
    let top, left;
    switch (s) {
      case 'bottom':
        top = triggerRect.bottom + offset;
        break;
      case 'top':
        top = triggerRect.top - popoverRect.height - offset;
        break;
      case 'left':
        left = triggerRect.left - popoverRect.width - offset;
        top = _alignCross(triggerRect, popoverRect, a);
        return {
          top,
          left
        };
      case 'right':
        left = triggerRect.right + offset;
        top = _alignCross(triggerRect, popoverRect, a);
        return {
          top,
          left
        };
      default:
        top = triggerRect.bottom + offset;
    }

    // horizontal alignment for top/bottom
    switch (a) {
      case 'start':
        left = triggerRect.left;
        break;
      case 'end':
        left = triggerRect.right - popoverRect.width;
        break;
      default:
        // center
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
    }
    return {
      top,
      left
    };
  }

  // --- Fits check: all four edges ---
  function fitsInViewport(pos) {
    return pos.top >= viewportPadding && pos.top + popoverRect.height <= vh - viewportPadding && pos.left >= viewportPadding && pos.left + popoverRect.width <= vw - viewportPadding;
  }

  // --- All 8 candidate placements ---
  const ALL_PLACEMENTS = [['bottom', 'start'], ['bottom', undefined], ['bottom', 'end'], ['top', 'start'], ['top', undefined], ['top', 'end'], ['left', undefined], ['right', undefined]];
  const originalPos = coords(side, align);
  let resolvedSide = side;
  let resolvedAlign = align;
  let pos = originalPos;
  let fitted = fitsInViewport(originalPos);
  if (!fitted) {
    // Among all fitting candidates, pick the one closest to the original position
    let bestDist = Infinity;
    for (const [s, a] of ALL_PLACEMENTS) {
      const p = coords(s, a);
      if (!fitsInViewport(p)) continue;
      const dx = p.left - originalPos.left;
      const dy = p.top - originalPos.top;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        resolvedSide = s;
        resolvedAlign = a;
        pos = p;
        fitted = true;
      }
    }

    // if nothing fits, fitted stays false — caller handles fallback
  }

  // Clamp only when a fitting placement was found
  if (fitted) {
    pos.top = Math.min(Math.max(pos.top, viewportPadding), vh - popoverRect.height - viewportPadding);
    pos.left = Math.min(Math.max(pos.left, viewportPadding), vw - popoverRect.width - viewportPadding);
  }
  const actualPlacement = resolvedAlign ? `${resolvedSide}-${resolvedAlign}` : resolvedSide;
  return {
    top: pos.top,
    left: pos.left,
    actualPlacement,
    fitted
  };
}

// Cross-axis alignment helper for left/right sides
function _alignCross(triggerRect, popoverRect, align, axis) {
  {
    switch (align) {
      case 'start':
        return triggerRect.top;
      case 'end':
        return triggerRect.bottom - popoverRect.height;
      default:
        return triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
    }
  }
}

/**
 * Convert placement string to CSS class suffix.
 * "bottom-start" → "forBottomStart"
 */
function placementToClass(placement) {
  return 'for' + placement.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

/**
 * Returns scrollable ancestors of an element (including window).
 */
function getScrollableAncestors(el) {
  const ancestors = [];
  let current = el.parentElement;
  while (current && current !== document.documentElement) {
    const {
      overflow,
      overflowY,
      overflowX
    } = getComputedStyle(current);
    if (/auto|scroll/.test(overflow + overflowY + overflowX)) {
      ancestors.push(current);
    }
    current = current.parentElement;
  }
  ancestors.push(window);
  return ancestors;
}

/**
 * usePositioner
 *
 * Keeps a floating panel anchored to a trigger element.
 * Uses position:fixed so scroll doesn't shift the panel — but recalculates
 * whenever the trigger moves (scroll, resize, layout shift).
 *
 * @param {React.RefObject} triggerRef
 * @param {React.RefObject} panelRef
 * @param {string}          placement  e.g. "bottom-start"
 * @param {number}          offset     gap in px
 * @param {boolean}         isOpen
 * @returns {{ style: CSSProperties, actualPlacement: string }}
 */
function usePositioner(triggerRef, panelRef, placement, offset, isOpen) {
  const [actualPlacement, setActualPlacement] = react.useState(placement);
  const rafId = react.useRef(null);
  const lastFittedPlacementRef = react.useRef(placement);
  const resolvedPlacementRef = react.useRef(placement);
  const initializedRef = react.useRef(false);
  const recalculate = react.useCallback(() => {
    if (!triggerRef.current || !panelRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    let result = calculatePosition(triggerRect, panelRect, placement, offset);
    if (result.fitted) {
      lastFittedPlacementRef.current = result.actualPlacement;
    } else {
      result = calculatePosition(triggerRect, panelRect, lastFittedPlacementRef.current, offset);
    }

    // Apply position directly to the DOM — bypasses React re-render for
    // smoother scroll tracking (no setState → reconciliation → commit cycle)
    const el = panelRef.current;
    el.style.top = result.top + 'px';
    el.style.left = result.left + 'px';
    if (!initializedRef.current) {
      el.style.visibility = '';
      initializedRef.current = true;
    }

    // Only trigger a React re-render when the placement class needs to change
    if (result.actualPlacement !== resolvedPlacementRef.current) {
      resolvedPlacementRef.current = result.actualPlacement;
      setActualPlacement(result.actualPlacement);
    }
  }, [triggerRef, panelRef, placement, offset]);
  const scheduleRecalc = react.useCallback(() => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      recalculate();
    });
  }, [recalculate]);
  react.useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      lastFittedPlacementRef.current = placement;
      resolvedPlacementRef.current = placement;
      setActualPlacement(placement);
      return;
    }

    // Initial calc after panel mounts (needs 1 rAF so panel has dimensions)
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      recalculate();
    });

    // ResizeObserver on trigger + panel
    const ro = new ResizeObserver(scheduleRecalc);
    if (triggerRef.current) ro.observe(triggerRef.current);
    if (panelRef.current) ro.observe(panelRef.current);

    // Scrollable ancestors
    const ancestors = triggerRef.current ? getScrollableAncestors(triggerRef.current) : [window];
    const opts = {
      passive: true
    };
    ancestors.forEach(el => el.addEventListener('scroll', scheduleRecalc, opts));
    window.addEventListener('resize', scheduleRecalc, opts);
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      ro.disconnect();
      ancestors.forEach(el => el.removeEventListener('scroll', scheduleRecalc, opts));
      window.removeEventListener('resize', scheduleRecalc, opts);
    };
  }, [isOpen, recalculate, scheduleRecalc, triggerRef, panelRef]);
  return {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      visibility: 'hidden',
      zIndex: 9999
    },
    actualPlacement
  };
}

/**
 * useOutsideClick
 *
 * Calls `callback` when a mousedown event occurs outside ALL of the
 * provided refs.
 *
 * @param {React.RefObject[]} refs
 * @param {function}          callback
 */
function useOutsideClick(refs, callback) {
  react.useEffect(() => {
    function handleMouseDown(e) {
      const isOutside = refs.every(ref => {
        if (!ref.current) return true;
        return !ref.current.contains(e.target);
      });
      if (isOutside) callback(e);
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [refs, callback]);
}

function DropdownPanel({
  placement = 'bottom-start',
  offset = 8,
  title,
  anchor,
  component: Comp,
  children,
  ...rest
}) {
  const resolvedOffset = typeof offset === 'string' ? parseFloat(offset) : offset;
  const {
    isOpen,
    triggerRef,
    fireEvent,
    hasNav,
    darkMode,
    t
  } = useDropdownContext();
  const panelRef = react.useRef(null);
  const anchorRef = anchor ?? triggerRef;
  const {
    style,
    actualPlacement
  } = usePositioner(anchorRef, panelRef, placement, resolvedOffset, isOpen);

  // Outside click
  useOutsideClick([anchorRef, panelRef], () => {
    if (isOpen) fireEvent('close', {
      trigger: 'outside'
    });
  });

  // Escape key
  react.useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        fireEvent('close', {
          trigger: 'escape'
        });
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, fireEvent]);
  if (!isOpen) return null;
  const placementClass = placementToClass(actualPlacement);
  const classNames = `hangoverDropdown-panel ${placementClass} isOpen${hasNav ? '' : ' hasNoNav'}${darkMode ? ' hangoverDropdown--dark' : ''}`;
  const content = Comp ? /*#__PURE__*/jsxRuntime.jsx(Comp, {
    ref: panelRef,
    isOpen: isOpen,
    placement: actualPlacement,
    style: style,
    className: classNames,
    title: t(title),
    ...rest,
    children: children
  }) : /*#__PURE__*/jsxRuntime.jsxs("div", {
    ref: panelRef,
    className: classNames,
    style: style,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": t('Dropdown'),
    ...rest,
    children: [title && /*#__PURE__*/jsxRuntime.jsx("div", {
      className: "hangoverDropdown-panel-title",
      children: t(title)
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      className: "hangoverDropdown-panel-inner",
      children: children
    })]
  });
  return /*#__PURE__*/reactDom.createPortal(content, document.body);
}

/**
 * Renders an icon that can be either:
 *  - A React element (instance): <MyIcon />  → returned as-is
 *  - A React component (FC/class): MyIcon    → instantiated with createElement
 *
 * @param {React.ReactNode|React.ComponentType} icon
 * @returns {React.ReactNode|null}
 */
function renderIcon(icon) {
  if (!icon) return null;
  if (/*#__PURE__*/react.isValidElement(icon)) return icon;
  if (typeof icon === 'function') return /*#__PURE__*/react.createElement(icon);
  return null;
}

function DropdownNavItem({
  id,
  icon,
  children,
  component: Comp,
  ...rest
}) {
  const {
    activeNavId,
    fireEvent,
    displayMode,
    contentRef,
    sectionRefs,
    registerNavLabel,
    t
  } = useDropdownContext();
  const isActive = activeNavId === id;
  const buttonRef = react.useRef(null);
  react.useEffect(() => {
    registerNavLabel(id, typeof children === 'string' ? children : '');
  }, [id, children, registerNavLabel]);

  // When this item becomes active (e.g. via scroll-spy on the right column),
  // keep it visible inside the scrollable nav column.
  react.useEffect(() => {
    if (!isActive) return;
    const el = buttonRef.current;
    if (!el) return;
    const container = el.closest('.hangoverDropdown-column.forNavigation');
    if (!container) return;

    // Leave a gap-sized breathing space so the active item never sits flush
    // against the top/bottom edge of the nav column.
    const navList = el.parentElement;
    const gap = navList ? parseFloat(getComputedStyle(navList).rowGap || getComputedStyle(navList).gap) || 0 : 0;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    let delta = 0;
    if (elRect.top < containerRect.top + gap) {
      delta = elRect.top - containerRect.top - gap;
    } else if (elRect.bottom > containerRect.bottom - gap) {
      delta = elRect.bottom - containerRect.bottom + gap;
    }
    if (delta !== 0) {
      container.scrollTo({
        top: container.scrollTop + delta,
        behavior: 'smooth'
      });
    }
  }, [isActive]);
  function handleClick() {
    fireEvent('navChange', {
      id
    });
    if (displayMode === 'scroll') {
      const sectionEl = sectionRefs.get(id);
      const scrollContainer = contentRef.current;
      if (sectionEl && scrollContainer) {
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const sectionTop = sectionEl.getBoundingClientRect().top;
        const offset = sectionTop - containerTop + scrollContainer.scrollTop;
        scrollContainer.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      } else if (id === '__all__' && scrollContainer) {
        scrollContainer.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }
  const {
    onClick: userOnClick,
    ...navItemRest
  } = rest;
  const bindingProps = {
    isActive,
    onClick: () => {
      handleClick();
      userOnClick?.();
    },
    id,
    children
  };
  if (Comp) {
    return /*#__PURE__*/jsxRuntime.jsx(Comp, {
      ...bindingProps,
      "data-ho-active": isActive,
      ...navItemRest
    });
  }
  return /*#__PURE__*/jsxRuntime.jsxs("button", {
    type: "button",
    ref: buttonRef,
    className: `hangoverDropdown-nav-item${isActive ? ' isActive' : ''}`,
    onClick: () => {
      handleClick();
      userOnClick?.();
    },
    title: typeof children === 'string' ? t(children) : undefined,
    "data-ho-active": isActive,
    ...navItemRest,
    children: [icon && /*#__PURE__*/jsxRuntime.jsx("span", {
      className: "hangoverDropdown-nav-item-icon",
      "aria-hidden": "true",
      children: renderIcon(icon)
    }), /*#__PURE__*/jsxRuntime.jsx("span", {
      className: "hangoverDropdown-nav-item-label",
      children: typeof children === 'string' ? t(children) : children
    })]
  });
}

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
  const {
    setHasNav
  } = useDropdownContext();
  const wrapperRef = react.useRef(null);
  const naturalWidthRef = react.useRef(null);
  const [isCollapsed, setIsCollapsed] = react.useState(collapsed);
  const childCount = react.Children.count(children);
  const isSingle = childCount <= 1;
  react.useEffect(() => {
    setHasNav(!isSingle);
    return () => setHasNav(false);
  }, [setHasNav, isSingle]);

  // collapsed prop always sets the base state
  react.useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);
  react.useEffect(() => {
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
    window.addEventListener('scroll', check, {
      passive: true
    });
    check();
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('scroll', check);
      naturalWidthRef.current = null;
      setIsCollapsed(collapsed);
    };
  }, [autoCollapse, collapsed]);
  const inner = /*#__PURE__*/jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [showAll && /*#__PURE__*/jsxRuntime.jsx(DropdownNavItem, {
      id: "__all__",
      icon: allIcon,
      children: allLabel
    }), children]
  });
  const colClass = `hangoverDropdown-column forNavigation${isCollapsed ? ' isCollapsed' : ''}`;
  if (isSingle) return null;
  if (Comp) {
    return /*#__PURE__*/jsxRuntime.jsx(Comp, {
      ref: wrapperRef,
      className: colClass,
      ...rest,
      children: /*#__PURE__*/jsxRuntime.jsx("nav", {
        className: "hangoverDropdown-nav",
        children: inner
      })
    });
  }
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    ref: wrapperRef,
    className: colClass,
    ...rest,
    children: /*#__PURE__*/jsxRuntime.jsx("nav", {
      className: "hangoverDropdown-nav",
      children: inner
    })
  });
}

function DefaultSearchIcon() {
  return /*#__PURE__*/jsxRuntime.jsx("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    fill: "none",
    "aria-hidden": "true",
    children: /*#__PURE__*/jsxRuntime.jsx("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M13.1355 14.3129C11.9293 15.2651 10.406 15.8334 8.74999 15.8334C4.83797 15.8334 1.66666 12.662 1.66666 8.75002C1.66666 4.838 4.83797 1.66669 8.74999 1.66669C12.662 1.66669 15.8333 4.838 15.8333 8.75002C15.8333 10.406 15.265 11.9293 14.3129 13.1355C14.3218 13.1437 14.3306 13.1521 14.3392 13.1608L18.0892 16.9108C18.4147 17.2362 18.4147 17.7638 18.0892 18.0893C17.7638 18.4147 17.2362 18.4147 16.9107 18.0893L13.1607 14.3393C13.1521 14.3306 13.1437 14.3218 13.1355 14.3129ZM14.1667 8.75002C14.1667 11.7416 11.7415 14.1667 8.74999 14.1667C5.75845 14.1667 3.33332 11.7416 3.33332 8.75002C3.33332 5.75848 5.75845 3.33335 8.74999 3.33335C11.7415 3.33335 14.1667 5.75848 14.1667 8.75002Z",
      fill: "currentColor"
    })
  });
}

/**
 * DropdownContent
 *
 * Right column: section title + search input + scrollable list.
 *
 * Props:
 *  searchPlaceholder  string (default "Search")
 *  emptyText          string (default "Nothing to show here") — shown when
 *                     Content has no children; the search bar is hidden too
 *  title              string — overrides active nav label as section title
 *  component          custom wrapper component
 *  children           DropdownSection / DropdownGroup / DropdownItem elements
 */
function DropdownContent({
  searchPlaceholder = 'Search',
  emptyText = 'Nothing to show here',
  component: Comp,
  children,
  ...rest
}) {
  const {
    searchQuery,
    fireEvent,
    contentRef,
    displayMode,
    activeNavId,
    setScrollSpyActive,
    t
  } = useDropdownContext();
  const searchInputRef = react.useRef(null);
  const bottomPadRef = react.useRef(0);

  // Scroll spy: update active nav based on scroll position
  react.useEffect(() => {
    if (displayMode !== 'scroll') return;
    const scrollEl = contentRef.current;
    if (!scrollEl) return;
    function updateSpy() {
      const {
        scrollTop,
        scrollHeight,
        clientHeight
      } = scrollEl;

      // En üstteyken → All
      if (scrollTop <= 2) {
        setScrollSpyActive('__all__');
        return;
      }

      // En alttayken → son section
      if (scrollTop + clientHeight >= scrollHeight - 2) {
        const sections = Array.from(scrollEl.querySelectorAll('[data-section-for]'));
        const last = sections[sections.length - 1];
        if (last) setScrollSpyActive(last.dataset.sectionFor);
        return;
      }

      // Ortadayken → top'u geçen son section
      const sections = Array.from(scrollEl.querySelectorAll('[data-section-for]'));
      const containerRect = scrollEl.getBoundingClientRect();
      let activeId = null;
      for (const el of sections) {
        const top = el.getBoundingClientRect().top - containerRect.top;
        if (top <= 8) activeId = el.dataset.sectionFor;
      }
      if (activeId) setScrollSpyActive(activeId);
    }
    scrollEl.addEventListener('scroll', updateSpy, {
      passive: true
    });
    return () => scrollEl.removeEventListener('scroll', updateSpy);
  }, [displayMode, contentRef, setScrollSpyActive]);

  // Tab mode: reset scroll position when active tab changes
  react.useEffect(() => {
    if (displayMode !== 'tab') return;
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [displayMode, activeNavId, contentRef]);

  // Scroll mode: reserve enough space at the bottom of the list so the last
  // section (even a short single-entry one) can be scrolled all the way to the
  // top. Without this, a short last section can never reach the top because the
  // container has already hit its maximum scroll position.
  react.useEffect(() => {
    if (displayMode !== 'scroll') return;
    const list = contentRef.current;
    if (!list) return;
    function updateBottomSpace() {
      const sections = list.querySelectorAll('[data-section-for]');
      const lastSection = sections[sections.length - 1];
      if (!lastSection) {
        list.style.paddingBottom = '';
        bottomPadRef.current = 0;
        return;
      }

      // Derive the natural content height by subtracting our own reserved
      // space, so recomputes never compound. Using real geometry for the last
      // section's top keeps this margin-safe (bottom padding sits after it, so
      // it never shifts the section's top position).
      const available = list.clientHeight;
      const naturalScrollHeight = list.scrollHeight - bottomPadRef.current;
      const listTop = list.getBoundingClientRect().top;
      const lastTopWithinContent = lastSection.getBoundingClientRect().top - listTop + list.scrollTop;
      const spaceBelowLastTop = naturalScrollHeight - lastTopWithinContent;
      const pad = Math.max(0, available - spaceBelowLastTop);
      bottomPadRef.current = pad;
      list.style.paddingBottom = `${pad}px`;
    }
    updateBottomSpace();

    // Observe both the container (viewport resize) and every section (group
    // expand/collapse, late reflows) so the reserved space stays accurate.
    const observer = new ResizeObserver(updateBottomSpace);
    observer.observe(list);
    list.querySelectorAll('[data-section-for]').forEach(section => {
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, [displayMode, contentRef, children, searchQuery]);
  function handleSearch(e) {
    fireEvent('search', {
      query: e.target.value
    });
  }

  // Keyboard navigation: ArrowDown/ArrowUp move focus across the currently
  // visible items (works before and after searching, since filtered items
  // are removed from the DOM). Enter is handled by each item itself.
  function scrollItemIntoView(el) {
    const list = contentRef.current;
    if (!list || !el) return;

    // Offset by the sticky section header so the item stays fully visible
    // when navigating upwards.
    const stickyEl = list.querySelector('.hangoverDropdown-section-title');
    const stickyHeight = stickyEl ? stickyEl.offsetHeight : 0;
    const listRect = list.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    let delta = 0;
    if (elRect.top < listRect.top + stickyHeight) {
      delta = elRect.top - (listRect.top + stickyHeight);
    } else if (elRect.bottom > listRect.bottom) {
      delta = elRect.bottom - listRect.bottom;
    }
    if (delta !== 0) {
      list.scrollTo({
        top: list.scrollTop + delta,
        behavior: 'smooth'
      });
    }
  }
  function moveItemFocus(direction) {
    const list = contentRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll('.hangoverDropdown-item')).filter(el => el.offsetParent !== null);
    if (items.length === 0) return;
    const active = document.activeElement;
    const idx = items.indexOf(active);
    if (direction === 1) {
      const next = idx < 0 ? items[0] : items[idx + 1];
      if (next) {
        next.focus({
          preventScroll: true
        });
        scrollItemIntoView(next);
      }
    } else if (idx > 0) {
      const prev = items[idx - 1];
      prev.focus({
        preventScroll: true
      });
      scrollItemIntoView(prev);
    } else if (idx === 0 && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }
  function handleKeyNav(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveItemFocus(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveItemFocus(-1);
    }
  }
  const isEmpty = react.Children.count(children) === 0;
  const inner = /*#__PURE__*/jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [!isEmpty && /*#__PURE__*/jsxRuntime.jsxs("label", {
      className: "hangoverDropdown-search",
      children: [/*#__PURE__*/jsxRuntime.jsx("span", {
        className: "hangoverDropdown-search-icon",
        children: /*#__PURE__*/jsxRuntime.jsx(DefaultSearchIcon, {})
      }), /*#__PURE__*/jsxRuntime.jsx("input", {
        type: "text",
        className: "hangoverDropdown-search-input",
        placeholder: t(searchPlaceholder),
        "aria-label": t(searchPlaceholder),
        value: searchQuery,
        onChange: handleSearch,
        onKeyDown: handleKeyNav,
        ref: searchInputRef
      })]
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      role: "listbox",
      className: `hangoverDropdown-list${displayMode === 'tab' ? ' isTabMode' : ''}${displayMode === 'tab' && activeNavId === '__all__' ? ' isAllActive' : ''}`,
      ref: contentRef,
      onKeyDown: handleKeyNav,
      children: isEmpty ? /*#__PURE__*/jsxRuntime.jsx("div", {
        className: "hangoverDropdown-content-empty",
        children: t(emptyText)
      }) : children
    })]
  });
  if (Comp) {
    return /*#__PURE__*/jsxRuntime.jsx(Comp, {
      className: "hangoverDropdown-column forItems",
      searchQuery: searchQuery,
      onSearchChange: handleSearch,
      ...rest,
      children: inner
    });
  }
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    className: "hangoverDropdown-column forItems",
    ...rest,
    children: inner
  });
}

function DropdownSection({
  for: forProp,
  forId: forIdProp,
  title,
  children,
  ...rest
}) {
  const {
    activeNavId,
    displayMode,
    registerSectionRef,
    hasNav,
    t
  } = useDropdownContext();
  const sectionRef = react.useRef(null);
  const forId = forProp || forIdProp || '__all__';

  // Group registry for expand/collapse all
  const groupTogglersRef = react.useRef(new Map());
  const [, tick] = react.useState(0);
  const forceUpdate = react.useCallback(() => tick(n => n + 1), []);
  const registerGroup = react.useCallback((key, set, initial) => {
    groupTogglersRef.current.set(key, {
      set,
      isExpanded: initial
    });
    forceUpdate();
  }, [forceUpdate]);
  const unregisterGroup = react.useCallback(key => {
    groupTogglersRef.current.delete(key);
    forceUpdate();
  }, [forceUpdate]);
  const notifyGroupState = react.useCallback((key, isExpanded) => {
    const entry = groupTogglersRef.current.get(key);
    if (!entry || entry.isExpanded === isExpanded) return;
    entry.isExpanded = isExpanded;
    forceUpdate();
  }, [forceUpdate]);
  const sectionControlValue = react.useMemo(() => ({
    registerGroup,
    unregisterGroup,
    notifyGroupState
  }), [registerGroup, unregisterGroup, notifyGroupState]);

  // Register this element so DropdownNavItem can scroll to it
  react.useEffect(() => {
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
    groupTogglersRef.current.forEach(({
      set
    }) => set(next));
  }
  return /*#__PURE__*/jsxRuntime.jsx(SectionContext.Provider, {
    value: {
      forId
    },
    children: /*#__PURE__*/jsxRuntime.jsx(SectionControlContext.Provider, {
      value: sectionControlValue,
      children: /*#__PURE__*/jsxRuntime.jsxs("div", {
        className: "hangoverDropdown-section",
        ref: sectionRef,
        "data-section-for": forId,
        ...rest,
        children: [title && hasNav && !(displayMode === 'tab' && activeNavId === '__all__') && /*#__PURE__*/jsxRuntime.jsx("div", {
          className: `hangoverDropdown-section-title${hasGroups ? ' isClickable' : ''}`,
          onClick: hasGroups ? handleToggleAll : undefined,
          "aria-label": hasGroups ? allExpanded ? t('Collapse all groups') : t('Expand all groups') : undefined,
          role: hasGroups ? 'button' : undefined,
          tabIndex: hasGroups ? 0 : undefined,
          onKeyDown: hasGroups ? e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleAll();
            }
          } : undefined,
          children: /*#__PURE__*/jsxRuntime.jsx("span", {
            children: t(title)
          })
        }), children]
      })
    })
  });
}

/**
 * Fuse.js v7.3.0 - Lightweight fuzzy-search (http://fusejs.io)
 *
 * Copyright (c) 2026 Kiro Risk (http://kiro.me)
 * All Rights Reserved. Apache Software License 2.0
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

function isArray(value) {
  return !Array.isArray ? getTag(value) === '[object Array]' : Array.isArray(value);
}
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  const result = value + '';
  return result == '0' && 1 / value == -Infinity ? '-0' : result;
}
function toString(value) {
  return value == null ? '' : baseToString(value);
}
function isString(value) {
  return typeof value === 'string';
}
function isNumber(value) {
  return typeof value === 'number';
}

// Adapted from: https://github.com/lodash/lodash/blob/master/isBoolean.js
function isBoolean(value) {
  return value === true || value === false || isObjectLike(value) && getTag(value) == '[object Boolean]';
}
function isObject(value) {
  return typeof value === 'object';
}

// Checks if `value` is object-like.
function isObjectLike(value) {
  return isObject(value) && value !== null;
}
function isDefined(value) {
  return value !== undefined && value !== null;
}
function isBlank(value) {
  return !value.trim().length;
}

// Gets the `toStringTag` of `value`.
// Adapted from: https://github.com/lodash/lodash/blob/master/.internal/getTag.js
function getTag(value) {
  return value == null ? value === undefined ? '[object Undefined]' : '[object Null]' : Object.prototype.toString.call(value);
}

const INCORRECT_INDEX_TYPE = "Incorrect 'index' type";
const LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY = key => `Invalid value for key ${key}`;
const PATTERN_LENGTH_TOO_LARGE = max => `Pattern length exceeds max of ${max}.`;
const MISSING_KEY_PROPERTY = name => `Missing ${name} property in key`;
const INVALID_KEY_WEIGHT_VALUE = key => `Property 'weight' in key '${key}' must be a positive integer`;

const hasOwn = Object.prototype.hasOwnProperty;
class KeyStore {
  constructor(keys) {
    this._keys = [];
    this._keyMap = {};
    let totalWeight = 0;
    keys.forEach(key => {
      const obj = createKey(key);
      this._keys.push(obj);
      this._keyMap[obj.id] = obj;
      totalWeight += obj.weight;
    });

    // Normalize weights so that their sum is equal to 1
    this._keys.forEach(key => {
      key.weight /= totalWeight;
    });
  }
  get(keyId) {
    return this._keyMap[keyId];
  }
  keys() {
    return this._keys;
  }
  toJSON() {
    return JSON.stringify(this._keys);
  }
}
function createKey(key) {
  let path = null;
  let id = null;
  let src = null;
  let weight = 1;
  let getFn = null;
  if (isString(key) || isArray(key)) {
    src = key;
    path = createKeyPath(key);
    id = createKeyId(key);
  } else {
    if (!hasOwn.call(key, 'name')) {
      throw new Error(MISSING_KEY_PROPERTY('name'));
    }
    const name = key.name;
    src = name;
    if (hasOwn.call(key, 'weight')) {
      weight = key.weight;
      if (weight <= 0) {
        throw new Error(INVALID_KEY_WEIGHT_VALUE(name));
      }
    }
    path = createKeyPath(name);
    id = createKeyId(name);
    getFn = key.getFn;
  }
  return {
    path: path,
    id: id,
    weight,
    src: src,
    getFn
  };
}
function createKeyPath(key) {
  return isArray(key) ? key : key.split('.');
}
function createKeyId(key) {
  return isArray(key) ? key.join('.') : key;
}

function get(obj, path) {
  const list = [];
  let arr = false;
  const deepGet = (obj, path, index, arrayIndex) => {
    if (!isDefined(obj)) {
      return;
    }
    if (!path[index]) {
      // If there's no path left, we've arrived at the object we care about.
      list.push(arrayIndex !== undefined ? {
        v: obj,
        i: arrayIndex
      } : obj);
    } else {
      const key = path[index];
      const value = obj[key];
      if (!isDefined(value)) {
        return;
      }

      // If we're at the last value in the path, and if it's a string/number/bool,
      // add it to the list
      if (index === path.length - 1 && (isString(value) || isNumber(value) || isBoolean(value) || typeof value === 'bigint')) {
        list.push(arrayIndex !== undefined ? {
          v: toString(value),
          i: arrayIndex
        } : toString(value));
      } else if (isArray(value)) {
        arr = true;
        // Search each item in the array.
        for (let i = 0, len = value.length; i < len; i += 1) {
          deepGet(value[i], path, index + 1, i);
        }
      } else if (path.length) {
        // An object. Recurse further.
        deepGet(value, path, index + 1, arrayIndex);
      }
    }
  };

  // Backwards compatibility (since path used to be a string)
  deepGet(obj, isString(path) ? path.split('.') : path, 0);
  return arr ? list : list[0];
}

const MatchOptions = {
  includeMatches: false,
  findAllMatches: false,
  minMatchCharLength: 1
};
const BasicOptions = {
  isCaseSensitive: false,
  ignoreDiacritics: false,
  includeScore: false,
  keys: [],
  shouldSort: true,
  sortFn: (a, b) => a.score === b.score ? a.idx < b.idx ? -1 : 1 : a.score < b.score ? -1 : 1
};
const FuzzyOptions = {
  location: 0,
  threshold: 0.6,
  distance: 100
};
const AdvancedOptions = {
  useExtendedSearch: false,
  useTokenSearch: false,
  getFn: get,
  ignoreLocation: false,
  ignoreFieldNorm: false,
  fieldNormWeight: 1
};
const Config = Object.freeze({
  ...BasicOptions,
  ...MatchOptions,
  ...FuzzyOptions,
  ...AdvancedOptions
});

const SPACE = /[^ ]+/g;

// Field-length norm: the shorter the field, the higher the weight.
// Set to 3 decimals to reduce index size.
function norm(weight = 1, mantissa = 3) {
  const cache = new Map();
  const m = Math.pow(10, mantissa);
  return {
    get(value) {
      const numTokens = value.match(SPACE).length;
      if (cache.has(numTokens)) {
        return cache.get(numTokens);
      }

      // Default function is 1/sqrt(x), weight makes that variable
      const norm = 1 / Math.pow(numTokens, 0.5 * weight);

      // In place of `toFixed(mantissa)`, for faster computation
      const n = parseFloat(Math.round(norm * m) / m);
      cache.set(numTokens, n);
      return n;
    },
    clear() {
      cache.clear();
    }
  };
}

class FuseIndex {
  constructor({
    getFn = Config.getFn,
    fieldNormWeight = Config.fieldNormWeight
  } = {}) {
    this.norm = norm(fieldNormWeight, 3);
    this.getFn = getFn;
    this.isCreated = false;
    this.docs = [];
    this.keys = [];
    this._keysMap = {};
    this.setIndexRecords();
  }
  setSources(docs = []) {
    this.docs = docs;
  }
  setIndexRecords(records = []) {
    this.records = records;
  }
  setKeys(keys = []) {
    this.keys = keys;
    this._keysMap = {};
    keys.forEach((key, idx) => {
      this._keysMap[key.id] = idx;
    });
  }
  create() {
    if (this.isCreated || !this.docs.length) {
      return;
    }
    this.isCreated = true;

    // List is Array<String>
    if (isString(this.docs[0])) {
      this.docs.forEach((doc, docIndex) => {
        this._addString(doc, docIndex);
      });
    } else {
      // List is Array<Object>
      this.docs.forEach((doc, docIndex) => {
        this._addObject(doc, docIndex);
      });
    }
    this.norm.clear();
  }
  // Adds a doc to the end of the index
  add(doc) {
    const idx = this.size();
    if (isString(doc)) {
      this._addString(doc, idx);
    } else {
      this._addObject(doc, idx);
    }
  }
  // Removes the doc at the specified index of the index
  removeAt(idx) {
    this.records.splice(idx, 1);

    // Change ref index of every subsquent doc
    for (let i = idx, len = this.size(); i < len; i += 1) {
      this.records[i].i -= 1;
    }
  }
  // Removes docs at the specified indices (must be sorted ascending)
  removeAll(indices) {
    // Remove in reverse order to avoid index shifting during splice
    for (let i = indices.length - 1; i >= 0; i -= 1) {
      this.records.splice(indices[i], 1);
    }
    // Single re-index pass
    for (let i = 0, len = this.records.length; i < len; i += 1) {
      this.records[i].i = i;
    }
  }
  getValueForItemAtKeyId(item, keyId) {
    return item[this._keysMap[keyId]];
  }
  size() {
    return this.records.length;
  }
  _addString(doc, docIndex) {
    if (!isDefined(doc) || isBlank(doc)) {
      return;
    }
    const record = {
      v: doc,
      i: docIndex,
      n: this.norm.get(doc)
    };
    this.records.push(record);
  }
  _addObject(doc, docIndex) {
    const record = {
      i: docIndex,
      $: {}
    };

    // Iterate over every key (i.e, path), and fetch the value at that key
    this.keys.forEach((key, keyIndex) => {
      const value = key.getFn ? key.getFn(doc) : this.getFn(doc, key.path);
      if (!isDefined(value)) {
        return;
      }
      if (isArray(value)) {
        const subRecords = [];
        for (let i = 0, len = value.length; i < len; i += 1) {
          const item = value[i];
          if (!isDefined(item)) {
            continue;
          }
          if (isString(item)) {
            // Custom getFn returning plain string array (backward compat)
            if (!isBlank(item)) {
              const subRecord = {
                v: item,
                i: i,
                n: this.norm.get(item)
              };
              subRecords.push(subRecord);
            }
          } else if (isDefined(item.v)) {
            // Default get() returns {v, i} objects with original array indices
            const text = isString(item.v) ? item.v : toString(item.v);
            if (!isBlank(text)) {
              const subRecord = {
                v: text,
                i: item.i,
                n: this.norm.get(text)
              };
              subRecords.push(subRecord);
            }
          }
        }
        record.$[keyIndex] = subRecords;
      } else if (isString(value) && !isBlank(value)) {
        const subRecord = {
          v: value,
          n: this.norm.get(value)
        };
        record.$[keyIndex] = subRecord;
      }
    });
    this.records.push(record);
  }
  toJSON() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      keys: this.keys.map(({
        getFn,
        ...key
      }) => key),
      records: this.records
    };
  }
}
function createIndex(keys, docs, {
  getFn = Config.getFn,
  fieldNormWeight = Config.fieldNormWeight
} = {}) {
  const myIndex = new FuseIndex({
    getFn,
    fieldNormWeight
  });
  myIndex.setKeys(keys.map(createKey));
  myIndex.setSources(docs);
  myIndex.create();
  return myIndex;
}
function parseIndex(data, {
  getFn = Config.getFn,
  fieldNormWeight = Config.fieldNormWeight
} = {}) {
  const {
    keys,
    records
  } = data;
  const myIndex = new FuseIndex({
    getFn,
    fieldNormWeight
  });
  myIndex.setKeys(keys);
  myIndex.setIndexRecords(records);
  return myIndex;
}

function convertMaskToIndices(matchmask = [], minMatchCharLength = Config.minMatchCharLength) {
  const indices = [];
  let start = -1;
  let end = -1;
  let i = 0;
  for (let len = matchmask.length; i < len; i += 1) {
    const match = matchmask[i];
    if (match && start === -1) {
      start = i;
    } else if (!match && start !== -1) {
      end = i - 1;
      if (end - start + 1 >= minMatchCharLength) {
        indices.push([start, end]);
      }
      start = -1;
    }
  }

  // (i-1 - start) + 1 => i - start
  if (matchmask[i - 1] && i - start >= minMatchCharLength) {
    indices.push([start, i - 1]);
  }
  return indices;
}

// Machine word size
const MAX_BITS = 32;

function search(text, pattern, patternAlphabet, {
  location = Config.location,
  distance = Config.distance,
  threshold = Config.threshold,
  findAllMatches = Config.findAllMatches,
  minMatchCharLength = Config.minMatchCharLength,
  includeMatches = Config.includeMatches,
  ignoreLocation = Config.ignoreLocation
} = {}) {
  if (pattern.length > MAX_BITS) {
    throw new Error(PATTERN_LENGTH_TOO_LARGE(MAX_BITS));
  }
  const patternLen = pattern.length;
  // Set starting location at beginning text and initialize the alphabet.
  const textLen = text.length;
  // Handle the case when location > text.length
  const expectedLocation = Math.max(0, Math.min(location, textLen));
  // Highest score beyond which we give up.
  let currentThreshold = threshold;
  // Is there a nearby exact match? (speedup)
  let bestLocation = expectedLocation;

  // Inlined score computation — avoids object allocation per call in hot loops.
  // See ./computeScore.ts for the documented version of this formula.
  const calcScore = (errors, currentLocation) => {
    const accuracy = errors / patternLen;
    if (ignoreLocation) return accuracy;
    const proximity = Math.abs(expectedLocation - currentLocation);
    if (!distance) return proximity ? 1.0 : accuracy;
    return accuracy + proximity / distance;
  };

  // Performance: only computer matches when the minMatchCharLength > 1
  // OR if `includeMatches` is true.
  const computeMatches = minMatchCharLength > 1 || includeMatches;
  // A mask of the matches, used for building the indices
  const matchMask = computeMatches ? Array(textLen) : [];
  let index;

  // Get all exact matches, here for speed up
  while ((index = text.indexOf(pattern, bestLocation)) > -1) {
    const score = calcScore(0, index);
    currentThreshold = Math.min(score, currentThreshold);
    bestLocation = index + patternLen;
    if (computeMatches) {
      let i = 0;
      while (i < patternLen) {
        matchMask[index + i] = 1;
        i += 1;
      }
    }
  }

  // Reset the best location
  bestLocation = -1;
  let lastBitArr = [];
  let finalScore = 1;
  let binMax = patternLen + textLen;
  const mask = 1 << patternLen - 1;
  for (let i = 0; i < patternLen; i += 1) {
    // Scan for the best match; each iteration allows for one more error.
    // Run a binary search to determine how far from the match location we can stray
    // at this error level.
    let binMin = 0;
    let binMid = binMax;
    while (binMin < binMid) {
      const score = calcScore(i, expectedLocation + binMid);
      if (score <= currentThreshold) {
        binMin = binMid;
      } else {
        binMax = binMid;
      }
      binMid = Math.floor((binMax - binMin) / 2 + binMin);
    }

    // Use the result from this iteration as the maximum for the next.
    binMax = binMid;
    let start = Math.max(1, expectedLocation - binMid + 1);
    const finish = findAllMatches ? textLen : Math.min(expectedLocation + binMid, textLen) + patternLen;

    // Initialize the bit array
    const bitArr = Array(finish + 2);
    bitArr[finish + 1] = (1 << i) - 1;
    for (let j = finish; j >= start; j -= 1) {
      const currentLocation = j - 1;
      const charMatch = patternAlphabet[text[currentLocation]];
      if (computeMatches) {
        // Speed up: quick bool to int conversion (i.e, `charMatch ? 1 : 0`)
        matchMask[currentLocation] = +!!charMatch;
      }

      // First pass: exact match
      bitArr[j] = (bitArr[j + 1] << 1 | 1) & charMatch;

      // Subsequent passes: fuzzy match
      if (i) {
        bitArr[j] |= (lastBitArr[j + 1] | lastBitArr[j]) << 1 | 1 | lastBitArr[j + 1];
      }
      if (bitArr[j] & mask) {
        finalScore = calcScore(i, currentLocation);

        // This match will almost certainly be better than any existing match.
        // But check anyway.
        if (finalScore <= currentThreshold) {
          // Indeed it is
          currentThreshold = finalScore;
          bestLocation = currentLocation;

          // Already passed `loc`, downhill from here on in.
          if (bestLocation <= expectedLocation) {
            break;
          }

          // When passing `bestLocation`, don't exceed our current distance from `expectedLocation`.
          start = Math.max(1, 2 * expectedLocation - bestLocation);
        }
      }
    }

    // No hope for a (better) match at greater error levels.
    const score = calcScore(i + 1, expectedLocation);
    if (score > currentThreshold) {
      break;
    }
    lastBitArr = bitArr;
  }
  const result = {
    isMatch: bestLocation >= 0,
    // Count exact matches (those with a score of 0) to be "almost" exact
    score: Math.max(0.001, finalScore)
  };
  if (computeMatches) {
    const indices = convertMaskToIndices(matchMask, minMatchCharLength);
    if (!indices.length) {
      result.isMatch = false;
    } else if (includeMatches) {
      result.indices = indices;
    }
  }
  return result;
}

function createPatternAlphabet(pattern) {
  const mask = {};
  for (let i = 0, len = pattern.length; i < len; i += 1) {
    const char = pattern.charAt(i);
    mask[char] = (mask[char] || 0) | 1 << len - i - 1;
  }
  return mask;
}

function mergeIndices(indices) {
  if (indices.length <= 1) return indices;
  indices.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged = [indices[0]];
  for (let i = 1, len = indices.length; i < len; i += 1) {
    const last = merged[merged.length - 1];
    const curr = indices[i];
    if (curr[0] <= last[1] + 1) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }
  return merged;
}

// Characters that survive NFD normalization unchanged and need explicit mapping
const NON_DECOMPOSABLE_MAP = {
  '\u0142': 'l',
  // ł
  '\u0141': 'L',
  // Ł
  '\u0111': 'd',
  // đ
  '\u0110': 'D',
  // Đ
  '\u00F8': 'o',
  // ø
  '\u00D8': 'O',
  // Ø
  '\u0127': 'h',
  // ħ
  '\u0126': 'H',
  // Ħ
  '\u0167': 't',
  // ŧ
  '\u0166': 'T',
  // Ŧ
  '\u0131': 'i',
  // ı
  '\u00DF': 'ss' // ß
};
const NON_DECOMPOSABLE_RE = new RegExp('[' + Object.keys(NON_DECOMPOSABLE_MAP).join('') + ']', 'g');
const stripDiacritics = String.prototype.normalize ? str => str.normalize('NFD').replace(/[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/g, '').replace(NON_DECOMPOSABLE_RE, ch => NON_DECOMPOSABLE_MAP[ch]) : str => str;

class BitapSearch {
  constructor(pattern, {
    location = Config.location,
    threshold = Config.threshold,
    distance = Config.distance,
    includeMatches = Config.includeMatches,
    findAllMatches = Config.findAllMatches,
    minMatchCharLength = Config.minMatchCharLength,
    isCaseSensitive = Config.isCaseSensitive,
    ignoreDiacritics = Config.ignoreDiacritics,
    ignoreLocation = Config.ignoreLocation
  } = {}) {
    this.options = {
      location,
      threshold,
      distance,
      includeMatches,
      findAllMatches,
      minMatchCharLength,
      isCaseSensitive,
      ignoreDiacritics,
      ignoreLocation
    };
    pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
    pattern = ignoreDiacritics ? stripDiacritics(pattern) : pattern;
    this.pattern = pattern;
    this.chunks = [];
    if (!this.pattern.length) {
      return;
    }
    const addChunk = (pattern, startIndex) => {
      this.chunks.push({
        pattern,
        alphabet: createPatternAlphabet(pattern),
        startIndex
      });
    };
    const len = this.pattern.length;
    if (len > MAX_BITS) {
      let i = 0;
      const remainder = len % MAX_BITS;
      const end = len - remainder;
      while (i < end) {
        addChunk(this.pattern.substr(i, MAX_BITS), i);
        i += MAX_BITS;
      }
      if (remainder) {
        const startIndex = len - MAX_BITS;
        addChunk(this.pattern.substr(startIndex), startIndex);
      }
    } else {
      addChunk(this.pattern, 0);
    }
  }
  searchIn(text) {
    const {
      isCaseSensitive,
      ignoreDiacritics,
      includeMatches
    } = this.options;
    text = isCaseSensitive ? text : text.toLowerCase();
    text = ignoreDiacritics ? stripDiacritics(text) : text;

    // Exact match
    if (this.pattern === text) {
      const result = {
        isMatch: true,
        score: 0
      };
      if (includeMatches) {
        result.indices = [[0, text.length - 1]];
      }
      return result;
    }

    // Otherwise, use Bitap algorithm
    const {
      location,
      distance,
      threshold,
      findAllMatches,
      minMatchCharLength,
      ignoreLocation
    } = this.options;
    const allIndices = [];
    let totalScore = 0;
    let hasMatches = false;
    this.chunks.forEach(({
      pattern,
      alphabet,
      startIndex
    }) => {
      const {
        isMatch,
        score,
        indices
      } = search(text, pattern, alphabet, {
        location: location + startIndex,
        distance,
        threshold,
        findAllMatches,
        minMatchCharLength,
        includeMatches,
        ignoreLocation
      });
      if (isMatch) {
        hasMatches = true;
      }
      totalScore += score;
      if (isMatch && indices) {
        allIndices.push(...indices);
      }
    });
    const result = {
      isMatch: hasMatches,
      score: hasMatches ? totalScore / this.chunks.length : 1
    };
    if (hasMatches && includeMatches) {
      result.indices = mergeIndices(allIndices);
    }
    return result;
  }
}

class BaseMatch {
  constructor(pattern) {
    this.pattern = pattern;
  }
  static isMultiMatch(pattern) {
    return getMatch(pattern, this.multiRegex);
  }
  static isSingleMatch(pattern) {
    return getMatch(pattern, this.singleRegex);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  search(_text) {
    return {
      isMatch: false,
      score: 1
    };
  }
}
function getMatch(pattern, exp) {
  const matches = pattern.match(exp);
  return matches ? matches[1] : null;
}

// Token: 'file
// Match type: exact-match
// Description: Items that are `file`

class ExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'exact';
  }
  static get multiRegex() {
    return /^="(.*)"$/;
  }
  static get singleRegex() {
    return /^=(.*)$/;
  }
  search(text) {
    const isMatch = text === this.pattern;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    };
  }
}

// Token: !fire
// Match type: inverse-exact-match
// Description: Items that do not include `fire`

class InverseExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'inverse-exact';
  }
  static get multiRegex() {
    return /^!"(.*)"$/;
  }
  static get singleRegex() {
    return /^!(.*)$/;
  }
  search(text) {
    const index = text.indexOf(this.pattern);
    const isMatch = index === -1;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
}

// Token: ^file
// Match type: prefix-exact-match
// Description: Items that start with `file`
class PrefixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'prefix-exact';
  }
  static get multiRegex() {
    return /^\^"(.*)"$/;
  }
  static get singleRegex() {
    return /^\^(.*)$/;
  }
  search(text) {
    const isMatch = text.startsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    };
  }
}

// Token: !^fire
// Match type: inverse-prefix-exact-match
// Description: Items that do not start with `fire`

class InversePrefixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'inverse-prefix-exact';
  }
  static get multiRegex() {
    return /^!\^"(.*)"$/;
  }
  static get singleRegex() {
    return /^!\^(.*)$/;
  }
  search(text) {
    const isMatch = !text.startsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
}

// Token: .file$
// Match type: suffix-exact-match
// Description: Items that end with `.file`
class SuffixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'suffix-exact';
  }
  static get multiRegex() {
    return /^"(.*)"\$$/;
  }
  static get singleRegex() {
    return /^(.*)\$$/;
  }
  search(text) {
    const isMatch = text.endsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [text.length - this.pattern.length, text.length - 1]
    };
  }
}

// Token: !.file$
// Match type: inverse-suffix-exact-match
// Description: Items that do not end with `.file`
class InverseSuffixExactMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'inverse-suffix-exact';
  }
  static get multiRegex() {
    return /^!"(.*)"\$$/;
  }
  static get singleRegex() {
    return /^!(.*)\$$/;
  }
  search(text) {
    const isMatch = !text.endsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
}

class FuzzyMatch extends BaseMatch {
  constructor(pattern, {
    location = Config.location,
    threshold = Config.threshold,
    distance = Config.distance,
    includeMatches = Config.includeMatches,
    findAllMatches = Config.findAllMatches,
    minMatchCharLength = Config.minMatchCharLength,
    isCaseSensitive = Config.isCaseSensitive,
    ignoreDiacritics = Config.ignoreDiacritics,
    ignoreLocation = Config.ignoreLocation
  } = {}) {
    super(pattern);
    this._bitapSearch = new BitapSearch(pattern, {
      location,
      threshold,
      distance,
      includeMatches,
      findAllMatches,
      minMatchCharLength,
      isCaseSensitive,
      ignoreDiacritics,
      ignoreLocation
    });
  }
  static get type() {
    return 'fuzzy';
  }
  static get multiRegex() {
    return /^"(.*)"$/;
  }
  static get singleRegex() {
    return /^(.*)$/;
  }
  search(text) {
    return this._bitapSearch.searchIn(text);
  }
}

// Token: 'file
// Match type: include-match
// Description: Items that include `file`

class IncludeMatch extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return 'include';
  }
  static get multiRegex() {
    return /^'"(.*)"$/;
  }
  static get singleRegex() {
    return /^'(.*)$/;
  }
  search(text) {
    let location = 0;
    let index;
    const indices = [];
    const patternLen = this.pattern.length;

    // Get all exact matches
    while ((index = text.indexOf(this.pattern, location)) > -1) {
      location = index + patternLen;
      indices.push([index, location - 1]);
    }
    const isMatch = !!indices.length;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices
    };
  }
}

// ❗Order is important. DO NOT CHANGE.
const searchers = [ExactMatch, IncludeMatch, PrefixExactMatch, InversePrefixExactMatch, InverseSuffixExactMatch, SuffixExactMatch, InverseExactMatch, FuzzyMatch];
const searchersLen = searchers.length;
const ESCAPED_PIPE = '\u0000'; // placeholder for escaped \|
const OR_TOKEN = '|';

// Tokenize a query string into individual search terms.
// Respects multi-match quoted tokens like ="said "test"" or ^"hello world"$
// where inner spaces and quotes are part of the token.
function tokenize(pattern) {
  const tokens = [];
  const len = pattern.length;
  let i = 0;
  while (i < len) {
    // Skip spaces
    while (i < len && pattern[i] === ' ') i++;
    if (i >= len) break;

    // Scan past prefix characters (=, !, ^, ') to see if a quote follows
    let j = i;
    while (j < len && pattern[j] !== ' ' && pattern[j] !== '"') j++;
    if (j < len && pattern[j] === '"') {
      // Multi-match token: prefix + "content" (possibly with inner quotes)
      // Find the closing " that ends this token:
      // it must be followed by optional $, then space or end-of-string
      j++; // skip opening quote
      while (j < len) {
        if (pattern[j] === '"') {
          // Check if this is the closing quote
          const next = j + 1;
          if (next >= len || pattern[next] === ' ') {
            j++; // include closing quote
            break;
          }
          if (pattern[next] === '$' && (next + 1 >= len || pattern[next + 1] === ' ')) {
            j += 2; // include "$
            break;
          }
        }
        j++;
      }
      tokens.push(pattern.substring(i, j));
      i = j;
    } else {
      // Regular (unquoted) token: read until space or end
      while (j < len && pattern[j] !== ' ') j++;
      tokens.push(pattern.substring(i, j));
      i = j;
    }
  }
  return tokens;
}

// Return a 2D array representation of the query, for simpler parsing.
// Example:
// "^core go$ | rb$ | py$ xy$" => [["^core", "go$"], ["rb$"], ["py$", "xy$"]]
function parseQuery(pattern, options = {}) {
  // Replace escaped \| with placeholder before splitting on |
  const escaped = pattern.replace(/\\\|/g, ESCAPED_PIPE);
  return escaped.split(OR_TOKEN).map(item => {
    // Restore escaped pipes in each OR group
    const restored = item.replace(/\u0000/g, '|');
    const query = tokenize(restored.trim()).filter(item => item && !!item.trim());
    const results = [];
    for (let i = 0, len = query.length; i < len; i += 1) {
      const queryItem = query[i];

      // 1. Handle multiple query match (i.e, once that are quoted, like `"hello world"`)
      let found = false;
      let idx = -1;
      while (!found && ++idx < searchersLen) {
        const searcher = searchers[idx];
        const token = searcher.isMultiMatch(queryItem);
        if (token) {
          results.push(new searcher(token, options));
          found = true;
        }
      }
      if (found) {
        continue;
      }

      // 2. Handle single query matches (i.e, once that are *not* quoted)
      idx = -1;
      while (++idx < searchersLen) {
        const searcher = searchers[idx];
        const token = searcher.isSingleMatch(queryItem);
        if (token) {
          results.push(new searcher(token, options));
          break;
        }
      }
    }
    return results;
  });
}

// These extended matchers can return an array of matches, as opposed
// to a singl match
const MultiMatchSet = new Set([FuzzyMatch.type, IncludeMatch.type]);
class ExtendedSearch {
  constructor(pattern, {
    isCaseSensitive = Config.isCaseSensitive,
    ignoreDiacritics = Config.ignoreDiacritics,
    includeMatches = Config.includeMatches,
    minMatchCharLength = Config.minMatchCharLength,
    ignoreLocation = Config.ignoreLocation,
    findAllMatches = Config.findAllMatches,
    location = Config.location,
    threshold = Config.threshold,
    distance = Config.distance
  } = {}) {
    this.query = null;
    this.options = {
      isCaseSensitive,
      ignoreDiacritics,
      includeMatches,
      minMatchCharLength,
      findAllMatches,
      ignoreLocation,
      location,
      threshold,
      distance
    };
    pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
    pattern = ignoreDiacritics ? stripDiacritics(pattern) : pattern;
    this.pattern = pattern;
    this.query = parseQuery(this.pattern, this.options);
  }
  static condition(_, options) {
    return options.useExtendedSearch;
  }

  // Note: searchIn operates on a single text value and sets hasInverse on the
  // result when inverse patterns are involved. _searchObjectList uses this to
  // switch from "ANY key" to "ALL keys" aggregation. See #712.
  searchIn(text) {
    const query = this.query;
    if (!query) {
      return {
        isMatch: false,
        score: 1
      };
    }
    const {
      includeMatches,
      isCaseSensitive,
      ignoreDiacritics
    } = this.options;
    text = isCaseSensitive ? text : text.toLowerCase();
    text = ignoreDiacritics ? stripDiacritics(text) : text;
    let numMatches = 0;
    const allIndices = [];
    let totalScore = 0;
    let hasInverse = false;

    // ORs
    for (let i = 0, qLen = query.length; i < qLen; i += 1) {
      const searchers = query[i];

      // Reset indices
      allIndices.length = 0;
      numMatches = 0;
      hasInverse = false;

      // ANDs
      for (let j = 0, pLen = searchers.length; j < pLen; j += 1) {
        const searcher = searchers[j];
        const {
          isMatch,
          indices,
          score
        } = searcher.search(text);
        if (isMatch) {
          numMatches += 1;
          totalScore += score;
          const type = searcher.constructor.type;
          if (type.startsWith('inverse')) {
            hasInverse = true;
          }
          if (includeMatches) {
            if (MultiMatchSet.has(type)) {
              allIndices.push(...indices);
            } else {
              allIndices.push(indices);
            }
          }
        } else {
          totalScore = 0;
          numMatches = 0;
          allIndices.length = 0;
          hasInverse = false;
          break;
        }
      }

      // OR condition, so if TRUE, return
      if (numMatches) {
        const result = {
          isMatch: true,
          score: totalScore / numMatches
        };
        if (hasInverse) {
          result.hasInverse = true;
        }
        if (includeMatches) {
          result.indices = mergeIndices(allIndices);
        }
        return result;
      }
    }

    // Nothing was matched
    return {
      isMatch: false,
      score: 1
    };
  }
}

const registeredSearchers = [];
function register(...args) {
  registeredSearchers.push(...args);
}
function createSearcher(pattern, options) {
  for (let i = 0, len = registeredSearchers.length; i < len; i += 1) {
    const searcherClass = registeredSearchers[i];
    if (searcherClass.condition(pattern, options)) {
      return new searcherClass(pattern, options);
    }
  }
  return new BitapSearch(pattern, options);
}

const LogicalOperator = {
  AND: '$and',
  OR: '$or'
};
const KeyType = {
  PATH: '$path',
  PATTERN: '$val'
};
const isExpression = query => !!(query[LogicalOperator.AND] || query[LogicalOperator.OR]);
const isPath = query => !!query[KeyType.PATH];
const isLeaf = query => !isArray(query) && isObject(query) && !isExpression(query);
const convertToExplicit = query => ({
  [LogicalOperator.AND]: Object.keys(query).map(key => ({
    [key]: query[key]
  }))
});

// When `auto` is `true`, the parse function will infer and initialize and add
// the appropriate `Searcher` instance
function parse(query, options, {
  auto = true
} = {}) {
  const next = query => {
    // Keyless string entry: search across all keys
    if (isString(query)) {
      const obj = {
        keyId: null,
        pattern: query
      };
      if (auto) {
        obj.searcher = createSearcher(query, options);
      }
      return obj;
    }
    const keys = Object.keys(query);
    const isQueryPath = isPath(query);
    if (!isQueryPath && keys.length > 1 && !isExpression(query)) {
      return next(convertToExplicit(query));
    }
    if (isLeaf(query)) {
      const key = isQueryPath ? query[KeyType.PATH] : keys[0];
      const pattern = isQueryPath ? query[KeyType.PATTERN] : query[key];
      if (!isString(pattern)) {
        throw new Error(LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY(key));
      }
      const obj = {
        keyId: createKeyId(key),
        pattern
      };
      if (auto) {
        obj.searcher = createSearcher(pattern, options);
      }
      return obj;
    }
    const node = {
      children: [],
      operator: keys[0]
    };
    keys.forEach(key => {
      const value = query[key];
      if (isArray(value)) {
        value.forEach(item => {
          node.children.push(next(item));
        });
      }
    });
    return node;
  };
  if (!isExpression(query)) {
    query = convertToExplicit(query);
  }
  return next(query);
}

function computeScoreSingle(matches, {
  ignoreFieldNorm = Config.ignoreFieldNorm
}) {
  let totalScore = 1;
  matches.forEach(({
    key,
    norm,
    score
  }) => {
    const weight = key ? key.weight : null;
    totalScore *= Math.pow(score === 0 && weight ? Number.EPSILON : score, (weight || 1) * (ignoreFieldNorm ? 1 : norm));
  });
  return totalScore;
}
function computeScore(results, {
  ignoreFieldNorm = Config.ignoreFieldNorm
}) {
  results.forEach(result => {
    result.score = computeScoreSingle(result.matches, {
      ignoreFieldNorm
    });
  });
}

// Max-heap by score: keeps the worst (highest) score at the top
// so we can efficiently evict it when a better result arrives.
class MaxHeap {
  constructor(limit) {
    this.limit = limit;
    this.heap = [];
  }
  get size() {
    return this.heap.length;
  }
  shouldInsert(score) {
    return this.size < this.limit || score < this.heap[0].score;
  }
  insert(item) {
    if (this.size < this.limit) {
      this.heap.push(item);
      this._bubbleUp(this.size - 1);
    } else if (item.score < this.heap[0].score) {
      this.heap[0] = item;
      this._sinkDown(0);
    }
  }
  extractSorted(sortFn) {
    return this.heap.sort(sortFn);
  }
  _bubbleUp(i) {
    const heap = this.heap;
    while (i > 0) {
      const parent = i - 1 >> 1;
      if (heap[i].score <= heap[parent].score) break;
      const tmp = heap[i];
      heap[i] = heap[parent];
      heap[parent] = tmp;
      i = parent;
    }
  }
  _sinkDown(i) {
    const heap = this.heap;
    const len = heap.length;
    let largest = i;
    do {
      i = largest;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < len && heap[left].score > heap[largest].score) {
        largest = left;
      }
      if (right < len && heap[right].score > heap[largest].score) {
        largest = right;
      }
      if (largest !== i) {
        const tmp = heap[i];
        heap[i] = heap[largest];
        heap[largest] = tmp;
      }
    } while (largest !== i);
  }
}

function transformMatches(result, data) {
  const matches = result.matches;
  data.matches = [];
  if (!isDefined(matches)) {
    return;
  }
  matches.forEach(match => {
    if (!isDefined(match.indices) || !match.indices.length) {
      return;
    }
    const {
      indices,
      value
    } = match;
    const obj = {
      indices,
      value
    };
    if (match.key) {
      obj.key = match.key.src;
    }
    if (match.idx > -1) {
      obj.refIndex = match.idx;
    }
    data.matches.push(obj);
  });
}

function transformScore(result, data) {
  data.score = result.score;
}

function format(results, docs, {
  includeMatches = Config.includeMatches,
  includeScore = Config.includeScore
} = {}) {
  const transformers = [];
  if (includeMatches) transformers.push(transformMatches);
  if (includeScore) transformers.push(transformScore);
  return results.map(result => {
    const {
      idx
    } = result;
    const data = {
      item: docs[idx],
      refIndex: idx
    };
    if (transformers.length) {
      transformers.forEach(transformer => {
        transformer(result, data);
      });
    }
    return data;
  });
}

const WORD = /\b\w+\b/g;
function createAnalyzer({
  isCaseSensitive = false,
  ignoreDiacritics = false
} = {}) {
  return {
    tokenize(text) {
      if (!isCaseSensitive) {
        text = text.toLowerCase();
      }
      if (ignoreDiacritics) {
        text = stripDiacritics(text);
      }
      return text.match(WORD) || [];
    }
  };
}

function buildInvertedIndex(records, keyCount, analyzer) {
  const terms = new Map();
  const df = new Map();
  let fieldCount = 0;
  function addField(text, docIdx, keyIdx, subIdx) {
    const tokens = analyzer.tokenize(text);
    if (!tokens.length) return;
    fieldCount++;

    // Count term frequencies in this field
    const termFreqs = new Map();
    for (const token of tokens) {
      termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
    }

    // Track which terms we've already counted for df in this field
    for (const [term, tf] of termFreqs) {
      const posting = {
        docIdx,
        keyIdx,
        subIdx,
        tf
      };
      let postings = terms.get(term);
      if (!postings) {
        postings = [];
        terms.set(term, postings);
      }
      postings.push(posting);
      df.set(term, (df.get(term) || 0) + 1);
    }
  }
  for (const record of records) {
    const {
      i: docIdx,
      v,
      $: fields
    } = record;

    // String list
    if (v !== undefined) {
      addField(v, docIdx, -1, -1);
      continue;
    }

    // Object list
    if (fields) {
      for (let keyIdx = 0; keyIdx < keyCount; keyIdx++) {
        const value = fields[keyIdx];
        if (!value) continue;
        if (Array.isArray(value)) {
          for (const sub of value) {
            addField(sub.v, docIdx, keyIdx, sub.i ?? -1);
          }
        } else {
          addField(value.v, docIdx, keyIdx, -1);
        }
      }
    }
  }
  return {
    terms,
    fieldCount,
    df
  };
}
function addToInvertedIndex(index, record, keyCount, analyzer) {
  const {
    i: docIdx,
    v,
    $: fields
  } = record;
  function addField(text, keyIdx, subIdx) {
    const tokens = analyzer.tokenize(text);
    if (!tokens.length) return;
    index.fieldCount++;
    const termFreqs = new Map();
    for (const token of tokens) {
      termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
    }
    for (const [term, tf] of termFreqs) {
      const posting = {
        docIdx,
        keyIdx,
        subIdx,
        tf
      };
      let postings = index.terms.get(term);
      if (!postings) {
        postings = [];
        index.terms.set(term, postings);
      }
      postings.push(posting);
      index.df.set(term, (index.df.get(term) || 0) + 1);
    }
  }
  if (v !== undefined) {
    addField(v, -1, -1);
    return;
  }
  if (fields) {
    for (let keyIdx = 0; keyIdx < keyCount; keyIdx++) {
      const value = fields[keyIdx];
      if (!value) continue;
      if (Array.isArray(value)) {
        for (const sub of value) {
          addField(sub.v, keyIdx, sub.i ?? -1);
        }
      } else {
        addField(value.v, keyIdx, -1);
      }
    }
  }
}
function removeFromInvertedIndex(index, docIdx) {
  for (const [term, postings] of index.terms) {
    const filtered = postings.filter(p => p.docIdx !== docIdx);
    const removed = postings.length - filtered.length;
    if (removed > 0) {
      index.fieldCount -= removed;
      index.df.set(term, (index.df.get(term) || 0) - removed);
      if (filtered.length === 0) {
        index.terms.delete(term);
        index.df.delete(term);
      } else {
        index.terms.set(term, filtered);
      }
    }
  }
}

class Fuse {
  // Statics are assigned in entry.ts

  constructor(docs, options, index) {
    this.options = {
      ...Config,
      ...options
    };
    if (this.options.useExtendedSearch && false) ;
    if (this.options.useTokenSearch && false) ;
    this._keyStore = new KeyStore(this.options.keys);
    this._docs = docs;
    this._myIndex = null;
    this._invertedIndex = null;
    this.setCollection(docs, index);
    this._lastQuery = null;
    this._lastSearcher = null;
  }
  _getSearcher(query) {
    if (this._lastQuery === query) {
      return this._lastSearcher;
    }
    const opts = this._invertedIndex ? {
      ...this.options,
      _invertedIndex: this._invertedIndex
    } : this.options;
    const searcher = createSearcher(query, opts);
    this._lastQuery = query;
    this._lastSearcher = searcher;
    return searcher;
  }
  setCollection(docs, index) {
    this._docs = docs;
    if (index && !(index instanceof FuseIndex)) {
      throw new Error(INCORRECT_INDEX_TYPE);
    }
    this._myIndex = index || createIndex(this.options.keys, this._docs, {
      getFn: this.options.getFn,
      fieldNormWeight: this.options.fieldNormWeight
    });
    if (this.options.useTokenSearch) {
      const analyzer = createAnalyzer({
        isCaseSensitive: this.options.isCaseSensitive,
        ignoreDiacritics: this.options.ignoreDiacritics
      });
      this._invertedIndex = buildInvertedIndex(this._myIndex.records, this._myIndex.keys.length, analyzer);
    }
  }
  add(doc) {
    if (!isDefined(doc)) {
      return;
    }
    this._docs.push(doc);
    this._myIndex.add(doc);
    if (this._invertedIndex) {
      const record = this._myIndex.records[this._myIndex.records.length - 1];
      const analyzer = createAnalyzer({
        isCaseSensitive: this.options.isCaseSensitive,
        ignoreDiacritics: this.options.ignoreDiacritics
      });
      addToInvertedIndex(this._invertedIndex, record, this._myIndex.keys.length, analyzer);
    }
  }
  remove(predicate = () => false) {
    const results = [];
    const indicesToRemove = [];
    for (let i = 0, len = this._docs.length; i < len; i += 1) {
      if (predicate(this._docs[i], i)) {
        results.push(this._docs[i]);
        indicesToRemove.push(i);
      }
    }
    if (indicesToRemove.length) {
      if (this._invertedIndex) {
        for (const idx of indicesToRemove) {
          removeFromInvertedIndex(this._invertedIndex, idx);
        }
      }

      // Remove from docs in reverse to preserve indices
      for (let i = indicesToRemove.length - 1; i >= 0; i -= 1) {
        this._docs.splice(indicesToRemove[i], 1);
      }
      this._myIndex.removeAll(indicesToRemove);
    }
    return results;
  }
  removeAt(idx) {
    if (this._invertedIndex) {
      removeFromInvertedIndex(this._invertedIndex, idx);
    }
    const doc = this._docs.splice(idx, 1)[0];
    this._myIndex.removeAt(idx);
    return doc;
  }
  getIndex() {
    return this._myIndex;
  }
  search(query, options) {
    const {
      limit = -1
    } = options || {};
    const {
      includeMatches,
      includeScore,
      shouldSort,
      sortFn,
      ignoreFieldNorm
    } = this.options;

    // Empty string query returns all docs (useful for search UIs)
    if (isString(query) && !query.trim()) {
      let docs = this._docs.map((item, idx) => ({
        item,
        refIndex: idx
      }));
      if (isNumber(limit) && limit > -1) {
        docs = docs.slice(0, limit);
      }
      return docs;
    }
    const useHeap = isNumber(limit) && limit > 0 && isString(query);
    let results;
    if (useHeap) {
      const heap = new MaxHeap(limit);
      if (isString(this._docs[0])) {
        this._searchStringList(query, {
          heap,
          ignoreFieldNorm
        });
      } else {
        this._searchObjectList(query, {
          heap,
          ignoreFieldNorm
        });
      }
      results = heap.extractSorted(sortFn);
    } else {
      results = isString(query) ? isString(this._docs[0]) ? this._searchStringList(query) : this._searchObjectList(query) : this._searchLogical(query);
      computeScore(results, {
        ignoreFieldNorm
      });
      if (shouldSort) {
        results.sort(sortFn);
      }
      if (isNumber(limit) && limit > -1) {
        results = results.slice(0, limit);
      }
    }
    return format(results, this._docs, {
      includeMatches,
      includeScore
    });
  }
  _searchStringList(query, {
    heap,
    ignoreFieldNorm
  } = {}) {
    const searcher = this._getSearcher(query);
    const {
      records
    } = this._myIndex;
    const results = heap ? null : [];

    // Iterate over every string in the index
    records.forEach(({
      v: text,
      i: idx,
      n: norm
    }) => {
      if (!isDefined(text)) {
        return;
      }
      const {
        isMatch,
        score,
        indices
      } = searcher.searchIn(text);
      if (isMatch) {
        const result = {
          item: text,
          idx,
          matches: [{
            score,
            value: text,
            norm: norm,
            indices
          }]
        };
        if (heap) {
          result.score = computeScoreSingle(result.matches, {
            ignoreFieldNorm
          });
          if (heap.shouldInsert(result.score)) {
            heap.insert(result);
          }
        } else {
          results.push(result);
        }
      }
    });
    return results;
  }
  _searchLogical(query) {
    const expression = parse(query, this.options);
    const evaluate = (node, item, idx) => {
      if (!('children' in node)) {
        const {
          keyId,
          searcher
        } = node;
        let matches;
        if (keyId === null) {
          // Keyless entry: search across all keys
          matches = [];
          this._myIndex.keys.forEach((key, keyIndex) => {
            matches.push(...this._findMatches({
              key,
              value: item[keyIndex],
              searcher: searcher
            }));
          });
        } else {
          matches = this._findMatches({
            key: this._keyStore.get(keyId),
            value: this._myIndex.getValueForItemAtKeyId(item, keyId),
            searcher: searcher
          });
        }
        if (matches && matches.length) {
          return [{
            idx,
            item,
            matches
          }];
        }
        return [];
      }
      const {
        children,
        operator
      } = node;
      const res = [];
      for (let i = 0, len = children.length; i < len; i += 1) {
        const child = children[i];
        const result = evaluate(child, item, idx);
        if (result.length) {
          res.push(...result);
        } else if (operator === LogicalOperator.AND) {
          return [];
        }
      }
      return res;
    };
    const records = this._myIndex.records;
    const resultMap = new Map();
    const results = [];
    records.forEach(({
      $: item,
      i: idx
    }) => {
      if (isDefined(item)) {
        const expResults = evaluate(expression, item, idx);
        if (expResults.length) {
          // Dedupe when adding
          if (!resultMap.has(idx)) {
            resultMap.set(idx, {
              idx,
              item,
              matches: []
            });
            results.push(resultMap.get(idx));
          }
          expResults.forEach(({
            matches
          }) => {
            resultMap.get(idx).matches.push(...matches);
          });
        }
      }
    });
    return results;
  }

  // When a search involves inverse patterns (e.g. !Syrup), the aggregation
  // across keys switches from "ANY key matches" to "ALL keys must match."
  // This is signaled by hasInverse on the SearchResult from ExtendedSearch.
  //
  // For mixed patterns like "^hello !Syrup", a key failure is ambiguous —
  // it could be the positive or inverse term that failed. In that case we
  // conservatively exclude the item, which is strictly better than the old
  // behavior of including it. See: https://github.com/krisk/Fuse/issues/712
  _searchObjectList(query, {
    heap,
    ignoreFieldNorm
  } = {}) {
    const searcher = this._getSearcher(query);
    const {
      keys,
      records
    } = this._myIndex;
    const results = heap ? null : [];

    // List is Array<Object>
    records.forEach(({
      $: item,
      i: idx
    }) => {
      if (!isDefined(item)) {
        return;
      }
      const matches = [];
      let anyKeyFailed = false;
      let hasInverse = false;

      // Iterate over every key (i.e, path), and fetch the value at that key
      keys.forEach((key, keyIndex) => {
        const keyMatches = this._findMatches({
          key,
          value: item[keyIndex],
          searcher
        });
        if (keyMatches.length) {
          matches.push(...keyMatches);
          if (keyMatches[0].hasInverse) {
            hasInverse = true;
          }
        } else {
          anyKeyFailed = true;
        }
      });

      // If the search involves inverse patterns, ALL keys must match
      if (hasInverse && anyKeyFailed) {
        return;
      }
      if (matches.length) {
        const result = {
          idx,
          item,
          matches
        };
        if (heap) {
          result.score = computeScoreSingle(result.matches, {
            ignoreFieldNorm
          });
          if (heap.shouldInsert(result.score)) {
            heap.insert(result);
          }
        } else {
          results.push(result);
        }
      }
    });
    return results;
  }
  _findMatches({
    key,
    value,
    searcher
  }) {
    if (!isDefined(value)) {
      return [];
    }
    const matches = [];
    if (isArray(value)) {
      value.forEach(({
        v: text,
        i: idx,
        n: norm
      }) => {
        if (!isDefined(text)) {
          return;
        }
        const {
          isMatch,
          score,
          indices,
          hasInverse
        } = searcher.searchIn(text);
        if (isMatch) {
          matches.push({
            score,
            key,
            value: text,
            idx,
            norm,
            indices,
            hasInverse
          });
        }
      });
    } else {
      const {
        v: text,
        n: norm
      } = value;
      const {
        isMatch,
        score,
        indices,
        hasInverse
      } = searcher.searchIn(text);
      if (isMatch) {
        matches.push({
          score,
          key,
          value: text,
          norm,
          indices,
          hasInverse
        });
      }
    }
    return matches;
  }
}

class TokenSearch {
  static condition(_, options) {
    return options.useTokenSearch;
  }
  constructor(pattern, options) {
    this.options = options;
    this.analyzer = createAnalyzer({
      isCaseSensitive: options.isCaseSensitive,
      ignoreDiacritics: options.ignoreDiacritics
    });
    const queryTerms = this.analyzer.tokenize(pattern);
    const invertedIndex = options._invertedIndex;
    const {
      df,
      fieldCount
    } = invertedIndex;
    this.termSearchers = [];
    this.idfWeights = [];
    for (const term of queryTerms) {
      this.termSearchers.push(new BitapSearch(term, {
        location: options.location,
        threshold: options.threshold,
        distance: options.distance,
        includeMatches: options.includeMatches,
        findAllMatches: options.findAllMatches,
        minMatchCharLength: options.minMatchCharLength,
        isCaseSensitive: options.isCaseSensitive,
        ignoreDiacritics: options.ignoreDiacritics,
        ignoreLocation: true
      }));
      const docFreq = df.get(term) || 0;
      const idf = Math.log(1 + (fieldCount - docFreq + 0.5) / (docFreq + 0.5));
      this.idfWeights.push(idf);
    }
  }
  searchIn(text) {
    if (!this.termSearchers.length) {
      return {
        isMatch: false,
        score: 1
      };
    }
    const allIndices = [];
    let weightedScore = 0;
    let maxPossibleScore = 0;
    let matchedCount = 0;
    for (let i = 0; i < this.termSearchers.length; i++) {
      const result = this.termSearchers[i].searchIn(text);
      const idf = this.idfWeights[i];
      maxPossibleScore += idf;
      if (result.isMatch) {
        matchedCount++;
        weightedScore += idf * (1 - result.score);
        if (result.indices) {
          allIndices.push(...result.indices);
        }
      }
    }
    if (matchedCount === 0) {
      return {
        isMatch: false,
        score: 1
      };
    }
    const normalized = maxPossibleScore > 0 ? 1 - weightedScore / maxPossibleScore : 0;
    const searchResult = {
      isMatch: true,
      score: Math.max(0.001, normalized)
    };
    if (this.options.includeMatches && allIndices.length) {
      searchResult.indices = mergeIndices(allIndices);
    }
    return searchResult;
  }
}

Fuse.version = '7.3.0';
Fuse.createIndex = createIndex;
Fuse.parseIndex = parseIndex;
Fuse.config = Config;
Fuse.match = function (pattern, text, options) {
  const searcher = createSearcher(pattern, {
    ...Config,
    ...options
  });
  return searcher.searchIn(text);
};
{
  Fuse.parseQuery = parse;
}
{
  register(ExtendedSearch);
}
{
  register(TokenSearch);
}
Fuse.use = function (...plugins) {
  plugins.forEach(plugin => register(plugin));
};

const FUSE_OPTIONS = {
  keys: ['label'],
  threshold: 0.4,
  ignoreLocation: true,
  shouldSort: false
};
function getMatchingItemIds(items, query) {
  const normalizedQuery = query?.trim();
  if (!normalizedQuery) {
    return null;
  }
  const searchableItems = items.filter(item => item.id && item.label);
  if (searchableItems.length === 0) {
    return new Set();
  }
  const fuse = new Fuse(searchableItems, FUSE_OPTIONS);
  return new Set(fuse.search(normalizedQuery).map(result => result.item.id));
}

function DefaultCheckIcon() {
  return /*#__PURE__*/jsxRuntime.jsx("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true",
    children: /*#__PURE__*/jsxRuntime.jsx("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M12.4714 4.86195C12.7317 5.1223 12.7317 5.54441 12.4714 5.80476L7.13805 11.1381C6.8777 11.3984 6.45559 11.3984 6.19524 11.1381L3.52858 8.47142C3.26823 8.21108 3.26823 7.78897 3.52858 7.52862C3.78892 7.26827 4.21103 7.26827 4.47138 7.52862L6.66665 9.72388L11.5286 4.86195C11.7889 4.6016 12.211 4.6016 12.4714 4.86195Z",
      fill: "currentColor"
    })
  });
}

/**
 * DropdownItem
 *
 * A single selectable or checkable item inside a DropdownGroup.
 *
 * Props:
 *  id              string (required)
 *  type            "click" (default) | "checkbox"
 *  defaultChecked  bool (used when uncontrolled, type="checkbox")
 *  checkIcon       ReactNode | FC — replaces default ✓ icon
 *  component       custom component — receives all binding props
 *  children        label text
 */
function DropdownItem({
  id,
  type = 'click',
  defaultChecked = false,
  icon,
  checkIcon,
  actions,
  component: Comp,
  children,
  ...rest
}) {
  const {
    selectedItem,
    checkedItems,
    searchQuery,
    fireEvent,
    t
  } = useDropdownContext();
  const groupCtx = react.useContext(GroupContext);
  const groupLabel = groupCtx?.groupLabel ?? '';
  const groupId = groupCtx?.groupId ?? '';
  const visibleItemIds = groupCtx?.visibleItemIds;
  const label = typeof children === 'string' ? children : '';

  // Search filtering
  if (searchQuery && visibleItemIds && !visibleItemIds.has(id)) {
    return null;
  }

  // Derived state
  const isSelected = type === 'click' && selectedItem?.id === id;
  const isChecked = type === 'checkbox' ? checkedItems.get(id) ?? defaultChecked : false;
  const actionContext = {
    id,
    label,
    type,
    groupId,
    groupLabel,
    isSelected,
    isChecked
  };
  const actionsNode = typeof actions === 'function' ? actions(actionContext) : actions;
  function handleClick() {
    if (type === 'checkbox') {
      fireEvent('check', {
        id,
        label,
        groupId,
        groupLabel
      });
    } else {
      fireEvent('select', {
        id,
        label,
        groupId,
        groupLabel
      });
    }
  }
  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }
  const {
    onClick: userOnClick,
    onKeyDown: userOnKeyDown,
    ...domRest
  } = rest;

  // Binding props for custom component
  const bindingProps = {
    isSelected,
    isActive: false,
    // hover managed by CSS :hover
    isChecked,
    onClick: () => {
      handleClick();
      userOnClick?.();
    },
    onKeyDown: e => {
      handleKeyDown(e);
      userOnKeyDown?.(e);
    },
    id,
    children,
    actions: actionsNode
  };
  if (Comp) {
    return /*#__PURE__*/jsxRuntime.jsx(Comp, {
      ...bindingProps,
      "data-ho-selected": isSelected,
      "data-ho-checked": isChecked,
      ...domRest
    });
  }
  const checkIconNode = checkIcon ? renderIcon(checkIcon) : /*#__PURE__*/jsxRuntime.jsx(DefaultCheckIcon, {});
  const classNames = ['hangoverDropdown-item', isSelected ? 'isSelected' : '', isChecked ? 'isChecked' : '', type === 'checkbox' ? 'isCheckboxType' : ''].filter(Boolean).join(' ');
  return /*#__PURE__*/jsxRuntime.jsxs("div", {
    role: type === 'checkbox' ? 'checkbox' : 'option',
    "aria-selected": type === 'click' ? isSelected : undefined,
    "aria-checked": type === 'checkbox' ? isChecked : undefined,
    tabIndex: 0,
    className: classNames,
    title: label ? t(label) : undefined,
    onClick: () => {
      handleClick();
      userOnClick?.();
    },
    onKeyDown: e => {
      handleKeyDown(e);
      userOnKeyDown?.(e);
    },
    "data-ho-selected": isSelected,
    "data-ho-checked": isChecked,
    ...domRest,
    children: [icon && /*#__PURE__*/jsxRuntime.jsx("span", {
      className: "hangoverDropdown-item-icon",
      children: renderIcon(icon)
    }), /*#__PURE__*/jsxRuntime.jsx("span", {
      className: "hangoverDropdown-item-label",
      children: typeof children === 'string' ? t(children) : children
    }), actionsNode && /*#__PURE__*/jsxRuntime.jsx("span", {
      className: "hangoverDropdown-item-actions",
      onClick: e => e.stopPropagation(),
      onKeyDown: e => e.stopPropagation(),
      children: actionsNode
    }), type === 'checkbox' && /*#__PURE__*/jsxRuntime.jsx("span", {
      className: `hangoverDropdown-item-check-icon${isChecked ? ' isVisible' : ''}`,
      children: isChecked && checkIconNode
    })]
  });
}

const GROUP_PALETTE = ['#16A34A',
// green
'#7C3AED',
// purple
'#0EA5E9',
// sky
'#F59E0B',
// amber
'#EC4899',
// pink
'#EF4444',
// red
'#84CC16',
// lime
'#06B6D4' // cyan
];

// Single chevron — CSS handles rotation
function Chevron() {
  return /*#__PURE__*/jsxRuntime.jsx("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true",
    children: /*#__PURE__*/jsxRuntime.jsx("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M8.47143 6.19526C8.21108 5.93491 7.78897 5.93491 7.52862 6.19526L4.86195 8.86193C4.67129 9.05259 4.61425 9.33934 4.71744 9.58846C4.82063 9.83757 5.06372 10 5.33336 10H10.6667C10.9363 10 11.1794 9.83757 11.2826 9.58846C11.3858 9.33934 11.3288 9.05259 11.1381 8.86193L8.47143 6.19526Z",
      fill: "currentColor"
    })
  });
}

// Module-level counter for color cycling.
// Incremented on each group mount — sufficient for stable color assignment
// within a single panel open session.
let _groupColorIndex = 0;

// Reset counter when all groups unmount (panel closes)
let _mountedGroupCount = 0;
function onGroupMount() {
  if (_mountedGroupCount === 0) {
    _groupColorIndex = 0;
  }
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
  const {
    fireEvent,
    checkedItems,
    firstGroupClaimedRef,
    defaultGroupExpanded,
    displayMode,
    activeNavId,
    registerGroupItems,
    searchQuery,
    t
  } = useDropdownContext();

  // Determine initial expanded state
  const expandedInitRef = react.useRef(null);
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
  const [isExpanded, setIsExpanded] = react.useState(expandedInitRef.current);

  // Register with parent section for expand/collapse all
  const sectionControl = react.useContext(SectionControlContext);
  const groupKeyRef = react.useRef(null);
  if (groupKeyRef.current === null) {
    groupKeyRef.current = Math.random().toString(36).slice(2);
  }
  react.useEffect(() => {
    if (!sectionControl) return;
    const key = groupKeyRef.current;
    sectionControl.registerGroup(key, setIsExpanded, expandedInitRef.current);
    return () => sectionControl.unregisterGroup(key);
  }, [sectionControl]);
  react.useEffect(() => {
    if (!sectionControl) return;
    sectionControl.notifyGroupState(groupKeyRef.current, isExpanded);
  }, [isExpanded, sectionControl]);

  // Tab mode: reset to default when active tab changes
  react.useEffect(() => {
    if (displayMode === 'tab') {
      setIsExpanded(expandedInitRef.current);
    }
  }, [activeNavId, displayMode]);

  // Assign auto color
  const colorIndexRef = react.useRef(null);
  if (colorIndexRef.current === null) {
    colorIndexRef.current = _groupColorIndex++;
  }
  react.useEffect(() => {
    onGroupMount();
    return () => onGroupUnmount();
  }, []);
  const resolvedColor = color || GROUP_PALETTE[colorIndexRef.current % GROUP_PALETTE.length];

  // Collect child item ids for selectAll
  const itemIds = react.Children.toArray(children).filter(c => c?.props?.id).map(c => c.props.id);
  const groupId = id ?? label.replace(/\s+/g, '_').toLowerCase();

  // Register group items in main context (for imperative selectAll)
  react.useEffect(() => {
    return registerGroupItems(groupId, itemIds, label);
  }, [groupId, itemIds, label, registerGroupItems]);
  function handleToggle() {
    const next = !isExpanded;
    setIsExpanded(next);
    fireEvent('groupToggle', {
      groupId,
      groupLabel: label,
      expanded: next
    });
  }
  const selectAllChecked = checkedItems.get(groupId + '__all') ?? false;
  function handleSelectAll() {
    fireEvent('selectAll', {
      groupId,
      groupLabel: label,
      itemIds
    });
  }
  const selectAllItem = /*#__PURE__*/jsxRuntime.jsxs("div", {
    role: "checkbox",
    "aria-checked": selectAllChecked,
    tabIndex: 0,
    title: t('Select all'),
    className: `hangoverDropdown-item isCheckboxType${selectAllChecked ? ' isChecked' : ''}`,
    onClick: handleSelectAll,
    onKeyDown: e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelectAll();
      }
    },
    children: [/*#__PURE__*/jsxRuntime.jsx("span", {
      className: "hangoverDropdown-item-label",
      children: t('Select all')
    }), /*#__PURE__*/jsxRuntime.jsx("span", {
      className: `hangoverDropdown-item-check-icon${selectAllChecked ? ' isVisible' : ''}`,
      children: selectAllChecked && /*#__PURE__*/jsxRuntime.jsx("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        fill: "none",
        "aria-hidden": "true",
        children: /*#__PURE__*/jsxRuntime.jsx("path", {
          fillRule: "evenodd",
          clipRule: "evenodd",
          d: "M12.4714 4.86195C12.7317 5.1223 12.7317 5.54441 12.4714 5.80476L7.13805 11.1381C6.8777 11.3984 6.45559 11.3984 6.19524 11.1381L3.52858 8.47142C3.26823 8.21108 3.26823 7.78897 3.52858 7.52862C3.78892 7.26827 4.21103 7.26827 4.47138 7.52862L6.66665 9.72388L11.5286 4.86195C11.7889 4.6016 12.211 4.6016 12.4714 4.86195Z",
          fill: "currentColor"
        })
      })
    })]
  }, "__selectAll__");
  const visibleItemIds = react.useMemo(() => {
    const searchableItems = react.Children.toArray(children).map(child => ({
      id: child?.props?.id,
      label: typeof child?.props?.children === 'string' ? t(child.props.children) : ''
    }));
    return getMatchingItemIds(searchableItems, searchQuery);
  }, [children, searchQuery, t]);
  const groupContextValue = {
    groupLabel: label,
    groupId,
    resolvedColor,
    visibleItemIds
  };
  const header = /*#__PURE__*/jsxRuntime.jsxs("div", {
    className: `hangoverDropdown-group-header${isExpanded ? ' isExpanded' : ''}`,
    onClick: handleToggle,
    role: "button",
    tabIndex: 0,
    onKeyDown: e => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleToggle();
      }
    },
    "aria-expanded": isExpanded,
    "aria-label": t('{label} — {action}', {
      label,
      action: t(isExpanded ? 'collapse' : 'expand')
    }),
    title: t(label),
    children: [/*#__PURE__*/jsxRuntime.jsx("div", {
      className: "hangoverDropdown-group-header-accent"
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      className: "hangoverDropdown-group-header-body",
      children: /*#__PURE__*/jsxRuntime.jsxs("div", {
        className: "hangoverDropdown-group-header-inner",
        children: [icon && /*#__PURE__*/jsxRuntime.jsx("span", {
          className: "hangoverDropdown-group-header-icon",
          children: renderIcon(icon)
        }), /*#__PURE__*/jsxRuntime.jsx("span", {
          className: "hangoverDropdown-group-header-label",
          children: t(label)
        }), /*#__PURE__*/jsxRuntime.jsx("span", {
          className: "hangoverDropdown-group-header-chevron",
          children: /*#__PURE__*/jsxRuntime.jsx(Chevron, {})
        })]
      })
    })]
  });
  const hasChildren = react.Children.count(children) > 0;
  const hasVisibleItems = !searchQuery || visibleItemIds.size > 0;
  const items = /*#__PURE__*/jsxRuntime.jsx("div", {
    className: `hangoverDropdown-group-items-wrap${isExpanded ? ' isExpanded' : ''}`,
    children: /*#__PURE__*/jsxRuntime.jsxs("div", {
      role: "group",
      "aria-label": t(label),
      className: "hangoverDropdown-group-items",
      children: [showSelectAll && selectAllPosition === 'top' && selectAllItem, hasChildren ? hasVisibleItems ? children : /*#__PURE__*/jsxRuntime.jsx("div", {
        className: "hangoverDropdown-group-empty",
        children: t(noResultsText)
      }) : /*#__PURE__*/jsxRuntime.jsx("div", {
        className: "hangoverDropdown-group-empty",
        children: t(emptyText)
      }), showSelectAll && selectAllPosition === 'bottom' && selectAllItem]
    })
  });
  const groupContent = /*#__PURE__*/jsxRuntime.jsxs(GroupContext.Provider, {
    value: groupContextValue,
    children: [header, items]
  });
  if (Comp) {
    return /*#__PURE__*/jsxRuntime.jsx(Comp, {
      isExpanded: isExpanded,
      onToggle: handleToggle,
      label: label,
      style: {
        '--hangover-group-color': resolvedColor
      },
      className: `hangoverDropdown-group${isExpanded ? ' isExpanded' : ' isCollapsed'}`,
      ...rest,
      children: groupContent
    });
  }
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    className: `hangoverDropdown-group${isExpanded ? ' isExpanded' : ' isCollapsed'}`,
    style: {
      '--hangover-group-color': resolvedColor
    },
    "data-group-label": label,
    ...rest,
    children: groupContent
  });
}

function toGeneratedId(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return normalized || fallback;
}
function normalizeConfig(config) {
  const {
    trigger,
    panel = {},
    navigation,
    items: rootItems,
    content,
    showAll,
    allLabel,
    allIcon,
    collapsed,
    autoCollapse,
    ...rootConfig
  } = config;
  const navigationAliases = {
    ...(showAll !== undefined ? {
      showAll
    } : {}),
    ...(allLabel !== undefined ? {
      allLabel
    } : {}),
    ...(allIcon !== undefined ? {
      allIcon
    } : {}),
    ...(collapsed !== undefined ? {
      collapsed
    } : {}),
    ...(autoCollapse !== undefined ? {
      autoCollapse
    } : {})
  };
  const resolvedNavigation = Array.isArray(rootItems) ? {
    ...(navigation ?? {}),
    ...navigationAliases,
    items: rootItems
  } : navigation ? {
    ...navigation,
    ...navigationAliases
  } : null;
  const rawNavigationItems = resolvedNavigation?.items ?? [];
  const explicitSections = content?.sections ?? [];
  const explicitSectionsByFor = new Map(explicitSections.filter(section => section?.for || section?.forId).map(section => [section.for ?? section.forId, section]));
  const consumedSectionIds = new Set();
  const navigationItems = rawNavigationItems.map((item, index) => {
    const {
      id: rawId,
      label,
      icon,
      title,
      groups,
      items: nestedItems,
      content: nestedContent,
      section,
      ...navItemRest
    } = item;
    const id = rawId ?? toGeneratedId(label, `section-${index + 1}`);
    const nestedSection = section ?? nestedContent ?? (groups || nestedItems ? {
      title,
      items: nestedItems,
      groups
    } : null);
    if (explicitSectionsByFor.has(id)) {
      consumedSectionIds.add(id);
    }
    return {
      id,
      label,
      icon,
      navItemRest,
      derivedSection: explicitSectionsByFor.get(id) ?? (nestedSection ? {
        ...(typeof nestedSection === 'object' ? nestedSection : {}),
        for: id,
        title: nestedSection?.title ?? title ?? label,
        items: nestedSection?.items ?? nestedSection?.groups ?? nestedItems ?? groups ?? []
      } : null)
    };
  });
  const remainingSections = explicitSections.filter(section => {
    const sectionId = section?.for ?? section?.forId;
    return !sectionId || !consumedSectionIds.has(sectionId);
  });
  const sections = [...navigationItems.map(item => item.derivedSection).filter(Boolean), ...remainingSections];
  return {
    rootConfig,
    trigger,
    panel,
    navigation: navigation ? {
      ...resolvedNavigation,
      items: navigationItems
    } : resolvedNavigation ? {
      ...resolvedNavigation,
      items: navigationItems
    } : null,
    content: {
      ...(content ?? {}),
      sections
    }
  };
}
function renderTriggerNode(trigger) {
  let triggerNode;
  if (trigger == null) {
    triggerNode = null;
  } else if (typeof trigger === 'string') {
    triggerNode = /*#__PURE__*/jsxRuntime.jsx(DropdownTrigger, {
      children: /*#__PURE__*/jsxRuntime.jsx("button", {
        type: "button",
        children: trigger
      })
    });
  } else if (typeof trigger === 'function') {
    const TriggerComp = trigger;
    triggerNode = /*#__PURE__*/jsxRuntime.jsx(DropdownTrigger, {
      children: /*#__PURE__*/jsxRuntime.jsx(TriggerComp, {})
    });
  } else if (typeof trigger === 'object' && trigger.label !== undefined && !trigger.$$typeof) {
    const {
      label,
      className,
      component: TriggerComp
    } = trigger;
    triggerNode = /*#__PURE__*/jsxRuntime.jsx(DropdownTrigger, {
      children: TriggerComp ? /*#__PURE__*/jsxRuntime.jsx(TriggerComp, {
        className: className,
        children: label
      }) : /*#__PURE__*/jsxRuntime.jsx("button", {
        type: "button",
        className: className,
        children: label
      })
    });
  } else {
    triggerNode = trigger;
  }
  return triggerNode;
}
function renderNavigationNode(navigation) {
  if (!navigation) {
    return null;
  }
  const {
    items = [],
    showAll,
    allLabel,
    allIcon,
    collapsed,
    autoCollapse,
    ...navRest
  } = navigation;
  return /*#__PURE__*/jsxRuntime.jsx(DropdownNav, {
    showAll: showAll,
    allLabel: allLabel,
    allIcon: allIcon,
    collapsed: collapsed,
    autoCollapse: autoCollapse,
    ...navRest,
    children: items.map(({
      id,
      label,
      icon,
      navItemRest = {}
    }) => /*#__PURE__*/jsxRuntime.jsx(DropdownNavItem, {
      id: id,
      icon: icon,
      ...navItemRest,
      children: label
    }, id))
  });
}
function renderSectionNodes(sections) {
  return sections.map((section, si) => {
    const {
      for: forId,
      forId: forIdProp,
      title,
      groups,
      items: sectionItems,
      ...sectionRest
    } = section;
    const sectionKey = forId ?? forIdProp ?? si;
    const groupConfigs = groups ?? sectionItems ?? [];
    const groupNodes = groupConfigs.map((group, gi) => {
      const {
        id: groupId,
        label: groupLabel,
        defaultExpanded,
        items: groupItems = [],
        ...groupRest
      } = group;
      const itemNodes = groupItems.map(item => {
        const {
          id,
          label,
          type,
          icon,
          defaultChecked,
          checkIcon,
          component,
          ...itemRest
        } = item;
        return /*#__PURE__*/jsxRuntime.jsx(DropdownItem, {
          id: id,
          type: type,
          icon: icon,
          defaultChecked: defaultChecked,
          checkIcon: checkIcon,
          component: component,
          ...itemRest,
          children: label
        }, id);
      });
      return /*#__PURE__*/jsxRuntime.jsx(DropdownGroup, {
        id: groupId,
        label: groupLabel,
        defaultExpanded: defaultExpanded,
        ...groupRest,
        children: itemNodes
      }, groupId ?? gi);
    });
    return /*#__PURE__*/jsxRuntime.jsx(DropdownSection, {
      for: forId ?? forIdProp,
      title: title,
      ...sectionRest,
      children: groupNodes
    }, sectionKey);
  });
}

/**
 * buildFromConfig — builds only the panel children (trigger + panel).
 * Used internally by Dropdown root when `fromConfig` prop is passed.
 * Does NOT wrap with a root <Dropdown> — avoids circular imports.
 */
function buildFromConfig(config) {
  const {
    trigger,
    panel,
    navigation,
    content
  } = normalizeConfig(config);
  const triggerNode = renderTriggerNode(trigger);
  const navNode = renderNavigationNode(navigation);
  const {
    searchPlaceholder,
    sections = [],
    ...contentRest
  } = content || {};
  const {
    placement: panelPlacement,
    offset: panelOffset,
    ...panelRest
  } = panel;
  return /*#__PURE__*/jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [triggerNode, /*#__PURE__*/jsxRuntime.jsxs(DropdownPanel, {
      placement: panelPlacement,
      offset: panelOffset,
      ...panelRest,
      children: [navNode, /*#__PURE__*/jsxRuntime.jsx(DropdownContent, {
        searchPlaceholder: searchPlaceholder,
        ...contentRest,
        children: renderSectionNodes(sections)
      })]
    })]
  });
}

const Dropdown$1 = /*#__PURE__*/react.forwardRef(function Dropdown({
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
  children,
  ...rest
}, ref) {
  const displayMode = fromConfig?.displayMode ?? displayModeProp;
  const defaultOpen = fromConfig?.defaultOpen ?? defaultOpenProp;
  const defaultGroupExpanded = fromConfig?.defaultGroupExpanded ?? defaultGroupExpandedProp;
  const hideOnSelection = fromConfig?.hideOnSelection ?? hideOnSelectionProp;
  const onEvent = fromConfig?.onEvent ?? onEventProp;
  const darkMode = fromConfig?.darkMode ?? darkModeProp;
  const defaultSearchQuery = fromConfig?.defaultSearchQuery ?? defaultSearchQueryProp;
  const controlledSearchQuery = fromConfig?.searchQuery ?? searchQueryProp;
  const translationFn = fromConfig?.useTranslationFunction ?? useTranslationFunctionProp;

  // Translation helper. Every user-facing string is routed through this.
  // - With a translation function: returns translationFn(str, payload).
  // - Without one: returns the string, interpolating any {placeholder}
  //   tokens from the optional payload object.
  const t = react.useCallback((str, payload) => {
    if (typeof str !== 'string') return str;
    if (typeof translationFn === 'function') return translationFn(str, payload);
    if (payload) {
      return str.replace(/\{(\w+)\}/g, (match, key) => key in payload ? payload[key] : match);
    }
    return str;
  }, [translationFn]);
  const [isOpen, setIsOpen] = react.useState(defaultOpen);
  const [selectedItem, setSelectedItem] = react.useState(null);
  const [checkedItems, setCheckedItems] = react.useState(() => new Map());
  const [activeNavId, setActiveNavId] = react.useState('__all__');
  const [activeNavLabel, setActiveNavLabel] = react.useState('');
  const [searchQuery, setSearchQuery] = react.useState(defaultSearchQuery);
  const [hasNav, setHasNav] = react.useState(false);

  // Controlled searchQuery — sync internal state whenever the prop changes
  const isControlledSearch = controlledSearchQuery !== undefined;
  react.useEffect(() => {
    if (isControlledSearch) setSearchQuery(controlledSearchQuery);
  }, [isControlledSearch, controlledSearchQuery]);
  const triggerRef = react.useRef(null);
  const contentRef = react.useRef(null); // scroll container inside DropdownContent
  const firstGroupClaimedRef = react.useRef(false);

  // Sync refs — give stable callbacks access to current state without
  // closing over it. Updated synchronously during render (not in effects),
  // so they're always current by the time any event handler runs.
  const isOpenRef = react.useRef(isOpen);
  const selectedItemRef = react.useRef(selectedItem);
  const checkedItemsRef = react.useRef(checkedItems);
  const activeNavIdRef = react.useRef(activeNavId);
  const searchQueryRef = react.useRef(searchQuery);
  const hideOnSelectionRef = react.useRef(hideOnSelection);
  const onEventRef = react.useRef(onEvent);
  isOpenRef.current = isOpen;
  selectedItemRef.current = selectedItem;
  checkedItemsRef.current = checkedItems;
  activeNavIdRef.current = activeNavId;
  searchQueryRef.current = searchQuery;
  hideOnSelectionRef.current = hideOnSelection;
  onEventRef.current = onEvent;

  // Group registry: Map<groupId, { itemIds, groupLabel }>
  const groupItemsRegistry = react.useRef(new Map());
  const registerGroupItems = react.useCallback((groupId, itemIds, groupLabel) => {
    groupItemsRegistry.current.set(groupId, {
      itemIds,
      groupLabel
    });
    return () => groupItemsRegistry.current.delete(groupId);
  }, []);

  // Reset first-group claim whenever the dropdown opens
  react.useEffect(() => {
    if (isOpen) {
      firstGroupClaimedRef.current = false;
    }
  }, [isOpen]);

  // Nav label registry: Map<id, label>  (populated by DropdownNavItem on mount)
  const navLabels = react.useRef(new Map());
  const registerNavLabel = react.useCallback((id, label) => {
    navLabels.current.set(id, label);
  }, []);

  // Section refs registry: Map<forId, HTMLElement>  (populated by DropdownSection on mount)
  const sectionRefs = react.useRef(new Map());
  const registerSectionRef = react.useCallback((forId, el) => {
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
  const fireEvent = react.useCallback((type, payload) => {
    // Read from sync refs so this callback is stable ([] deps) while always
    // seeing the current state values at call time.
    const selectedItem = selectedItemRef.current;
    const checkedItems = checkedItemsRef.current;
    const activeNavId = activeNavIdRef.current;
    const searchQuery = searchQueryRef.current;
    const hideOnSelection = hideOnSelectionRef.current;
    const onEvent = onEventRef.current;

    // Build prev snapshot
    const prev = (() => {
      switch (type) {
        case 'select':
          return selectedItem ? {
            ...selectedItem
          } : null;
        case 'check':
          return {
            checked: checkedItems.get(payload.id) ?? false
          };
        case 'selectAll':
          return {
            checked: checkedItems.get(payload.groupId + '__all') ?? false
          };
        case 'navChange':
          return {
            id: activeNavId
          };
        case 'search':
          return {
            query: searchQuery
          };
        default:
          return null;
      }
    })();

    // Call user callback
    const result = onEvent ? onEvent({
      type,
      payload,
      prev
    }) : undefined;

    // Apply state changes
    switch (type) {
      case 'open':
        setIsOpen(true);
        break;
      case 'close':
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'select':
        {
          // null return = cancel; undefined = uncontrolled (use payload)
          if (result === null) {
            break;
          }
          const next = result !== undefined ? result : {
            id: payload.id,
            label: payload.label
          };
          setSelectedItem(next);
          if (hideOnSelection) {
            setIsOpen(false);
          }
          break;
        }
      case 'check':
        {
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
      case 'selectAll':
        {
          if (result === null) {
            break;
          }
          const currentAll = checkedItems.get(payload.groupId + '__all') ?? false;
          const nextAll = result !== undefined ? Boolean(result) : payload._checked !== undefined ? payload._checked : !currentAll;
          setCheckedItems(prev => {
            const m = new Map(prev);
            // toggle all items in the group
            payload.itemIds.forEach(id => m.set(id, nextAll));
            m.set(payload.groupId + '__all', nextAll);
            return m;
          });
          break;
        }
      case 'navChange':
        {
          setActiveNavId(payload.id);
          const label = navLabels.current.get(payload.id) ?? '';
          setActiveNavLabel(label);
          break;
        }
      case 'search':
        {
          setSearchQuery(payload.query);
          break;
        }
    }

    // Dispatch native CustomEvent on trigger element
    if (triggerRef.current) {
      triggerRef.current.dispatchEvent(new CustomEvent(`HO:${type}`, {
        detail: {
          payload,
          prev
        },
        bubbles: true,
        composed: true
      }));
    }
    return result;
  }, []); // stable — reads state via sync refs, all setters are stable

  // Expose imperative handle — stable because fireEvent is stable and all
  // state is read from sync refs at call time.
  react.useImperativeHandle(ref, () => ({
    open() {
      fireEvent('open', {
        trigger: 'imperative'
      });
    },
    close() {
      fireEvent('close', {
        trigger: 'imperative'
      });
    },
    toggle() {
      if (isOpenRef.current) {
        fireEvent('close', {
          trigger: 'imperative'
        });
      } else {
        fireEvent('open', {
          trigger: 'imperative'
        });
      }
    },
    isOpen() {
      return isOpenRef.current;
    },
    getSelected() {
      return selectedItemRef.current;
    },
    getChecked() {
      return new Map(checkedItemsRef.current);
    },
    getActiveNavItem() {
      return activeNavIdRef.current;
    },
    setSearch(query) {
      fireEvent('search', {
        query
      });
    },
    selectAll(groupId, checked) {
      const entry = groupItemsRegistry.current.get(groupId);
      if (!entry) return;
      fireEvent('selectAll', {
        groupId,
        groupLabel: entry.groupLabel,
        itemIds: entry.itemIds,
        _checked: checked
      });
    }
  }), [fireEvent]); // fireEvent is stable, handle is created once

  const setScrollSpyActive = react.useCallback(id => {
    setActiveNavId(id);
    const label = navLabels.current.get(id) ?? '';
    setActiveNavLabel(label);
  }, []);

  // useMemo so context object identity is stable when nothing relevant changed.
  // All callbacks/refs inside are already stable — only the 7 state values and
  // 2 props below can trigger consumer re-renders.
  const contextValue = react.useMemo(() => ({
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
    registerSectionRef
  }), [isOpen, selectedItem, checkedItems, activeNavId, activeNavLabel, searchQuery, hasNav, displayMode, defaultGroupExpanded, darkMode,
  // all others are stable references
  fireEvent, registerGroupItems, setScrollSpyActive, registerNavLabel, registerSectionRef, t]);
  const resolvedChildren = (() => {
    if (fromConfig && children) {
      console.warn('[Dropdown] `fromConfig` and `children` cannot be used together. ' + '`fromConfig` takes precedence — `children` will be ignored.');
      return buildFromConfig(fromConfig);
    }
    if (fromConfig) return buildFromConfig(fromConfig);
    return children;
  })();
  return /*#__PURE__*/jsxRuntime.jsx(DropdownContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/jsxRuntime.jsx("div", {
      className: `hangoverDropdown${darkMode ? ' hangoverDropdown--dark' : ''}`,
      ...rest,
      children: resolvedChildren
    })
  });
});

/**
 * fromConfig — render a full Dropdown tree from a plain JS config object.
 *
 * @param {object} config
 * @param {React.Ref}  [ref]   — forwarded to the root Dropdown ref
 * @returns JSX
 *
 * Config schema:
 * {
 *   // Root props (all optional)
 *   displayMode?:          'scroll' | 'tab'
 *   defaultOpen?:          boolean
 *   defaultGroupExpanded?: boolean | 'first'
 *   hideOnSelection?:      boolean
 *   onEvent?:              ({ type, payload, prev }) => any
 *
 *   // Trigger
 *   trigger: ReactNode | string | {
 *     label:      string
 *     className?: string
 *     component?: ComponentType
 *   }
 *
 *   // Panel (optional — defaults used if omitted)
 *   panel?: {
 *     placement?: string   // default 'bottom-start'
 *     offset?:    number   // default 8
 *   }
 *
 *   // Navigation column (optional)
 *   navigation?: { ... }           // legacy alias for nav config
 *   items?: Array<{                // preferred alias for navigation.items
 *     id?:    string
 *     label:  string
 *     icon?:  ReactNode | FC
 *   }>
 *   showAll?:      boolean         // preferred alias for navigation.showAll
 *   allLabel?:     string
 *   allIcon?:      ReactNode | FC
 *   collapsed?:    boolean
 *   autoCollapse?: boolean
 *
 *   // Content column
 *   content: {
 *     searchPlaceholder?: string    // include search bar when provided
 *     sections: Array<{
 *       for?:   string              // matches navigation item id
 *       title?: string
 *       items?: Array<{
 *         id?:              string
 *         label?:           string
 *         defaultExpanded?: boolean
 *         items: Array<{
 *           id:               string
 *           label:            string
 *           type?:            'click' | 'checkbox'
 *           icon?:            ReactNode | FC
 *           defaultChecked?:  boolean
 *           checkIcon?:       ReactNode | FC
 *           component?:       ComponentType
 *         }>
 *       }>
 *     }>
 *   }
 * }
 */
function renderFromConfig(config, ref) {
  const {
    rootConfig,
    trigger,
    panel,
    navigation,
    content
  } = normalizeConfig(config);
  const {
    displayMode,
    defaultOpen,
    defaultGroupExpanded,
    hideOnSelection,
    onEvent,
    ...rootRest
  } = rootConfig;
  const triggerNode = renderTriggerNode(trigger);
  const navNode = renderNavigationNode(navigation);
  const {
    searchPlaceholder,
    sections = [],
    ...contentRest
  } = content || {};
  const contentNode = /*#__PURE__*/jsxRuntime.jsx(DropdownContent, {
    searchPlaceholder: searchPlaceholder,
    ...contentRest,
    children: renderSectionNodes(sections)
  });
  const {
    placement: panelPlacement,
    offset: panelOffset,
    ...panelRest
  } = panel;
  const panelChildren = /*#__PURE__*/jsxRuntime.jsxs(DropdownPanel, {
    placement: panelPlacement,
    offset: panelOffset,
    ...panelRest,
    children: [navNode, contentNode]
  });
  return /*#__PURE__*/jsxRuntime.jsxs(Dropdown$1, {
    ref: ref,
    displayMode: displayMode,
    defaultOpen: defaultOpen,
    defaultGroupExpanded: defaultGroupExpanded,
    hideOnSelection: hideOnSelection,
    onEvent: onEvent,
    ...rootRest,
    children: [triggerNode, panelChildren]
  });
}

/**
 * DropdownFromConfig — React component wrapper.
 * <DropdownFromConfig config={myConfig} />
 */
const DropdownFromConfig = /*#__PURE__*/react.forwardRef(function DropdownFromConfig({
  config
}, ref) {
  return renderFromConfig(config, ref);
});

/**
 * fromConfig(config, ref?) — imperative helper, returns JSX directly.
 */
function fromConfig(config, ref) {
  return renderFromConfig(config, ref);
}

const Dropdown = Object.assign(Dropdown$1, {
  Trigger: DropdownTrigger,
  Panel: DropdownPanel,
  Navigation: DropdownNav,
  NavigationItem: DropdownNavItem,
  Content: DropdownContent,
  Section: DropdownSection,
  Group: DropdownGroup,
  Item: DropdownItem,
  fromConfig,
  FromConfig: DropdownFromConfig
});

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
function useDropdown() {
  const {
    isOpen,
    selectedItem,
    checkedItems,
    activeNavId,
    activeNavLabel,
    searchQuery,
    displayMode,
    darkMode,
    fireEvent
  } = useDropdownContext();
  const open = react.useCallback(() => fireEvent('open', {
    trigger: 'imperative'
  }), [fireEvent]);
  const close = react.useCallback(() => fireEvent('close', {
    trigger: 'imperative'
  }), [fireEvent]);

  // isOpen is reactive so toggle always reflects current state
  const toggle = react.useCallback(() => fireEvent(isOpen ? 'close' : 'open', {
    trigger: 'imperative'
  }), [fireEvent, isOpen]);
  const setSearch = react.useCallback(query => fireEvent('search', {
    query
  }), [fireEvent]);
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
    fireEvent
  };
}

exports.Dropdown = Dropdown;
exports.default = Dropdown;
exports.useDropdown = useDropdown;
