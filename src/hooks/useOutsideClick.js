import { useEffect } from 'react';

/**
 * useOutsideClick
 *
 * Calls `callback` when a mousedown event occurs outside ALL of the
 * provided refs.
 *
 * @param {React.RefObject[]} refs
 * @param {function}          callback
 */
export function useOutsideClick(refs, callback) {
  useEffect(() => {
    function handleMouseDown(e) {
      const isOutside = refs.every(ref => {
        if (!ref.current) return true;
        return !ref.current.contains(e.target);
      });
      if (isOutside) callback(e);
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [refs, callback]);
}
