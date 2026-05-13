import { useContext } from 'react';
import { GroupContext, useDropdownContext } from '../../context/DropdownContext';
import { renderIcon } from '../../utils/renderIcon';

// Default check icon
function DefaultCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12.4714 4.86195C12.7317 5.1223 12.7317 5.54441 12.4714 5.80476L7.13805 11.1381C6.8777 11.3984 6.45559 11.3984 6.19524 11.1381L3.52858 8.47142C3.26823 8.21108 3.26823 7.78897 3.52858 7.52862C3.78892 7.26827 4.21103 7.26827 4.47138 7.52862L6.66665 9.72388L11.5286 4.86195C11.7889 4.6016 12.211 4.6016 12.4714 4.86195Z" fill="currentColor" />
    </svg>
  );
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
  } = useDropdownContext();

  const groupCtx = useContext(GroupContext);
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
  const isChecked = type === 'checkbox'
    ? (checkedItems.get(id) ?? defaultChecked)
    : false;

  const actionContext = {
    id,
    label,
    type,
    groupId,
    groupLabel,
    isSelected,
    isChecked,
  };

  const actionsNode = typeof actions === 'function' ? actions(actionContext) : actions;

  function handleClick() {
    if (type === 'checkbox') {
      fireEvent('check', { id, label, groupId, groupLabel });
    } else {
      fireEvent('select', { id, label, groupLabel });
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  const { onClick: userOnClick, onKeyDown: userOnKeyDown, ...domRest } = rest;

  // Binding props for custom component
  const bindingProps = {
    isSelected,
    isActive: false, // hover managed by CSS :hover
    isChecked,
    onClick: () => { handleClick(); userOnClick?.(); },
    onKeyDown: (e) => { handleKeyDown(e); userOnKeyDown?.(e); },
    id,
    children,
    actions: actionsNode,
  };

  if (Comp) {
    return (
      <Comp
        {...bindingProps}
        data-ho-selected={isSelected}
        data-ho-checked={isChecked}
        {...domRest}
      />
    );
  }

  const checkIconNode = checkIcon ? renderIcon(checkIcon) : <DefaultCheckIcon />;

  const classNames = [
    'hangoverDropdown-item',
    isSelected ? 'isSelected' : '',
    isChecked ? 'isChecked' : '',
    type === 'checkbox' ? 'isCheckboxType' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      role={type === 'checkbox' ? 'checkbox' : 'option'}
      aria-selected={type === 'click' ? isSelected : undefined}
      aria-checked={type === 'checkbox' ? isChecked : undefined}
      tabIndex={0}
      className={classNames}
      title={label || undefined}
      onClick={() => { handleClick(); userOnClick?.(); }}
      onKeyDown={(e) => { handleKeyDown(e); userOnKeyDown?.(e); }}
      data-ho-selected={isSelected}
      data-ho-checked={isChecked}
      {...domRest}
    >
      {icon && (
        <span className="hangoverDropdown-item-icon">
          {renderIcon(icon)}
        </span>
      )}
      <span className="hangoverDropdown-item-label">{children}</span>
      {actionsNode && (
        <span
          className="hangoverDropdown-item-actions"
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          {actionsNode}
        </span>
      )}
      {type === 'checkbox' && (
        <span className={`hangoverDropdown-item-check-icon${isChecked ? ' isVisible' : ''}`}>
          {isChecked && checkIconNode}
        </span>
      )}
    </div>
  );
}

export default DropdownItem;
