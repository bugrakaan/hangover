import { createElement, isValidElement } from 'react';

/**
 * Renders an icon that can be either:
 *  - A React element (instance): <MyIcon />  → returned as-is
 *  - A React component (FC/class): MyIcon    → instantiated with createElement
 *
 * @param {React.ReactNode|React.ComponentType} icon
 * @returns {React.ReactNode|null}
 */
export function renderIcon(icon) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function') return createElement(icon);
  return null;
}
