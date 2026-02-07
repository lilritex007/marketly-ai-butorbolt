import React, { useState, useEffect } from 'react';
import { Circle, Users } from 'lucide-react';

/**
 * LiveActivityStrip – "X vásárló most böngész" social proof.
 * Random szám 5–25, enyhe animáció.
 */
const MIN_VIEWERS = 5;
const MAX_VIEWERS = 25;

function getRandomViewers() {
  return Math.floor(Math.random() * (MAX_VIEWERS - MIN_VIEWERS + 1)) + MIN_VIEWERS;
}

export default function LiveActivityStrip({ className = '' }) {
  const [viewers, setViewers] = useState(() => getRandomViewers());

  useEffect(() => {
    const t = setInterval(() => {
      setViewers((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return Math.max(MIN_VIEWERS, Math.min(MAX_VIEWERS, next));
      });
    }, 4000 + Math.random() * 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`${viewers} vásárló jelenleg böngész`}
    >
      <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500 shrink-0 animate-pulse" aria-hidden />
      <Users className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
      <span>
        <strong className="text-gray-900 font-semibold">{viewers}</strong> vásárló most böngész
      </span>
    </div>
  );
}
