import { useEffect } from 'react';
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
  } = useDropdownContext();

  const isActive = activeNavId === id;
  useEffect(() => {
    registerNavLabel(id, typeof children === 'string' ? children : '');
  }, [id, children, registerNavLabel]);

  function handleClick() {
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
  };

  if (Comp) {
    return <Comp {...bindingProps} data-ho-active={isActive} {...navItemRest} />;
  }

  return (
    <button
      type="button"
      className={`hangoverDropdown-nav-item${isActive ? ' isActive' : ''}`}
      onClick={() => { handleClick(); userOnClick?.(); }}
      title={typeof children === 'string' ? children : undefined}
      data-ho-active={isActive}
      {...navItemRest}
    >
      {icon && (
        <span className="hangoverDropdown-nav-item-icon" aria-hidden="true">
          {renderIcon(icon)}
        </span>
      )}
      <span className="hangoverDropdown-nav-item-label">{children}</span>
    </button>
  );
}

export default DropdownNavItem;
