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
 * @param {DOMRect[]} avoidRects  rects the popover should not overlap; among
 *                                fitting placements the one with the least
 *                                overlap (then closest to the preferred side)
 *                                is chosen
 * @param {string[]} priority    ordered list of sides/placements to try first
 *                                when auto-placing, e.g. ['bottom','top','right','left']
 * @returns {{ top: number, left: number, actualPlacement: string }}
 *
 * Coordinates are viewport-relative (for position:fixed).
 */
export function calculatePosition(
  triggerRect,
  popoverRect,
  placement = 'bottom-start',
  offset = 8,
  viewportPadding = 8,
  avoidRects = [],
  priority = []
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

  // --- Overlap area against the "avoid" rects for a candidate position ---
  function overlapArea(pos) {
    if (!avoidRects || avoidRects.length === 0) return 0;
    const pRight = pos.left + popoverRect.width;
    const pBottom = pos.top + popoverRect.height;
    let total = 0;
    for (const r of avoidRects) {
      if (!r) continue;
      const ix = Math.max(0, Math.min(pRight, r.right) - Math.max(pos.left, r.left));
      const iy = Math.max(0, Math.min(pBottom, r.bottom) - Math.max(pos.top, r.top));
      total += ix * iy;
    }
    return total;
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
  const originalOverlap = overlapArea(originalPos);

  const usePriority = Array.isArray(priority) && priority.length > 0;

  // Re-search when a priority order is supplied, or when the preferred
  // placement doesn't fit / collides with an avoided node.
  if (usePriority || !fitted || originalOverlap > 0) {
    // Build the ordered list of candidate placements to try.
    const ordered = [];
    const seen = new Set();
    const push = (s, a) => {
      const key = s + ':' + a;
      if (seen.has(key)) return;
      seen.add(key);
      ordered.push([s, a]);
    };

    if (usePriority) {
      for (const entry of priority) {
        if (typeof entry !== 'string') continue;
        const [ps, pa] = entry.split('-');
        if (ps === 'left' || ps === 'right') push(ps, undefined);
        else push(ps, pa || align); // inherit preferred alignment for top/bottom
      }
      // Append the remaining placements as a final fallback.
      for (const [s, a] of ALL_PLACEMENTS) push(s, a);
    } else {
      // Preferred placement first, then the rest ordered by distance to it.
      const rest = ALL_PLACEMENTS
        .map(([s, a]) => ({ s, a, p: coords(s, a) }))
        .sort((x, y) => {
          const dx1 = x.p.left - originalPos.left, dy1 = x.p.top - originalPos.top;
          const dx2 = y.p.left - originalPos.left, dy2 = y.p.top - originalPos.top;
          return (dx1 * dx1 + dy1 * dy1) - (dx2 * dx2 + dy2 * dy2);
        });
      for (const { s, a } of rest) push(s, a);
    }

    let bestFit = null;     // fitting candidate with the least overlap
    let firstClear = null;  // first fitting candidate (in order) with no overlap

    for (const [s, a] of ordered) {
      const p = coords(s, a);
      if (!fitsInViewport(p)) continue;
      const overlap = overlapArea(p);
      if (overlap === 0) {
        firstClear = { s, a, p };
        break;
      }
      if (bestFit === null || overlap < bestFit.overlap) {
        bestFit = { s, a, p, overlap };
      }
    }

    const chosen = firstClear || bestFit;
    if (chosen) {
      resolvedSide  = chosen.s;
      resolvedAlign = chosen.a;
      pos = chosen.p;
      fitted = true;
    }

    // if nothing fits, fitted may stay false — caller handles fallback
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
