'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { programme } from '@/content/programme';

export function ProgrammeTimeline({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const rows = Array.from(element.querySelectorAll<HTMLElement>('.ef-agenda > li'));
    const motionChanged = (event: Event) => {
      element.dataset.motion = (event as CustomEvent<{ reduced: boolean }>).detail?.reduced ? 'reduced' : 'full';
    };
    window.addEventListener('forum-motion-change', motionChanged);
    const visible = new Set<HTMLElement>();
    const arrival = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.arrived = 'true';
        arrival.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    const reading = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
        else visible.delete(entry.target as HTMLElement);
      }
      // Read geometry together, only when a row crosses the reading band.
      const positions = [...visible].map((row) => ({ row, top: row.getBoundingClientRect().top }));
      positions.sort((a, b) => a.top - b.top);
      if (positions.length) setActive(rows.indexOf(positions[0].row));
    }, { rootMargin: '-28% 0px -38% 0px', threshold: 0 });
    rows.forEach((row) => { arrival.observe(row); reading.observe(row); });
    return () => {
      arrival.disconnect();
      reading.disconnect();
      window.removeEventListener('forum-motion-change', motionChanged);
    };
  }, []);

  useEffect(() => {
    root.current?.querySelectorAll<HTMLElement>('.ef-agenda > li').forEach((row, index) => {
      row.dataset.reading = String(index === active);
      row.dataset.passed = String(active !== null && index < active);
    });
  }, [active]);

  return (
    <div className="ef-agenda-panel" ref={root} onFocusCapture={(event) => {
      const row = (event.target as HTMLElement).closest('.ef-agenda > li');
      if (!row || !root.current) return;
      const rows = Array.from(root.current.querySelectorAll('.ef-agenda > li'));
      setActive(rows.indexOf(row));
    }}>
      <div className="ef-agenda-heading">
        <span>Le fil de la journée</span>
        <span>{active === null ? `${String(programme.length).padStart(2, '0')} rendez-vous` : `${String(active + 1).padStart(2, '0')} / ${String(programme.length).padStart(2, '0')}`}</span>
      </div>
      {children}
    </div>
  );
}
