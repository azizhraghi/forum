'use client';

import { useEffect, useRef, useState } from 'react';
import './forum-inline-film.css';

const source = '/assets/forum/forum-film.mp4';
const start = 8;

export function ForumInlineFilm() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const prepare = useRef<() => void>(() => {});
  const manual = useRef(false);
  const userPaused = useRef(false);
  const blocked = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const player = video.current;
    const element = section.current;
    const story = element?.closest<HTMLElement>('.ef-filmstory');
    if (!player || !element || !story) return;
    let inView = false;
    let pending = false;
    let disposed = false;
    function load() {
      if (!player || player.hasAttribute('src')) return;
      player.preload = 'auto';
      player.src = `${source}#t=${start}`;
      player.currentTime = start;
    }
    prepare.current = load;
    function update() {
      if (disposed || !story || !player) return;
      const cinematic = story.dataset.enhanced === 'true';
      const phase = story.dataset.film;
      if (cinematic && (phase === 'warm' || phase === 'active')) load();
      const permitted =
        inView && !document.hidden && (cinematic ? phase === 'active' : manual.current);
      if (!permitted) {
        player.pause();
        return;
      }
      if (userPaused.current || blocked.current || pending || !player.paused || player.ended)
        return;
      pending = true;
      player
        .play()
        .catch((error: DOMException) => {
          if (error.name !== 'AbortError') blocked.current = true;
        })
        .finally(() => {
          pending = false;
          update();
        });
    }
    const viewport = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.3;
        update();
      },
      { threshold: [0, 0.3] },
    );
    viewport.observe(element);
    const phase = new MutationObserver(update);
    phase.observe(story, { attributes: true, attributeFilter: ['data-film', 'data-enhanced'] });
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      disposed = true;
      viewport.disconnect();
      phase.disconnect();
      document.removeEventListener('visibilitychange', update);
      player.pause();
    };
  }, []);

  function startPlayback(sound = false) {
    const player = video.current;
    if (!player) return;
    manual.current = true;
    userPaused.current = false;
    blocked.current = false;
    prepare.current();
    if (player.ended) player.currentTime = start;
    if (sound) player.muted = false;
    player.play().catch(() => {
      if (player.error) setFailed(true);
    });
  }

  function reveal(player: HTMLVideoElement) {
    if (!player.seeking && player.currentTime >= start && player.readyState >= 2) {
      player.dataset.frame = 'ready';
    }
  }

  return (
    <section
      ref={section}
      id="rencontres"
      tabIndex={-1}
      className="ef-inline-film"
      aria-labelledby="inline-film-title"
    >
      <div className="ef-inline-media">
        <img
          src="/assets/forum/forum-film-008.webp"
          alt=""
          width="1120"
          height="630"
          loading="lazy"
        />
        <video
          ref={video}
          muted
          playsInline
          preload="none"
          poster="/assets/forum/forum-film-008.webp"
          aria-label="Film d’une édition précédente du Forum ENSTAB"
          onPlaying={({ currentTarget }) => {
            setPlaying(true);
            reveal(currentTarget);
          }}
          onSeeked={({ currentTarget }) => reveal(currentTarget)}
          onTimeUpdate={({ currentTarget }) => reveal(currentTarget)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onVolumeChange={({ currentTarget }) => setMuted(currentTarget.muted)}
          onError={({ currentTarget }) => {
            delete currentTarget.dataset.frame;
            setFailed(true);
          }}
        />
      </div>
      <div className="ef-wrap ef-inline-copy">
        <span id="preview-campus" data-inline-alias="preview-campus" tabIndex={-1} />
        <span id="preview-audience" data-inline-alias="preview-audience" tabIndex={-1} />
        <span id="preview-film" data-inline-alias="preview-film" tabIndex={-1} />
        <p className="ef-story-label">Archives du Forum ENSTAB</p>
        <h2 id="inline-film-title">Le Forum de l’intérieur.</h2>
        <div className="ef-inline-controls">
          {failed ? (
            <span role="status">Le film ne se charge pas.</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (playing) {
                    userPaused.current = true;
                    video.current?.pause();
                  } else startPlayback();
                }}
              >
                {playing ? 'Mettre en pause' : 'Lire le film'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const player = video.current;
                  if (!player) return;
                  if (player.muted) {
                    if (playing || userPaused.current) player.muted = false;
                    else startPlayback(true);
                  } else player.muted = true;
                }}
              >
                {muted ? 'Activer le son' : 'Couper le son'}
              </button>
            </>
          )}
          <a href={source}>Film depuis le début ↗</a>
        </div>
        <div className="ef-inline-next">
          <a href="#teaser">La prochaine édition ↓</a>
          <a href="#photos">Voir les photos ↓</a>
          <a href="#programme">Préparer ma journée ↘</a>
        </div>
      </div>
    </section>
  );
}
