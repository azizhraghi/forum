'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './forum-route.css';

const visit = { id: 'participer', label: 'Préparer ma visite', short: 'Ma visite' };
const storyChapters = [
  { id: 'forum-main', label: 'De la Terre au campus', short: 'Le départ' },
  { id: 'theme', label: 'Souveraineté énergétique', short: 'Le thème' },
  { id: 'rencontres', label: 'Le Forum de l’intérieur', short: 'Le film' },
  { id: 'teaser', label: 'Le teaser de cette édition', short: 'Teaser 2026' },
  { id: 'invites', label: 'Les invités d’honneur', short: 'Invités' },
  { id: 'edition-entreprises', label: 'Les exposants et sponsors 2026', short: 'Édition 2026' },
  { id: 'film', label: 'Le Forum en photos', short: 'Les photos' },
] as const;
const standardChapters = [...storyChapters, visit];
const previewChapters = [
  ...storyChapters,
  { id: 'programme', label: 'Programme du Forum', short: 'Programme' },
  visit,
];

export function ForumRoute({ preview = false }: { preview?: boolean }) {
  const chapters = preview ? previewChapters : standardChapters;
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const story = document.querySelector<HTMLElement>('.ef-filmstory');
    const header = document.querySelector<HTMLElement>('.ef-header');
    let frame = 0;
    function update() {
      frame = 0;
      const readingLine = (header?.getBoundingClientRect().bottom ?? 0) + 28;
      let index = 0;
      if (story?.dataset.enhanced === 'true') {
        index = chapters.findIndex(({ id }) => id === story.dataset.chapter);
        if (index < 0) index = 0;
      } else {
        for (let stop = 1; stop <= 2; stop++) {
          if (
            (document.getElementById(chapters[stop].id)?.getBoundingClientRect().top ?? Infinity) <=
            readingLine
          )
            index = stop;
        }
      }
      for (let stop = 2; stop < chapters.length; stop++) {
        if (
          (document.getElementById(chapters[stop].id)?.getBoundingClientRect().top ?? Infinity) <=
          readingLine
        )
          index = stop;
      }
      setActive(index);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    const observer = new MutationObserver(schedule);
    if (story)
      observer.observe(story, {
        attributes: true,
        attributeFilter: ['data-chapter', 'data-enhanced'],
      });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [chapters]);

  const previous = chapters[active - 1];
  const next = chapters[active + 1];

  return (
    <nav
      className="ef-route"
      aria-label="Chapitres du Forum"
      style={{ '--route-steps': chapters.length } as CSSProperties}
    >
      <div className="ef-route-controls">
        {previous ? (
          <a
            className="ef-route-direction"
            href={`#${previous.id}`}
            aria-label={`Précédent · ${previous.short}`}
          >
            ←
          </a>
        ) : (
          <span className="ef-route-direction" aria-hidden="true">
            ←
          </span>
        )}
        <button className="ef-route-trigger" type="button" popoverTarget="forum-route-menu">
          <span className="ef-route-position">
            {active + 1} / {chapters.length}
          </span>
          <span className="ef-route-current">{chapters[active].short}</span>
          <span className="ef-route-chevron" aria-hidden="true">
            ⌃
          </span>
          <span className="ef-route-progress" aria-hidden="true">
            {chapters.map(({ id }, index) => (
              <i key={id} data-reached={index <= active} />
            ))}
          </span>
        </button>
        {next ? (
          <a className="ef-route-next" href={`#${next.id}`} aria-label={`Suivant · ${next.short}`}>
            <span>{next.short}</span> <span aria-hidden="true">→</span>
          </a>
        ) : (
          <a className="ef-route-next" href="#forum-main">
            <span>Retour au début</span> <span aria-hidden="true">↑</span>
          </a>
        )}
      </div>
      <div className="ef-route-menu" id="forum-route-menu" popover="auto" ref={menu}>
        <p>Parcours du Forum</p>
        <ol>
          {chapters.map(({ id, label }, index) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={index === active ? 'location' : undefined}
                onClick={() => menu.current?.hidePopover()}
              >
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                {label}
                <span aria-hidden="true">{index === active ? '●' : '↗'}</span>
              </a>
            </li>
          ))}
        </ol>
        <div className="ef-route-options">
          <button
            type="button"
            aria-pressed={reduced}
            onClick={() => {
              const nextValue = !reduced;
              setReduced(nextValue);
              window.dispatchEvent(
                new CustomEvent('forum-motion-change', { detail: { reduced: nextValue } }),
              );
            }}
          >
            Réduire les mouvements
          </button>
          <a href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/" target="_blank" rel="noreferrer">
            Imagerie · NASA
          </a>
        </div>
      </div>
    </nav>
  );
}
