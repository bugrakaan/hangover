import { Children, cloneElement } from 'react';
import { useDropdownContext } from '../../context/DropdownContext';

/**
 * DropdownTrigger
 *
 * Wraps any single child and turns it into the dropdown trigger.
 * Injects: ref, onClick, aria-expanded, aria-haspopup
 */
function DropdownTrigger({ children }) {
  const { triggerRef, isOpen, fireEvent } = useDropdownContext();

  const child = Children.only(children);

  function handleClick(e) {
    if (isOpen) {
      fireEvent('close', { trigger: 'click' });
    } else {
      fireEvent('open', { trigger: 'click' });
    }
    child.props.onClick?.(e);
  }

  return cloneElement(child, {
    ref: triggerRef,
    onClick: handleClick,
    'aria-expanded': isOpen,
    'aria-haspopup': 'dialog',
  });
}

export default DropdownTrigger;
