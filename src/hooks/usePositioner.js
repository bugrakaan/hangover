import { useEffect, useRef, useState, useCallback } from 'react';
import { calculatePosition } from '../utils/position';

/**
 * Resolve the `avoid` prop into an array of DOMRects.
 * Accepts a single value or an array of: CSS selector strings, DOM elements,
 * or refs ({ current: Element }). The anchor and the panel itself (and any
 * node inside the panel) are excluded so the popover never avoids itself.
 */
function resolveAvoidRects(avoid, panelEl, anchorEl) {
  if (!avoid) return [];
  const list = Array.isArray(avoid) ? avoid : [avoid];
  const nodes = new Set();

  for (const item of list) {
    if (!item) continue;
    if (typeof item === 'string') {
      document.querySelectorAll(item).forEach((n) => nodes.add(n));
    } else if (item.current instanceof Element) {
      nodes.add(item.current);
    } else if (item instanceof Element) {
      nodes.add(item);
    }
  }

  const rects = [];
  nodes.forEach((n) => {
    if (n === panelEl || n === anchorEl) return;
    if (panelEl && panelEl.contains(n)) return;
    rects.push(n.getBoundingClientRect());
  });
  return rects;
}

/**
 * usePositioner
 *
 * Keeps a floating panel anchored to a trigger element.
 * Uses position:fixed so scroll doesn't shift the panel — but recalculates
 * whenever the trigger moves (scroll, resize, layout shift, drag, transform).
 *
 * @param {React.RefObject} triggerRef
 * @param {React.RefObject} panelRef
 * @param {string}          placement  e.g. "bottom-start"
 * @param {number}          offset     gap in px
 * @param {boolean}         isOpen
 * @returns {{ style: CSSProperties, actualPlacement: string }}
 */
export function usePositioner(triggerRef, panelRef, placement, offset, isOpen, avoid, placementPriority) {
  const [actualPlacement, setActualPlacement] = useState(placement);
  const rafId = useRef(null);
  const lastFittedPlacementRef = useRef(placement);
  const resolvedPlacementRef = useRef(placement);
  const initializedRef = useRef(false);
  const avoidRef = useRef(avoid);
  avoidRef.current = avoid;
  const priorityRef = useRef(placementPriority);
  priorityRef.current = placementPriority;

  const recalculate = useCallback(() => {
    if (!triggerRef.current || !panelRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const panelRect   = panelRef.current.getBoundingClientRect();
    const avoidRects  = resolveAvoidRects(avoidRef.current, panelRef.current, triggerRef.current);
    const priority    = priorityRef.current;

    let result = calculatePosition(triggerRect, panelRect, placement, offset, 8, avoidRects, priority);

    if (result.fitted) {
      lastFittedPlacementRef.current = result.actualPlacement;
    } else {
      result = calculatePosition(triggerRect, panelRect, lastFittedPlacementRef.current, offset, 8, avoidRects, priority);
    }

    // Apply position directly to the DOM — bypasses React re-render for
    // smoother scroll tracking (no setState → reconciliation → commit cycle)
    const el = panelRef.current;
    el.style.top  = result.top  + 'px';
    el.style.left = result.left + 'px';

    if (!initializedRef.current) {
      el.style.visibility = '';
      initializedRef.current = true;
    }

    // Only trigger a React re-render when the placement class needs to change
    if (result.actualPlacement !== resolvedPlacementRef.current) {
      resolvedPlacementRef.current = result.actualPlacement;
      setActualPlacement(result.actualPlacement);
    }
  }, [triggerRef, panelRef, placement, offset]);

  const scheduleRecalc = useCallback(() => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      recalculate();
    });
  }, [recalculate]);

  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      lastFittedPlacementRef.current = placement;
      resolvedPlacementRef.current = placement;
      setActualPlacement(placement);
      return;
    }

    // Initial calc after panel mounts (needs 1 rAF so panel has dimensions)
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      recalculate();
    });

    // ResizeObserver on trigger + panel
    const ro = new ResizeObserver(scheduleRecalc);
    if (triggerRef.current) ro.observe(triggerRef.current);
    if (panelRef.current)   ro.observe(panelRef.current);

    // Capture-phase scroll catches scrolling in ANY ancestor / scroll
    // container (scroll events don't bubble, but do fire during capture),
    // and resize covers viewport changes.
    const scrollOpts = { capture: true, passive: true };
    window.addEventListener('scroll', scheduleRecalc, scrollOpts);
    window.addEventListener('resize', scheduleRecalc, { passive: true });

    // Aggressive follow: track the anchor every frame so the panel stays glued
    // even when no scroll/resize/observer event fires — e.g. when the anchor
    // moves via a drag interaction or CSS transforms.
    let followId = null;
    let prevRect = null;
    const follow = () => {
      const anchor = triggerRef.current;
      if (anchor) {
        const r = anchor.getBoundingClientRect();
        if (
          !prevRect ||
          r.top !== prevRect.top ||
          r.left !== prevRect.left ||
          r.width !== prevRect.width ||
          r.height !== prevRect.height
        ) {
          prevRect = r;
          recalculate();
        }
      }
      followId = requestAnimationFrame(follow);
    };
    followId = requestAnimationFrame(follow);

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      if (followId !== null) cancelAnimationFrame(followId);
      ro.disconnect();
      window.removeEventListener('scroll', scheduleRecalc, scrollOpts);
      window.removeEventListener('resize', scheduleRecalc, { passive: true });
    };
  }, [isOpen, recalculate, scheduleRecalc, triggerRef, panelRef]);

  return {
    style: { position: 'fixed', top: 0, left: 0, visibility: 'hidden', zIndex: 9999 },
    actualPlacement,
  };
}
