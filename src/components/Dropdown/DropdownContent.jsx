import { useEffect, useRef, Children } from 'react';
import { useDropdownContext } from '../../context/DropdownContext';

// Default search icon (inline SVG)
function DefaultSearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M13.1355 14.3129C11.9293 15.2651 10.406 15.8334 8.74999 15.8334C4.83797 15.8334 1.66666 12.662 1.66666 8.75002C1.66666 4.838 4.83797 1.66669 8.74999 1.66669C12.662 1.66669 15.8333 4.838 15.8333 8.75002C15.8333 10.406 15.265 11.9293 14.3129 13.1355C14.3218 13.1437 14.3306 13.1521 14.3392 13.1608L18.0892 16.9108C18.4147 17.2362 18.4147 17.7638 18.0892 18.0893C17.7638 18.4147 17.2362 18.4147 16.9107 18.0893L13.1607 14.3393C13.1521 14.3306 13.1437 14.3218 13.1355 14.3129ZM14.1667 8.75002C14.1667 11.7416 11.7415 14.1667 8.74999 14.1667C5.75845 14.1667 3.33332 11.7416 3.33332 8.75002C3.33332 5.75848 5.75845 3.33335 8.74999 3.33335C11.7415 3.33335 14.1667 5.75848 14.1667 8.75002Z" fill="currentColor" />
    </svg>
  );
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
function DropdownContent({ searchPlaceholder = 'Search', emptyText = 'Nothing to show here', component: Comp, children, ...rest }) {
  const { searchQuery, fireEvent, contentRef, displayMode, activeNavId, setScrollSpyActive, t } = useDropdownContext();
  const searchInputRef = useRef(null);
  const bottomPadRef = useRef(0);

  // Scroll spy: update active nav based on scroll position
  useEffect(() => {
    if (displayMode !== 'scroll') return;
    const scrollEl = contentRef.current;
    if (!scrollEl) return;

    function updateSpy() {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;

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

    scrollEl.addEventListener('scroll', updateSpy, { passive: true });
    return () => scrollEl.removeEventListener('scroll', updateSpy);
  }, [displayMode, contentRef, setScrollSpyActive]);

  // Tab mode: reset scroll position when active tab changes
  useEffect(() => {
    if (displayMode !== 'tab') return;
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [displayMode, activeNavId, contentRef]);

  // Scroll mode: reserve enough space at the bottom of the list so the last
  // section (even a short single-entry one) can be scrolled all the way to the
  // top. Without this, a short last section can never reach the top because the
  // container has already hit its maximum scroll position.
  useEffect(() => {
    if (displayMode !== 'scroll') return;
    const list = contentRef.current;
    if (!list) return;

    let rafId = null;

    function computeBottomSpace() {
      rafId = null;
      const sections = list.querySelectorAll('[data-section-for]');
      const lastSection = sections[sections.length - 1];
      if (!lastSection) {
        if (bottomPadRef.current !== 0) {
          list.style.paddingBottom = '';
          bottomPadRef.current = 0;
        }
        return;
      }

      // Derive the natural content height by subtracting our own reserved
      // space, so recomputes never compound. Using real geometry for the last
      // section's top keeps this margin-safe (bottom padding sits after it, so
      // it never shifts the section's top position).
      const available = list.clientHeight;
      const naturalScrollHeight = list.scrollHeight - bottomPadRef.current;
      const listTop = list.getBoundingClientRect().top;
      const lastTopWithinContent =
        lastSection.getBoundingClientRect().top - listTop + list.scrollTop;
      const spaceBelowLastTop = naturalScrollHeight - lastTopWithinContent;
      const pad = Math.max(0, Math.round(available - spaceBelowLastTop));

      // Only touch the DOM when the reserved space actually changes by a whole
      // pixel — this ignores sub-pixel/floating jitter from the observer and
      // keeps the value stable.
      if (Math.abs(pad - bottomPadRef.current) < 1) return;
      bottomPadRef.current = pad;
      list.style.paddingBottom = `${pad}px`;
    }

    // Coalesce bursts of observer callbacks into a single measurement per frame.
    function scheduleBottomSpace() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(computeBottomSpace);
    }

    scheduleBottomSpace();

    // Observe both the container (viewport resize) and every section (group
    // expand/collapse, late reflows) so the reserved space stays accurate.
    const observer = new ResizeObserver(scheduleBottomSpace);
    observer.observe(list);
    list.querySelectorAll('[data-section-for]').forEach((section) => {
      observer.observe(section);
    });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [displayMode, contentRef, children, searchQuery]);

  function handleSearch(e) {
    fireEvent('search', { query: e.target.value });
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
      list.scrollTo({ top: list.scrollTop + delta, behavior: 'smooth' });
    }
  }

  function moveItemFocus(direction) {
    const list = contentRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll('.hangoverDropdown-item'))
      .filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;

    const active = document.activeElement;
    const idx = items.indexOf(active);

    if (direction === 1) {
      const next = idx < 0 ? items[0] : items[idx + 1];
      if (next) {
        next.focus({ preventScroll: true });
        scrollItemIntoView(next);
      }
    } else if (idx > 0) {
      const prev = items[idx - 1];
      prev.focus({ preventScroll: true });
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

  const isEmpty = Children.count(children) === 0;

  const inner = (
    <>
      {!isEmpty && (
        <label className="hangoverDropdown-search">
          <span className="hangoverDropdown-search-icon">
            <DefaultSearchIcon />
          </span>
          <input
            type="text"
            className="hangoverDropdown-search-input"
            placeholder={t(searchPlaceholder)}
            aria-label={t(searchPlaceholder)}
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleKeyNav}
            ref={searchInputRef}
          />
        </label>
      )}
      <div role="listbox" className={`hangoverDropdown-list${displayMode === 'tab' ? ' isTabMode' : ''}${displayMode === 'tab' && activeNavId === '__all__' ? ' isAllActive' : ''}`} ref={contentRef} onKeyDown={handleKeyNav}>
        {isEmpty ? (
          <div className="hangoverDropdown-content-empty">{t(emptyText)}</div>
        ) : children}
      </div>
    </>
  );

  if (Comp) {
    return (
      <Comp
        className="hangoverDropdown-column forItems"
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        {...rest}
      >
        {inner}
      </Comp>
    );
  }

  return (
    <div className="hangoverDropdown-column forItems" {...rest}>
      {inner}
    </div>
  );
}

export default DropdownContent;
