// Shared helpers for keyboard navigation across the dropdown panel.

/** Whether an element is currently rendered/visible (not display:none, etc). */
export function isVisible(el) {
  return !!el && el.offsetParent !== null;
}

/** Vertical center of an element in viewport coordinates. */
export function verticalCenter(el) {
  const rect = el.getBoundingClientRect();
  return rect.top + rect.height / 2;
}

/**
 * From a list of candidate elements, return the one whose vertical center is
 * closest to the source element's vertical center. Used to pick the most
 * position-appropriate target when moving between the left and right columns.
 */
export function closestByVerticalPosition(candidates, sourceEl) {
  if (!candidates.length) return null;
  const center = verticalCenter(sourceEl);
  let best = candidates[0];
  let bestDist = Math.abs(verticalCenter(best) - center);
  for (let i = 1; i < candidates.length; i += 1) {
    const dist = Math.abs(verticalCenter(candidates[i]) - center);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidates[i];
    }
  }
  return best;
}

/**
 * Smoothly scroll `el` into view inside its scrollable `container`, leaving
 * `topOffset` px of space at the top (e.g. for a sticky header + gap) and
 * `bottomOffset` px at the bottom.
 */
export function scrollWithin(container, el, topOffset = 0, bottomOffset = 0) {
  if (!container || !el) return;
  const containerRect = container.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  let delta = 0;
  if (elRect.top < containerRect.top + topOffset) {
    delta = elRect.top - (containerRect.top + topOffset);
  } else if (elRect.bottom > containerRect.bottom - bottomOffset) {
    delta = elRect.bottom - (containerRect.bottom - bottomOffset);
  }

  if (delta !== 0) {
    container.scrollTo({ top: container.scrollTop + delta, behavior: 'smooth' });
  }
}
