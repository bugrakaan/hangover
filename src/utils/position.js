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
export function calculatePosition(
  triggerRect,
  popoverRect,
  placement = 'bottom-start',
  offset = 8,
  viewportPadding = 8
) {
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
        top = _alignCross(triggerRect, popoverRect, a, 'vertical');
        return { top, left };
      case 'right':
        left = triggerRect.right + offset;
        top = _alignCross(triggerRect, popoverRect, a, 'vertical');
        return { top, left };
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
      default: // center
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
    }

    return { top, left };
  }

  // --- Fits check: all four edges ---
  function fitsInViewport(pos) {
    return (
      pos.top >= viewportPadding &&
      pos.top + popoverRect.height <= vh - viewportPadding &&
      pos.left >= viewportPadding &&
      pos.left + popoverRect.width <= vw - viewportPadding
    );
  }

  // --- All 8 candidate placements ---
  const ALL_PLACEMENTS = [
    ['bottom', 'start'], ['bottom', undefined], ['bottom', 'end'],
    ['top',    'start'], ['top',    undefined], ['top',    'end'],
    ['left',   undefined],
    ['right',  undefined],
  ];

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
      const dy = p.top  - originalPos.top;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        resolvedSide  = s;
        resolvedAlign = a;
        pos = p;
        fitted = true;
      }
    }

    // if nothing fits, fitted stays false — caller handles fallback
  }

  // Clamp only when a fitting placement was found
  if (fitted) {
    pos.top  = Math.min(Math.max(pos.top,  viewportPadding), vh - popoverRect.height - viewportPadding);
    pos.left = Math.min(Math.max(pos.left, viewportPadding), vw - popoverRect.width  - viewportPadding);
  }

  const actualPlacement = resolvedAlign ? `${resolvedSide}-${resolvedAlign}` : resolvedSide;

  return { top: pos.top, left: pos.left, actualPlacement, fitted };
}

// Cross-axis alignment helper for left/right sides
function _alignCross(triggerRect, popoverRect, align, axis) {
  if (axis === 'vertical') {
    switch (align) {
      case 'start': return triggerRect.top;
      case 'end':   return triggerRect.bottom - popoverRect.height;
      default:      return triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
    }
  }
  return 0;
}

/**
 * Convert placement string to CSS class suffix.
 * "bottom-start" → "forBottomStart"
 */
export function placementToClass(placement) {
  return 'for' + placement
    .split('-')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}
