'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { enstab } from '@/content/enstab';
import { forum } from '@/content/forum';
import { ForumFilm } from './ForumFilm';
import { ForumInlineFilm } from './ForumInlineFilm';
import './forum-story.css';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const between = (value: number, from: number, to: number) => clamp((value - from) / (to - from));
const media = '/assets/forum/';
const storyChapters = {
  theme: { start: 0.37, landing: 0.64 },
  rencontres: { start: 0.82, landing: 0.94 },
} as const;
const previewLandings = {
  theme: storyChapters.theme.landing,
  'preview-campus': 0.72,
  'preview-audience': 0.81,
  rencontres: 0.98,
  'preview-film': 0.98,
} as const;

function scrub(video: HTMLVideoElement, filename: string) {
  let progress = 0;
  let appliedTime = Number.NaN;
  let requested = false;
  let enabled = false;
  function seek() {
    if (!enabled || video.seeking || !Number.isFinite(video.duration) || video.readyState < 2) return;
    const time = progress * Math.max(0, video.duration - 0.05);
    if (Number.isFinite(appliedTime) && Math.abs(time - appliedTime) < 0.025) return;
    if (Math.abs(video.currentTime - time) > 0.02) {
      appliedTime = time;
      video.currentTime = time;
    }
  }
  function loaded() {
    requested = false;
    seek();
  }
  video.addEventListener('loadeddata', seek);
  video.addEventListener('seeked', seek);
  video.addEventListener('loadedmetadata', loaded);
  return {
    update(next: number, enabledNext: boolean) {
      progress = next;
      enabled = enabledNext;
      if (enabledNext) {
        if (!video.hasAttribute('src')) {
          video.src = media + filename;
          video.preload = 'auto';
          requested = true;
        }
        if (video.readyState < 2 && !requested) {
          video.preload = 'auto';
          video.load();
          requested = true;
        }
        seek();
      }
    },
    dispose() {
      video.removeEventListener('loadeddata', seek);
      video.removeEventListener('seeked', seek);
      video.removeEventListener('loadedmetadata', loaded);
    },
  };
}

function SceneVideo({ player }: { player: React.RefObject<HTMLVideoElement | null> }) {
  return (
    <video
      ref={player}
      muted
      playsInline
      preload="none"
      onLoadedData={({ currentTarget }) => {
        currentTarget.dataset.ready = 'true';
      }}
      onEmptied={({ currentTarget }) => {
        delete currentTarget.dataset.ready;
      }}
      onError={({ currentTarget }) => {
        currentTarget.dataset.failed = 'true';
        delete currentTarget.dataset.ready;
      }}
    />
  );
}

export function ForumStory({ preview = false }: { preview?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const globe = useRef<HTMLVideoElement>(null);
  const previousLayout = useRef<boolean | null>(null);
  const currentChapter = useRef('');

  useEffect(() => {
    const section = root.current;
    const screen = stage.current;
    if (!section || !screen || !player.current || !globe.current) return;
    const campus = scrub(player.current, 'enstab-story-scrub.mp4');
    campus.update(0,true);
    const earth = scrub(globe.current, 'earth-descent-scrub.mp4');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 470px)');
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    const opening = screen.querySelector<HTMLElement>('.ef-story-opening')!;
    const theme = screen.querySelector<HTMLElement>('.ef-story-theme')!;
    const ending = screen.querySelector<HTMLElement>('.ef-story-ending')!;
    const audience = screen.querySelector<HTMLElement>('.ef-story-audience');
    const inlineFilm = screen.querySelector<HTMLElement>('.ef-inline-film');
    const aliases = [...screen.querySelectorAll<HTMLElement>('[data-inline-alias]')];
    const markers = [...section.querySelectorAll<HTMLElement>('[data-story-anchor]')];
    const themeAnchor = section.querySelector<HTMLElement>('[data-story-anchor="theme"]')!;
    const crowdAnchor = section.querySelector<HTMLElement>('[data-story-anchor="rencontres"]');
    let frame = 0;
    let simplified = false;
    let distance = 1, top = 0, sectionTop = 0, screenHeight = 0;
    const applied = new Map<string,number>();
    function geometry(){
      if(!section||!screen)return;
      distance = Math.max(1,section.offsetHeight-screen.offsetHeight);
      screenHeight=screen.offsetHeight;
      top=parseFloat(getComputedStyle(screen).top)||0;
      sectionTop=section.getBoundingClientRect().top+scrollY;
    }

    function update() {
      frame = 0;
      if (!section || !screen) return;
      const full = !(preference.matches || simplified || connection?.saveData);
      if (previousLayout.current !== full) {
        const first = previousLayout.current === null;
        const hash = location.hash.slice(1);
        const film = document.getElementById('film');
        const filmTop = film?.getBoundingClientRect().top ?? Infinity;
        const pastStory = !first && filmTop <= 90;
        const staticChapter =
          (audience ?? inlineFilm) && (audience ?? inlineFilm)!.getBoundingClientRect().top <= 90
            ? 'rencontres'
            : theme.getBoundingClientRect().top <= 90
              ? 'theme'
              : '';
        const restore = first
          ? hash
          : pastStory
            ? ''
            : previousLayout.current
              ? currentChapter.current
              : staticChapter;
        section.dataset.enhanced = String(full);
        theme.id = full ? '' : 'theme';
        if (audience) audience.id = full ? '' : 'rencontres';
        if (inlineFilm) {
          inlineFilm.id = full ? '' : 'rencontres';
          for (const alias of aliases) alias.id = full ? '' : (alias.dataset.inlineAlias ?? '');
          for (const marker of markers) marker.id = full ? (marker.dataset.storyAnchor ?? '') : '';
        }
        themeAnchor.id = full ? 'theme' : '';
        if (crowdAnchor) crowdAnchor.id = full ? 'rencontres' : '';
        previousLayout.current = full;
        geometry();
        if (restore && (first || restore === 'theme' || restore === 'rencontres')) {
          document.getElementById(restore)?.scrollIntoView({ behavior: 'instant' });
        } else if (pastStory && film) {
          window.scrollBy({ top: film.getBoundingClientRect().top - filmTop, behavior: 'instant' });
        }
      }
      if (!full) {
        earth.update(0, false);
        campus.update(0, false);
        opening.inert = theme.inert = ending.inert = false;
        if (audience) audience.inert = false;
        if (inlineFilm) inlineFilm.inert = false;
        section.dataset.film = 'idle';
        return;
      }
      const progress = clamp((scrollY - sectionTop + top) / distance);
      const visibleStory = scrollY + innerHeight > sectionTop && scrollY < sectionTop + distance + screenHeight;
      if(!visibleStory){earth.update(0,false);campus.update(0,false);return;}
      const handoff = between(progress, 0.16, 0.29);
      const regionArrival = between(progress, 0.17, 0.29);
      const campusArrival = between(progress, 0.29, 0.36);
      const crowd = preview ? between(progress, 0.73, 0.81) : between(progress, 0.74, 0.88);
      const values: Record<string, number> = {
        opening: 1 - between(progress, 0.035, 0.16),
        spread: between(progress, 0.04, 0.22),
        earth: 1 - handoff,
        region: regionArrival,
        location: between(progress, 0.095, 0.16),
        shade: between(progress, 0.3, 0.49) * 0.7,
      };
      const push = preview ? between(progress, storyChapters.theme.landing, 0.83) * 0.09 : 0;
      values.scale = 1 + between(progress, 0.29, 0.73) * 0.1 + push;
      values['campus-image'] = campusArrival;
      values.theme = between(progress, 0.33, 0.43) * (1 - between(progress, 0.71, 0.82));
      values.detail = between(progress, 0.51, 0.61);
      values.crowd = crowd;
      values.audience = between(progress, storyChapters.rencontres.start, 0.92);
      if (inlineFilm) {
        const filmReveal = between(progress, 0.8, 0.93);
        values['inline-film'] = filmReveal;
        inlineFilm.inert = progress < 0.9;
        const visible = sectionTop + distance + screenHeight - scrollY > top + screenHeight * 0.3;
        const filmPhase =
          progress >= 0.89 && visible ? 'active' : progress >= 0.62 ? 'warm' : 'idle';
        if (section.dataset.film !== filmPhase) section.dataset.film = filmPhase;
      }
      for (const [index, from] of [storyChapters.theme.start, 0.43, 0.49].entries()) {
        values[`word-${index}`] = between(progress, from, from + 0.075);
      }
      for (const [name, value] of Object.entries(values)) {
        if(applied.get(name)!==value){screen.style.setProperty(`--story-${name}`, String(value));applied.set(name,value);}
      }
      opening.inert = progress >= 0.13;
      theme.inert = progress < storyChapters.theme.start || progress >= 0.79;
      ending.inert = progress < 0.6;
      if (audience) audience.inert = progress < 0.92;
      currentChapter.current =
        (audience || inlineFilm) && progress >= storyChapters.rencontres.start
          ? 'rencontres'
          : progress >= storyChapters.theme.start
            ? 'theme'
            : '';
      if (section.dataset.chapter !== currentChapter.current)
        section.dataset.chapter = currentChapter.current;
      earth.update(between(progress, 0, 0.29), progress < .34);
      const revealEnd = storyChapters.theme.landing;
      const revealFrame = between(revealEnd, 0.24, 0.71);
      const approach =
        preview && progress > revealEnd
          ? revealFrame + (1 - revealFrame) * between(progress, revealEnd, 0.81)
          : between(progress, 0.24, 0.71);
      campus.update(approach, progress > .27 && progress < .94);
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function changeMotion(event: Event) {
      simplified = Boolean((event as CustomEvent<{ reduced: boolean }>).detail?.reduced);
      update();
    }
    const resized=()=>{geometry();schedule();};
    const observer = new ResizeObserver(resized);
    observer.observe(section);
    observer.observe(screen);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resized);
    window.addEventListener('forum-motion-change', changeMotion);
    preference.addEventListener('change', schedule);
    connection?.addEventListener('change', schedule);
    geometry();
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resized);
      window.removeEventListener('forum-motion-change', changeMotion);
      preference.removeEventListener('change', schedule);
      connection?.removeEventListener('change', schedule);
      earth.dispose();
      campus.dispose();
    };
  }, [preview]);

  return (
    <>
      <section
        ref={root}
        className="ef-filmstory"
        data-preview={preview || undefined}
        aria-label="Découvrir le Forum ENSTAB"
      >
        {Object.entries(
          preview
            ? previewLandings
            : {
                theme: storyChapters.theme.landing,
                rencontres: storyChapters.rencontres.landing,
              },
        ).map(([id, landing]) => (
          <div
            key={id}
            className="ef-story-anchor"
            data-story-anchor={id}
            tabIndex={-1}
            style={{ '--anchor-progress': landing } as CSSProperties}
          />
        ))}
        <div ref={stage} className="ef-filmstory-stage">
          <div className="ef-story-footage" aria-hidden="true">
            <img src={enstab.aerial} alt="" width="1440" height="810" />
            <SceneVideo player={player} />
            <div className="ef-story-footage-shade" />
          </div>
          <div className="ef-story-earth" aria-hidden="true">
            <img
              src={media + 'earth-descent.webp'}
              alt=""
              width="960"
              height="720"
              fetchPriority="high"
            />
            <SceneVideo player={globe} />
            <span className="ef-story-earth-label">Méditerranée / Tunisie</span>
          </div>

          <div className="ef-story-opening">
            <div className="ef-wrap ef-story-opening-inner">
              <div className="ef-story-identity">
                <div>
                  <p>9e édition</p>
                  <h1>
                    Forum
                    <br />
                    <strong>ENSTAB</strong>
                  </h1>
                </div>
                <img src="/assets/forum/forum-cube.webp" width="415" height="469" alt="" />
              </div>
              <p className="ef-story-date">
                <time dateTime={forum.date}>{forum.dateLabel}</time>
                <span>
                  Borj Cédria, Tunisie{' '}
                  <a href={enstab.directions}>
                    Itinéraire <span aria-hidden="true">↗</span>
                  </a>
                </span>
              </p>
              <div className="ef-story-actions">
                <a className="ef-primary" href="#theme">
                  Découvrir le Forum <span aria-hidden="true">↓</span>
                </a>
                <a href="#participer">
                  Préparer ma visite <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>

          <div id="theme" className="ef-wrap ef-story-theme" aria-labelledby="story-theme-title">
            <p className="ef-story-label">ENSTAB · Borj Cédria</p>
            <h2 id="story-theme-title" lang="en">
              <span
                className="ef-story-word"
                style={{ '--word': 'var(--story-word-0, 1)' } as CSSProperties}
              >
                Energy
              </span>
              <span
                className="ef-story-word"
                style={{ '--word': 'var(--story-word-1, 1)' } as CSSProperties}
              >
                Sovereignty
              </span>
              <span
                className="ef-story-word"
                style={{ '--word': 'var(--story-word-2, 1)' } as CSSProperties}
              >
                in Action
              </span>
            </h2>
            <div className="ef-story-ending">
              <p>
                Comment la Tunisie peut-elle produire davantage de son énergie et garder ses
                infrastructures en service quand l’approvisionnement est perturbé ? Le Forum réunit
                étudiants, ingénieurs et entreprises autour de ces choix.
              </p>
              <div>
                <a href="#rencontres">
                  {preview ? 'Voir le film' : 'Découvrir le film'} <span aria-hidden="true">↓</span>
                </a>
                <a href="/assets/forum/official-banner.webp">Bannière officielle ↗</a>
              </div>
            </div>
          </div>

          {!preview && (
            <section id="rencontres" className="ef-story-audience" aria-labelledby="memory-title">
              <div className="ef-story-audience-photo">
                <img
                  src="/assets/event-23-3.jpg"
                  alt="Le public d’une édition précédente du Forum ENSTAB"
                  width="1000"
                  height="667"
                  loading="lazy"
                />
              </div>
              <div className="ef-wrap ef-story-audience-copy">
                <p className="ef-story-label">Forum ENSTAB · Édition précédente</p>
                <h2 id="memory-title">
                  Le Forum
                  <br />
                  <em>de l’intérieur.</em>
                </h2>
                <div className="ef-story-audience-actions">
                  <ForumFilm />
                  <a href="#film">
                    Voir les photos <span aria-hidden="true">↓</span>
                  </a>
                </div>
              </div>
            </section>
          )}
          {preview && (
            <>
              <div className="ef-inline-crowd" aria-hidden="true">
                <img src="/assets/event-23-3.jpg" alt="" width="1000" height="667" loading="lazy" />
              </div>
              <ForumInlineFilm />
            </>
          )}
        </div>
      </section>
    </>
  );
}
