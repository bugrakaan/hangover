import { useEffect, useRef, Children } from 'react';
import { useDropdownContext } from '../../context/DropdownContext';
import { isVisible, closestByVerticalPosition, scrollWithin } from '../../utils/keyboardNav';

// Score how well an item's label matches the query. Higher is better.
// Ranking is by match quality only — exact > prefix > substring > fuzzy — so
// that items within the same tier keep their original list order (the caller
// iterates in DOM order and keeps the first item with the top score).
function matchScore(label, query) {
  if (label === query) return 3;
  if (label.startsWith(query)) return 2;
  if (label.includes(query)) return 1;
  return 0;
}

// Pick the best-matching element among the visible items for the given query.
function pickBestMatch(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return items[0] ?? null;
  let best = null;
  let bestScore = -Infinity;
  for (const el of items) {
    const label = (el.querySelector('.hangoverDropdown-item-label')?.textContent ?? '')
      .trim()
      .toLowerCase();
    if (!label) continue;
    const score = matchScore(label, q);
    if (score > bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best ?? items[0] ?? null;
}

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
  const { searchQuery, fireEvent, contentRef, displayMode, activeNavId, setScrollSpyActive, navLabels, t, isOpen, autoFocusSearch } = useDropdownContext();
  const searchInputRef = useRef(null);
  const bottomPadRef = useRef(0);
  // The item currently highlighted while the search input keeps DOM focus
  // (virtual / aria-activedescendant navigation). null when no item is active.
  const activeItemRef = useRef(null);

  // Auto-focus the search input when the panel opens (opt-out via
  // autoFocusSearch={false} on <Dropdown>).
  useEffect(() => {
    if (!isOpen || !autoFocusSearch) return;
    const el = searchInputRef.current;
    if (el) el.focus({ preventScroll: true });
  }, [isOpen, autoFocusSearch]);

  // The nav id that represents the top of the list: the "All" item when it is
  // present, otherwise the first section.
  function topNavId() {
    if (navLabels.has('__all__')) return '__all__';
    const first = contentRef.current?.querySelector('[data-section-for]');
    return first?.dataset.sectionFor ?? '__all__';
  }

  // Scroll spy: update active nav based on scroll position. Disabled while a
  // search is active — during search the active nav is driven by the currently
  // highlighted result's category instead of the scroll position.
  useEffect(() => {
    if (displayMode !== 'scroll') return;
    if (searchQuery) return;
    const scrollEl = contentRef.current;
    if (!scrollEl) return;

    function updateSpy() {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;

      // En üstteyken → All (veya All yoksa ilk section)
      if (scrollTop <= 2) {
        setScrollSpyActive(topNavId());
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
  }, [displayMode, contentRef, setScrollSpyActive, searchQuery]);

  // Tab mode: reset scroll position when active tab changes
  useEffect(() => {
    if (displayMode !== 'tab') return;
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [displayMode, activeNavId, contentRef]);

  // When the search query changes, virtually highlight the first (best) match
  // so the user can press Enter to select it while the search input keeps
  // focus. The list is scrolled so the first selection sits at the top of the
  // viewport (instead of always resetting to the very top). With no query the
  // list simply returns to the top.
  useEffect(() => {
    const list = contentRef.current;
    if (!list) return;
    clearActiveItem();
    if (!searchQuery) {
      list.scrollTop = 0;
      // Search cleared → reset the active category to the top ("All" if present,
      // otherwise the first section).
      setScrollSpyActive(topNavId());
      return;
    }
    const items = Array.from(list.querySelectorAll('.hangoverDropdown-item')).filter(isVisible);
    const best = pickBestMatch(items, searchQuery);
    if (best) {
      setActiveItem(best);
      scrollItemToTop(best);
    } else {
      list.scrollTop = 0;
    }
  }, [searchQuery, contentRef]);

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
    // Typing changes the visible list, so any virtual highlight is stale.
    clearActiveItem();
    fireEvent('search', { query: e.target.value });
  }

  // ── Virtual highlight (search input keeps focus) ───────────────────────
  // While the search input is focused, arrow navigation highlights items
  // without moving DOM focus, so the user can keep editing the query and
  // press Enter to activate the highlighted item.
  const HIGHLIGHT_CLASS = 'isActive';

  function clearActiveItem() {
    const el = activeItemRef.current;
    if (el) el.classList.remove(HIGHLIGHT_CLASS);
    activeItemRef.current = null;
    searchInputRef.current?.removeAttribute('aria-activedescendant');
  }

  function setActiveItem(el) {
    if (activeItemRef.current && activeItemRef.current !== el) {
      activeItemRef.current.classList.remove(HIGHLIGHT_CLASS);
    }
    activeItemRef.current = el;
    el.classList.add(HIGHLIGHT_CLASS);
    if (!el.id) el.id = `hangoverDropdown-item-${Math.random().toString(36).slice(2, 9)}`;
    searchInputRef.current?.setAttribute('aria-activedescendant', el.id);
    // Reflect the highlighted item's category as active in the left nav
    // (scroll mode only) so the nav follows the selection, not the scroll.
    if (displayMode === 'scroll') {
      const sectionId = el.closest('[data-section-for]')?.dataset.sectionFor;
      if (sectionId) setScrollSpyActive(sectionId);
    }
    scrollItemIntoView(el);
  }

  // Move the virtual highlight through the visible items. The search input
  // stays focused the whole time, so navigation wraps among the items only
  // (it never returns focus/highlight to the input).
  function moveVirtualHighlight(direction) {
    const list = contentRef.current;
    const items = list
      ? Array.from(list.querySelectorAll('.hangoverDropdown-item')).filter(isVisible)
      : [];
    if (items.length === 0) return;
    const currentIdx = activeItemRef.current ? items.indexOf(activeItemRef.current) : -1;
    let nextIdx;
    if (currentIdx === -1) {
      nextIdx = direction === 1 ? 0 : items.length - 1;
    } else {
      nextIdx = (currentIdx + direction + items.length) % items.length;
    }
    setActiveItem(items[nextIdx]);
  }

  // Keyboard navigation: ArrowDown/ArrowUp move focus across the currently
  // visible items (works before and after searching, since filtered items
  // are removed from the DOM). Enter is handled by each item itself.
  function scrollItemIntoView(el) {
    const list = contentRef.current;
    if (!list || !el) return;

    // Offset by the sticky headers (section title + a sticky group header) plus
    // the gap between items so the item stays fully visible with breathing room
    // and never ends up hidden underneath a pinned header.
    const stickyHeight = stickyOffsetFor(el);
    const gap = el.parentElement
      ? parseFloat(getComputedStyle(el.parentElement).rowGap) || 0
      : 0;

    scrollWithin(list, el, stickyHeight + gap, gap);
  }

  // Total height of sticky headers pinned at the top of the list that can
  // overlap an item: the section title (when present) plus the item's own
  // group header when it is sticky (e.g. the "light" group-header style).
  function stickyOffsetFor(el) {
    const list = contentRef.current;
    if (!list) return 0;
    let offset = 0;
    const sectionTitle = list.querySelector('.hangoverDropdown-section-title');
    if (sectionTitle) offset += sectionTitle.offsetHeight;
    const header = el?.closest('.hangoverDropdown-group')?.querySelector('.hangoverDropdown-group-header');
    if (header && getComputedStyle(header).position === 'sticky') {
      offset += header.offsetHeight;
    }
    return offset;
  }

  // Scroll so `el` sits at the very top of the list (just below any sticky
  // headers). Used to bring the first search match to the top.
  function scrollItemToTop(el) {
    const list = contentRef.current;
    if (!list || !el) return;
    const stickyHeight = stickyOffsetFor(el);
    const containerTop = list.getBoundingClientRect().top;
    const elTop = el.getBoundingClientRect().top;
    const offset = elTop - containerTop + list.scrollTop - stickyHeight;
    list.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
  }

  function focusTarget(el) {
    if (!el) return;
    if (el === searchInputRef.current) {
      el.focus();
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      el.focus({ preventScroll: true });
      scrollItemIntoView(el);
    }
  }

  // The focusable sequence in the right column: the search input (if present)
  // followed by every visible item. Up/Down wrap around this sequence.
  function getFocusSequence() {
    const list = contentRef.current;
    const items = list
      ? Array.from(list.querySelectorAll('.hangoverDropdown-item')).filter(isVisible)
      : [];
    const seq = [];
    if (searchInputRef.current) seq.push(searchInputRef.current);
    seq.push(...items);
    return seq;
  }

  function moveItemFocus(direction) {
    const seq = getFocusSequence();
    if (seq.length === 0) return;

    const active = document.activeElement;
    const idx = seq.indexOf(active);
    let nextIdx;
    if (idx === -1) {
      nextIdx = direction === 1 ? 0 : seq.length - 1;
    } else {
      nextIdx = (idx + direction + seq.length) % seq.length;
    }
    focusTarget(seq[nextIdx]);
  }

  // ArrowLeft from a content item jumps to the position-closest nav item.
  function focusNavFromItem() {
    const active = document.activeElement;
    if (!active || !active.classList.contains('hangoverDropdown-item')) return false;
    const panel = active.closest('.hangoverDropdown-panel');
    const nav = panel?.querySelector('.hangoverDropdown-column.forNavigation');
    if (!nav) return false;
    const navItems = Array.from(nav.querySelectorAll('.hangoverDropdown-nav-item')).filter(isVisible);
    if (navItems.length === 0) return false;
    const target = closestByVerticalPosition(navItems, active);
    if (!target) return false;
    target.focus({ preventScroll: true });
    scrollWithin(nav, target);
    return true;
  }

  function handleKeyNav(e) {
    // Contain navigation keys so they don't bleed out and get captured by the
    // host application's own shortcuts. Escape and Tab are allowed through so
    // the panel can still close and move focus.
    if (e.key === 'Escape' || e.key === 'Tab') return;
    e.stopPropagation();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveItemFocus(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveItemFocus(-1);
    } else if (e.key === 'ArrowLeft') {
      if (focusNavFromItem()) e.preventDefault();
    }
  }

  // The search input keeps Left/Right for caret movement; only Up/Down
  // navigate. Navigation highlights items virtually so the input never loses
  // focus — the user can keep editing and press Enter to activate the
  // highlighted item. All keys are contained (except Escape/Tab) so typing and
  // navigation never trigger the host application's own shortcuts.
  function handleSearchKeyNav(e) {
    if (e.key === 'Escape' || e.key === 'Tab') return;
    e.stopPropagation();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveVirtualHighlight(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveVirtualHighlight(-1);
    } else if (e.key === 'Enter') {
      const el = activeItemRef.current;
      if (el) {
        e.preventDefault();
        el.click();
      }
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
            onKeyDown={handleSearchKeyNav}
            onBlur={clearActiveItem}
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
