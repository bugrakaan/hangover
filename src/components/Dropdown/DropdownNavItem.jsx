import { useEffect, useRef } from 'react';
import { useDropdownContext } from '../../context/DropdownContext';
import { renderIcon } from '../../utils/renderIcon';

/**
 * DropdownNavItem
 *
 * A single navigation item in the left column.
 *
 * Props:
 *  id         string (required)
 *  icon       ReactNode | FC
 *  children   label text
 *  component  custom component — receives: isActive, onClick, id, children
 */
function DropdownNavItem({ id, icon, children, component: Comp, ...rest }) {
  const {
    activeNavId,
    fireEvent,
    displayMode,
    contentRef,
    sectionRefs,
    registerNavLabel,
    searchQuery,
    sectionMatches,
    hideEmptyResults,
    t,
  } = useDropdownContext();

  const isActive = activeNavId === id;
  const buttonRef = useRef(null);

  // While filtering, categories with no matching items are disabled. The "All"
  // item is never disabled. Skipped entirely when hideEmptyResults is off.
  const isDisabled = hideEmptyResults && Boolean(searchQuery?.trim()) && id !== '__all__' && sectionMatches.get(id) === false;

  useEffect(() => {
    registerNavLabel(id, typeof children === 'string' ? children : '');
  }, [id, children, registerNavLabel]);

  // When this item becomes active (e.g. via scroll-spy on the right column),
  // keep it visible inside the scrollable nav column.
  useEffect(() => {
    if (!isActive) return;
    const el = buttonRef.current;
    if (!el) return;
    const container = el.closest('.hangoverDropdown-column.forNavigation');
    if (!container) return;

    // Leave a gap-sized breathing space so the active item never sits flush
    // against the top/bottom edge of the nav column.
    const navList = el.parentElement;
    const gap = navList
      ? parseFloat(getComputedStyle(navList).rowGap || getComputedStyle(navList).gap) || 0
      : 0;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    let delta = 0;
    if (elRect.top < containerRect.top + gap) {
      delta = elRect.top - containerRect.top - gap;
    } else if (elRect.bottom > containerRect.bottom - gap) {
      delta = elRect.bottom - containerRect.bottom + gap;
    }

    if (delta !== 0) {
      container.scrollTo({ top: container.scrollTop + delta, behavior: 'smooth' });
    }
  }, [isActive]);

  function handleClick() {
    if (isDisabled) return;
    fireEvent('navChange', { id });

    if (displayMode === 'scroll') {
      const sectionEl = sectionRefs.get(id);
      const scrollContainer = contentRef.current;

      if (sectionEl && scrollContainer) {
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const sectionTop = sectionEl.getBoundingClientRect().top;
        const offset = sectionTop - containerTop + scrollContainer.scrollTop;

        scrollContainer.scrollTo({ top: offset, behavior: 'smooth' });
      } else if (id === '__all__' && scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  const { onClick: userOnClick, ...navItemRest } = rest;

  const bindingProps = {
    isActive,
    onClick: () => { handleClick(); userOnClick?.(); },
    id,
    children,
    disabled: isDisabled,
  };

  if (Comp) {
    return <Comp {...bindingProps} data-ho-active={isActive} {...navItemRest} />;
  }

  return (
    <button
      type="button"
      ref={buttonRef}
      className={`hangoverDropdown-nav-item${isActive ? ' isActive' : ''}${isDisabled ? ' isDisabled' : ''}`}
      onClick={() => { handleClick(); userOnClick?.(); }}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      title={typeof children === 'string' ? t(children) : undefined}
      data-ho-active={isActive}
      {...navItemRest}
    >
      {icon && (
        <span className="hangoverDropdown-nav-item-icon" aria-hidden="true">
          {renderIcon(icon)}
        </span>
      )}
      <span className="hangoverDropdown-nav-item-label">{typeof children === 'string' ? t(children) : children}</span>
    </button>
  );
}

export default DropdownNavItem;
