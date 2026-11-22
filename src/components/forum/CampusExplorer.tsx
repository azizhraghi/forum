'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { enstab } from '@/content/enstab';
import type { CampusView, mountCampus } from './campus-scene';

const chapters = [
  { id: 'arrival', name: 'Arrivée', view: 'arrival' },
  { id: 'court', name: 'Le parvis', view: 'close' },
  { id: 'archive', name: 'Les archives', view: 'lab' },
  { id: 'access', name: 'Accès', view: 'top' },
] as const satisfies readonly { id: string; name: string; view: CampusView }[];
type Chapter = (typeof chapters)[number]['id'];
const anchor = (chapter: Chapter) => `forum-${chapter}`;

export function CampusExplorer({ intro }: { intro: ReactNode }) {
  const [chapter, setChapter] = useState<Chapter>('arrival');
  const [mapOpen, setMapOpen] = useState(false);
  const [sceneStatus, setSceneStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const route = useRef<HTMLElement>(null);
  const story = useRef<HTMLDivElement>(null);
  const api = useRef<ReturnType<typeof mountCampus> | null>(null);
  const mapShown = chapter === 'access' && mapOpen;
  const current = chapters.find((item) => item.id === chapter) ?? chapters[0];

  useEffect(() => {
    const canvasHost = host.current;
    if (!canvasHost) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('./campus-scene')
      .then(({ mountCampus }) => {
        if (disposed) return;
        api.current = mountCampus(canvasHost);
        const canvas = canvasHost.querySelector('canvas');
        const loseContext = () => setSceneStatus('fallback');
        canvas?.addEventListener('webglcontextlost', loseContext);
        cleanup = () => canvas?.removeEventListener('webglcontextlost', loseContext);
        setSceneStatus('ready');
      })
      .catch(() => {
        if (!disposed) setSceneStatus('fallback');
      });
    return () => {
      disposed = true;
      cleanup?.();
      api.current?.dispose();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    const visual = stage.current;
    const timeline = story.current;
    if (!visual || !timeline) return;
    const stops = [...timeline.querySelectorAll<HTMLElement>('[data-scroll-stop]')];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastShot = '';
    let lastChapter: Chapter | undefined;

    function update() {
      frame = 0;
      if (!visual) return;
      const height = visual.clientHeight;
      const stickyTop = Number.parseFloat(getComputedStyle(visual).top) || 0;
      const eyeLine = stickyTop + height * 0.46;
      const blendRoom = height * 0.22;
      const tops = stops.map((stop) => stop.getBoundingClientRect().top);
      let index = 0;
      for (let i = 1; i < tops.length; i++) {
        if (tops[i] <= eyeLine) index = i;
      }
      const nextChapter = chapters[index].id;
      if (nextChapter !== lastChapter) {
        lastChapter = nextChapter;
        setChapter(nextChapter);
      }

      let from = index;
      let to = index;
      let mix = 0;
      if (index > 0 && tops[index] > eyeLine - blendRoom) {
        from = index - 1;
        mix = (eyeLine + blendRoom - tops[index]) / (2 * blendRoom);
      } else if (index < tops.length - 1 && tops[index + 1] < eyeLine + blendRoom) {
        to = index + 1;
        mix = (eyeLine + blendRoom - tops[to]) / (2 * blendRoom);
      }

      if (motion.matches) {
        from = to = index;
        mix = 0;
      }
      const shot = `${from}:${to}:${Math.round(mix * 300)}`;
      if (shot !== lastShot && sceneStatus === 'ready') {
        api.current?.scrub(chapters[from].view, chapters[to].view, mix);
      }
      lastShot = shot;

      const progress = (from + (to - from) * mix) / (chapters.length - 1);
      route.current?.style.setProperty('--ef-story-progress', String(progress));
      const archive =
        chapters[from].id === 'archive'
          ? from === to
            ? 1
            : 1 - mix
          : chapters[to].id === 'archive'
            ? mix
            : 0;
      visual.style.setProperty('--ef-archive', String(archive));
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    const observer = new ResizeObserver(schedule);
    observer.observe(timeline);
    observer.observe(visual);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, [sceneStatus]);

  return (
    <section
      id="campus"
      className="ef-expedition"
      data-chapter={chapter}
      aria-label="Parcours immersif du Forum ENSTAB"
    >
      <div ref={stage} className="ef-expedition-stage" id="expedition-visual">
        <div className="ef-expedition-visual">
          <div
            ref={host}
            className="ef-expedition-model"
            data-visible={sceneStatus === 'ready' && !mapShown}
          />
          <img
            className="ef-campus-fallback"
            src={enstab.aerial}
            data-visible={sceneStatus !== 'ready' && !mapShown}
            alt=""
            fetchPriority="high"
          />
          <img className="ef-expedition-archive" src="/assets/forum/forum-film.webp" alt="" />
          {mapShown && (
            <iframe
              className="ef-expedition-map"
              title="Carte du campus ENSTAB à Borj Cédria"
              src={enstab.map}
              loading="lazy"
            />
          )}
          <div className="ef-expedition-grade" aria-hidden="true" />
        </div>
        {chapter !== 'arrival' && !mapShown && sceneStatus === 'ready' && (
          <>
            <div className="ef-expedition-zoom" role="group" aria-label="Contrôles de la maquette">
              <button
                type="button"
                aria-label="Agrandir la maquette"
                onClick={() => api.current?.zoom(1.23)}
              >
                +
              </button>
              <button
                type="button"
                aria-label="Réduire la maquette"
                onClick={() => api.current?.zoom(1 / 1.23)}
              >
                −
              </button>
              <button
                type="button"
                aria-label="Recentrer la maquette"
                onClick={() => api.current?.move(current.view)}
              >
                ↺
              </button>
            </div>
            <a
              className="ef-expedition-credit"
              href={enstab.outline}
              target="_blank"
              rel="noreferrer"
            >
              Maquette indicative · © OpenStreetMap
            </a>
          </>
        )}
      </div>

      <nav ref={route} className="ef-expedition-route" aria-label="Étapes du parcours">
        <div className="ef-wrap ef-expedition-route-track">
          {chapters.map(({ id, name }) => (
            <a key={id} href={`#${anchor(id)}`} aria-current={chapter === id ? 'step' : undefined}>
              <i aria-hidden="true" />
              <span>{name}</span>
            </a>
          ))}
        </div>
      </nav>

      <div ref={story} className="ef-expedition-story">
        <article id={anchor('arrival')} data-scroll-stop className="ef-story-stop ef-story-arrival">
          <div className="ef-wrap ef-expedition-body">
            <div className="ef-arrival">
              {intro}
              <a className="ef-expedition-action" href={`#${anchor('court')}`}>
                Défiler pour entrer <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </article>
        <article id={anchor('court')} data-scroll-stop className="ef-story-stop">
          <div className="ef-wrap ef-expedition-body">
            <div className="ef-expedition-panel">
              <h2>
                Le parvis <em>d’ENSTAB.</em>
              </h2>
              <p>
                Le 25 novembre, étudiants, ingénieurs et entreprises se retrouvent ici pour parler
                d’autonomie énergétique.
              </p>
              <a className="ef-story-next" href="/#theme">
                Découvrir le thème du Forum <span aria-hidden="true">↗</span>
              </a>
              {sceneStatus === 'fallback' && (
                <p className="ef-expedition-fallback">
                  Vue aérienne du campus · La maquette 3D est indisponible sur cet appareil.
                </p>
              )}
            </div>
          </div>
        </article>
        <article id={anchor('archive')} data-scroll-stop className="ef-story-stop">
          <div className="ef-wrap ef-expedition-body">
            <div className="ef-expedition-panel">
              <h2>
                Dans les salles <em>du Forum.</em>
              </h2>
              <p>Revivez les rencontres, les stands et les échanges en amphithéâtre.</p>
              <a className="ef-expedition-action" href="/#film">
                Voir le film d’archives <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </article>
        <article id={anchor('access')} data-scroll-stop className="ef-story-stop">
          <div className="ef-wrap ef-expedition-body">
            <div className="ef-expedition-panel">
              <h2>
                Rendez-vous <em>à Borj Cédria.</em>
              </h2>
              <p>ENSTAB · 25 novembre 2026</p>
              <button
                className="ef-expedition-action"
                type="button"
                aria-pressed={mapShown}
                aria-controls="expedition-visual"
                onClick={() => setMapOpen((open) => !open)}
              >
                {mapShown ? 'Revoir la maquette' : 'Ouvrir le plan'}{' '}
                <span aria-hidden="true">↗</span>
              </button>
              <a
                className="ef-expedition-directions"
                href={enstab.directions}
                target="_blank"
                rel="noreferrer"
              >
                Itinéraire ↗
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
