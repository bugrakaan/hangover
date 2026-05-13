import { useEffect } from 'react';
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
 *  title              string — overrides active nav label as section title
 *  component          custom wrapper component
 *  children           DropdownSection / DropdownGroup / DropdownItem elements
 */
function DropdownContent({ searchPlaceholder = 'Search', component: Comp, children, ...rest }) {
  const { searchQuery, fireEvent, contentRef, displayMode, activeNavId, setScrollSpyActive } = useDropdownContext();

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

  function handleSearch(e) {
    fireEvent('search', { query: e.target.value });
  }

  const inner = (
    <>
      <label className="hangoverDropdown-search">
        <span className="hangoverDropdown-search-icon">
          <DefaultSearchIcon />
        </span>
        <input
          type="text"
          className="hangoverDropdown-search-input"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          value={searchQuery}
          onChange={handleSearch}
        />
      </label>
      <div role="listbox" className={`hangoverDropdown-list${displayMode === 'tab' ? ' isTabMode' : ''}${displayMode === 'tab' && activeNavId === '__all__' ? ' isAllActive' : ''}`} ref={contentRef}>
        {children}
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
