import { useSyncExternalStore } from 'react';

/** Közös scroll store – egy listener, rAF throttling, passive */
let scrollY = 0;
let scrollPercent = 0;
let scrollHeight = 0;
let snapshot = { scrollY: 0, scrollPercent: 0, scrollHeight: 0 };
const listeners = new Set();
let rafId = null;

function getScrollData() {
  if (typeof window === 'undefined') return { scrollY: 0, scrollPercent: 0, scrollHeight: 0 };
  const y = window.pageYOffset ?? document.documentElement.scrollTop ?? 0;
  const sh = Math.max(0, document.documentElement.scrollHeight - (window.innerHeight ?? document.documentElement.clientHeight));
  const pct = sh > 0 ? Math.min(100, (y / sh) * 100) : 0;
  return { scrollY: y, scrollPercent: pct, scrollHeight: sh };
}

function notify() {
  const data = getScrollData();
  if (data.scrollY === scrollY && data.scrollPercent === scrollPercent) return;
  scrollY = data.scrollY;
  scrollPercent = data.scrollPercent;
  scrollHeight = data.scrollHeight;
  snapshot = { scrollY, scrollPercent, scrollHeight };
  listeners.forEach((fn) => fn());
}

function onScroll() {
  if (rafId != null) return;
  rafId = requestAnimationFrame(() => {
    notify();
    rafId = null;
  });
}

function subscribe(listener) {
  if (listeners.size === 0) {
    window.addEventListener('scroll', onScroll, { passive: true });
    notify();
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('scroll', onScroll);
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return { scrollY: 0, scrollPercent: 0, scrollHeight: 0 };
}

/**
 * useScrollPosition - Egyetlen közös scroll listener, rAF throttling.
 * Használat: ScrollProgress, BackToTop, Navbar, SmartNewsletterPopup, StickyAddToCart
 */
export function useScrollPosition() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** scrollY > threshold (pl. 20, 400) */
export function useScrollPastY(threshold) {
  const { scrollY: y } = useScrollPosition();
  return y > threshold;
}

/** scrollPercent > threshold (pl. 30, 70) */
export function useScrollPastPercent(threshold) {
  const { scrollPercent: pct } = useScrollPosition();
  return pct > threshold;
}
