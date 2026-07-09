import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDropdownContext } from '../../context/DropdownContext';
import { usePositioner } from '../../hooks/usePositioner';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { placementToClass } from '../../utils/position';

/**
 * DropdownPanel
 *
 * Renders children into a portal on document.body.
 * Handles positioning, outside-click and Escape-key closing.
 *
 * Props:
 *  placement   "bottom-start" (default) | any placement string
 *  offset      number (px), default 8
 *  title       optional title bar rendered at the top of the panel
 *  anchor      React ref to a DOM element — overrides the built-in triggerRef
 *              for positioning. Use when Dropdown.Trigger is not in the markup.
 *  component   optional custom wrapper component
 *  children
 */
function DropdownPanel({ placement = 'bottom-start', offset = 8, title, anchor, component: Comp, children, ...rest }) {
  const resolvedOffset = typeof offset === 'string' ? parseFloat(offset) : offset;
  const { isOpen, triggerRef, fireEvent, hasNav, darkMode, t, groupHeaderStyle } = useDropdownContext();
  const panelRef = useRef(null);

  const anchorRef = anchor ?? triggerRef;

  const { style, actualPlacement } = usePositioner(
    anchorRef,
    panelRef,
    placement,
    resolvedOffset,
    isOpen
  );

  // Outside click
  useOutsideClick([anchorRef, panelRef], () => {
    if (isOpen) fireEvent('close', { trigger: 'outside' });
  });

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        fireEvent('close', { trigger: 'escape' });
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, fireEvent]);

  if (!isOpen) return null;

  const placementClass = placementToClass(actualPlacement);
  const classNames = `hangoverDropdown-panel ${placementClass} isOpen${hasNav ? '' : ' hasNoNav'}${darkMode ? ' hangoverDropdown--dark' : ''}${groupHeaderStyle === 'light' ? ' isLightGroupHeaders' : ''}`;

  const content = Comp ? (
    <Comp
      ref={panelRef}
      isOpen={isOpen}
      placement={actualPlacement}
      style={style}
      className={classNames}
      title={t(title)}
      {...rest}
    >
      {children}
    </Comp>
  ) : (
    <div ref={panelRef} className={classNames} style={style} role="dialog" aria-modal="true" aria-label={t('Dropdown')} {...rest}>
      {title && <div className="hangoverDropdown-panel-title">{t(title)}</div>}
      <div className="hangoverDropdown-panel-inner">
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default DropdownPanel;
