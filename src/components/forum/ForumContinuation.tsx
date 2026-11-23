'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Keep native document scrolling and usable server-rendered content throughout the story. */
export function ForumContinuation({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const chapters = [...container.querySelectorAll<HTMLElement>('[data-chapter]')];
    const visible = new Set<HTMLElement>();
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let simplified = false;
    let frame = 0;
    const applied = new Map<HTMLElement, number>();

    function update() {
      frame = 0;
      if (!container) return;
      const reduced = preference.matches || simplified;
      const mode = reduced ? 'reduced' : 'full';
      if (container.dataset.motion !== mode) container.dataset.motion = mode;
      if (reduced) return;
      const positions = [...visible].map((chapter) => ({ chapter, rect: chapter.getBoundingClientRect() }));
      for (const { chapter, rect } of positions) {
        const progress = Math.min(
          1,
          Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height)),
        );
        if (applied.get(chapter) !== progress) {
          chapter.style.setProperty('--chapter-progress', String(progress));
          applied.set(chapter, progress);
        }
      }
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function motionChange(event: Event) {
      simplified = Boolean((event as CustomEvent<{ reduced: boolean }>).detail?.reduced);
      schedule();
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
          else visible.delete(entry.target as HTMLElement);
        }
        schedule();
      },
      { rootMargin: '120px' },
    );
    chapters.forEach((chapter) => observer.observe(chapter));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('forum-motion-change', motionChange);
    preference.addEventListener('change', schedule);
    schedule();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('forum-motion-change', motionChange);
      preference.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <div ref={root} className="ef-continuation">
      {children}
    </div>
  );
}
