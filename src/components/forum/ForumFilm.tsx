'use client';

import { useRef, useState } from 'react';
import './forum-film.css';

const source = '/assets/forum/forum-film.mp4';
const startAt = 8;
const excerpt = `${source}#t=${startAt}`;

export function ForumFilm() {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  return (
    <>
      <a
        className="ef-watch-film"
        href={excerpt}
        aria-haspopup="dialog"
        onClick={(event) => {
          const screen = dialog.current;
          const player = video.current;
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            !screen ||
            !player ||
            typeof screen.showModal !== 'function'
          )
            return;
          event.preventDefault();
          screen.showModal();
          player.currentTime = startAt;
          player.play().catch(() => {
            if (player.error) setFailed(true);
          });
        }}
      >
        <span className="ef-watch-icon" aria-hidden="true">
          ▶
        </span>
        <span>
          <strong>Regarder le film</strong>
          <small>Son original · À partir de 0:08</small>
        </span>
      </a>
      <dialog
        className="ef-cinema"
        ref={dialog}
        aria-labelledby="ef-cinema-title"
        onClose={() => video.current?.pause()}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="ef-cinema-layout">
          <header className="ef-cinema-header">
            <h2 id="ef-cinema-title">Le film du Forum ENSTAB</h2>
            <form method="dialog">
              <button autoFocus type="submit" aria-label="Fermer le film">
                ×
              </button>
            </form>
          </header>
          <video
            ref={video}
            controls
            playsInline
            preload="none"
            poster="/assets/forum/forum-film-008.webp"
            src={excerpt}
            aria-label="Film d’une édition précédente du Forum ENSTAB"
            onError={() => setFailed(true)}
          />
          <div className="ef-cinema-footer">
            <span role="status">
              {failed ? 'La lecture a échoué.' : 'Édition précédente · Son original'}
            </span>
            <a href={source}>Voir le film depuis le début ↗</a>
          </div>
        </div>
      </dialog>
    </>
  );
}
