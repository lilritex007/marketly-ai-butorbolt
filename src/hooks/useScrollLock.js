import { useEffect } from 'react';

let lockCount = 0;
const savedStyles = new Map();
let lastScrollParent = null;

function getScrollParent() {
  if (typeof document === 'undefined') return null;
  const appRoot = document.getElementById('mkt-butorbolt-app') || document.getElementById('root');
  if (!appRoot) return null;
  let parent = appRoot.parentElement;
  while (parent && parent !== document.body) {
    const style = getComputedStyle(parent);
    const oy = style.overflowY;
    const isScrollable =
      (oy === 'auto' || oy === 'scroll' || oy === 'overlay') && parent.scrollHeight > parent.clientHeight;
    if (isScrollable) return parent;
    parent = parent.parentElement;
  }
  return null;
}

function lock() {
  lockCount++;
  if (lockCount !== 1) return;

  const bodyOverflow = document.body.style.overflow || '';
  savedStyles.set(document.body, bodyOverflow);
  document.body.style.overflow = 'hidden';

  const scrollParent = getScrollParent();
  if (scrollParent) {
    lastScrollParent = scrollParent;
    savedStyles.set(scrollParent, scrollParent.style.overflow || '');
    scrollParent.style.overflow = 'hidden';
  }
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  const bodySaved = savedStyles.get(document.body);
  document.body.style.overflow = bodySaved !== undefined ? String(bodySaved) : '';
  savedStyles.delete(document.body);

  if (lastScrollParent) {
    const parentSaved = savedStyles.get(lastScrollParent);
    lastScrollParent.style.overflow = parentSaved !== undefined ? String(parentSaved) : '';
    savedStyles.delete(lastScrollParent);
    lastScrollParent = null;
  }
}

/**
 * useScrollLock - Locks background scroll when modal/popup is open.
 * Works for both standalone (body) and embed (scroll parent).
 * Uses ref counter for nested modals.
 */
export function useScrollLock(isActive) {
  useEffect(() => {
    if (!isActive) return;
    lock();
    return unlock;
  }, [isActive]);
}
