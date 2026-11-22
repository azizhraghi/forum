'use client';

import { useId, useRef, useState } from 'react';
import './forum-gallery.css';

const photos = [
  {
    src: '/assets/event-23-1.jpg',
    label: 'L’équipe',
    alt: 'Intervenants et organisateurs sur la scène du Forum ENSTAB',
  },
  {
    src: '/assets/event-23-2.jpg',
    label: 'La table ronde',
    alt: 'Les intervenants réunis pour la table ronde du Forum ENSTAB',
  },
  {
    src: '/assets/event-23-3.jpg',
    label: 'Le public',
    alt: 'Le public réuni dans l’amphithéâtre du Forum ENSTAB',
  },
];

export function ForumGallery() {
  const titleId = useId();
  const dialogTitleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [photo, setPhoto] = useState(0);
  const current = photos[photo];

  function advance(offset: number) {
    setPhoto((index) => (index + offset + photos.length) % photos.length);
  }

  return (
    <section id="photos" className="forum-photos" aria-labelledby={titleId}>
      <div className="forum-photos-summary">
        <p className="forum-photos-edition">8e édition · Galerie</p>
        <h3 id={titleId} lang="en">
          Open Innovation in Action
        </h3>
        <div className="forum-photos-thumbnails" role="group" aria-label="Choisir une photo">
          {photos.map(({ src, label }, index) => (
            <button
              key={src}
              type="button"
              aria-pressed={photo === index}
              onClick={() => setPhoto(index)}
            >
              <img src={src} alt="" loading="lazy" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <figure className="forum-photos-preview">
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          aria-haspopup="dialog"
          aria-label="Voir les moments forts en grand"
        >
          <img src={current.src} alt={current.alt} loading="lazy" />
          <span>
            Voir en grand <span aria-hidden="true">↗</span>
          </span>
        </button>
        <figcaption aria-live="polite">
          {current.label}{' '}
          <span>
            {photo + 1} / {photos.length}
          </span>
        </figcaption>
      </figure>

      <dialog
        ref={dialog}
        className="forum-lightbox"
        aria-labelledby={dialogTitleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          advance(event.key === 'ArrowRight' ? 1 : -1);
        }}
      >
        <div className="forum-lightbox-content">
          <header>
            <h2 id={dialogTitleId}>Photos du Forum</h2>
            <form method="dialog">
              <button type="submit" autoFocus aria-label="Fermer la galerie">
                ×
              </button>
            </form>
          </header>
          <div className="forum-lightbox-stage">
            <img src={current.src} alt={current.alt} />
            <button
              type="button"
              className="forum-lightbox-prev"
              aria-label="Photo précédente"
              onClick={() => advance(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="forum-lightbox-next"
              aria-label="Photo suivante"
              onClick={() => advance(1)}
            >
              →
            </button>
          </div>
          <p className="forum-lightbox-caption" aria-live="polite">
            {current.label}{' '}
            <span>
              {photo + 1} / {photos.length}
            </span>
          </p>
        </div>
      </dialog>
    </section>
  );
}
