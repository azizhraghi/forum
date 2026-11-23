'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './forum-lineup.css';
import { ExhibitorWall } from './ExhibitorWall';
import { EditionArtworkViewer } from './EditionArtworkViewer';
import { ForumPanelists } from './ForumPanelists';

import { guests, sponsors } from '@/content/edition';
const art = '/assets/forum/edition-2026/';
const number = (i: number) => String(i + 1).padStart(2, '0');

export function ForumLineup() {
  const [guest, setGuest] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const manualGuest = useRef(false);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce), (max-width: 760px)');
    let frame = 0;
    let reduced = false;
    const section = container.querySelector<HTMLElement>('.ef-voices');
    const chapters = ['premiere', 'meeting', 'music-finale'].map((name) =>
      container.querySelector<HTMLElement>('.ef-' + name),
    ).filter((chapter): chapter is HTMLElement => chapter !== null);
    const appliedArrival = new Map<HTMLElement, number>();
    let appliedProgress = -1;

    function update() {
      frame = 0;
      if (!container) return;
      const mode = preference.matches || reduced ? 'reduced' : 'full';
      if (container.dataset.motion !== mode) container.dataset.motion = mode;
      if (!section || preference.matches || reduced) return;
      const bounds = container.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
      // Finish layout reads before changing any styles in the edition story.
      const positions = chapters.map((chapter) => ({ chapter, box: chapter.getBoundingClientRect() }));
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      for (const { chapter, box } of positions) {
        if (box.bottom > 0 && box.top < innerHeight) {
          const arrival = Math.max(0, Math.min(1, (innerHeight - box.top) / (innerHeight * .9)));
          if (appliedArrival.get(chapter) !== arrival) {
            chapter.style.setProperty('--arrival', String(arrival));
            appliedArrival.set(chapter, arrival);
          }
        }
      }
      const progress = Math.max(0, Math.min(1, (90 - rect.top) / Math.max(1, sectionHeight - innerHeight + 90)));

      if (!manualGuest.current) setGuest(Math.min(guests.length - 1, Math.floor(progress * guests.length)));
      if (appliedProgress !== progress) {
        section.style.setProperty('--lineup-journey', String(progress));
        appliedProgress = progress;
      }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    function motion(event: Event) { reduced = Boolean((event as CustomEvent<{reduced:boolean}>).detail?.reduced); schedule(); }
    function resumeScroll(event: Event) {
      if (event instanceof KeyboardEvent && !['PageDown','PageUp','Home','End',' '].includes(event.key)) return;
      manualGuest.current = false;
    }
    addEventListener('wheel', resumeScroll, {passive:true});
    addEventListener('touchmove', resumeScroll, {passive:true});
    addEventListener('keydown', resumeScroll);
    addEventListener('scroll', schedule, {passive:true});
    addEventListener('resize', schedule);
    addEventListener('forum-motion-change', motion);
    preference.addEventListener('change', schedule);
    update();
    return () => { cancelAnimationFrame(frame); removeEventListener('wheel', resumeScroll); removeEventListener('touchmove', resumeScroll); removeEventListener('keydown', resumeScroll); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); removeEventListener('forum-motion-change', motion); preference.removeEventListener('change', schedule); };
  }, []);

  return <EditionArtworkViewer><div ref={root} className="ef-lineup-story" style={{ '--guest-count': guests.length } as CSSProperties}>
    <section id="teaser" className="ef-premiere" aria-labelledby="teaser-title" tabIndex={-1}>
      <div className="ef-wrap ef-premiere-heading"><p className="ef-index">Le prochain chapitre · 25 novembre 2026</p><h2 id="teaser-title">Ce qui nous<br />met en <em>mouvement.</em></h2><a href="#invites">Les voix de cette édition <span aria-hidden="true">↘</span></a></div>
      <div className="ef-premiere-screen"><span className="ef-premiere-side" aria-hidden="true">ENSTAB / 09 — 2026</span><video controls playsInline preload="none" poster="/assets/forum/official-banner.webp" aria-label="Teaser officiel du Forum ENSTAB 2026"><source src="/assets/forum/teaser-2026.mp4" type="video/mp4" /><a href="/assets/forum/teaser-2026.mp4">Ouvrir le teaser</a></video><div className="ef-premiere-caption"><span>01 / Le teaser officiel</span><span>Energy Sovereignty in Action</span></div></div>
    </section>
    <section id="invites" className="ef-voices" aria-labelledby="guests-title" tabIndex={-1}>
      <div className="ef-voices-stage"><div className="ef-voices-progress" aria-hidden="true"><i /></div>
        <div className="ef-wrap ef-voices-top"><p className="ef-index">02 / Les invités d’honneur</p><h2 id="guests-title">L’énergie<br />a des <em>visages.</em></h2><span className="ef-voices-count" aria-hidden="true">{number(guest)}<small> / {String(guests.length).padStart(2,'0')}</small></span></div>
        <div className="ef-wrap ef-voice-composition">
          <div className="ef-campus-medallion" aria-hidden="true"><div className="ef-campus-medallion-image"><img src="/assets/forum/enstab-aerial.webp" alt="" loading="lazy" /><i /></div><span className="ef-campus-coordinate">36.70723° N<br />10.42673° E</span><p>Un lieu.<br /><strong>Des perspectives.</strong></p><span className="ef-campus-location">ENSTAB · Borj Cédria</span><svg viewBox="0 0 300 100"><path d="M0 50 H190 Q220 50 235 30 L265 0" fill="none" stroke="currentColor"/><circle cx="190" cy="50" r="3" fill="currentColor"/></svg></div>
          <div className="ef-portraits">{guests.map(([name,,photo],i)=><div key={name} className="ef-portrait" data-active={guest===i} aria-hidden={guest!==i}><img src={'/assets/forum/guests/'+photo} alt={name} width="680" height="680" loading={i===0?'eager':'lazy'} /></div>)}</div>
          <div className="ef-voice-copy"><span className="ef-voice-org">{guests[guest][3]}</span><h3>{guests[guest][0]}</h3><p lang="en">{guests[guest][1]}</p><div className="ef-voice-arrows"><button type="button" disabled={guest===0} aria-label="Invité précédent" onClick={()=>{manualGuest.current=true;setGuest(guest-1);}}>←</button><span>{number(guest)} / {String(guests.length).padStart(2,'0')}</span><button type="button" disabled={guest===guests.length-1} aria-label="Invité suivant" onClick={()=>{manualGuest.current=true;setGuest(guest+1);}}>→</button></div></div>
        </div>
        <nav className="ef-wrap ef-voice-selector" aria-label="Choisir un invité" onKeyDown={(event)=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();manualGuest.current=true;const next=(guest+(event.key==='ArrowRight'?1:guests.length-1))%guests.length;setGuest(next);(event.currentTarget.children[next] as HTMLButtonElement)?.focus();}}}>{guests.map(([name,,,org],i)=><button key={name} type="button" aria-pressed={guest===i} onClick={()=>{manualGuest.current=true;setGuest(i);}}><img src={"/assets/forum/guests/"+guests[i][2]} alt="" loading="lazy" /><span>{number(i)}</span><strong>{name}</strong><small>{org}</small></button>)}</nav>
        <a className="ef-voices-exit" href="#panelistes">Rencontrer les panélistes <span aria-hidden="true">↓</span></a>
      </div>
    </section>
    <ForumPanelists />
    <section id="edition-entreprises" className="ef-meeting" aria-labelledby="current-title" tabIndex={-1}><div className="ef-meeting-campus" aria-hidden="true"><img src="/assets/forum/enstab-courtyard.webp" alt="" loading="lazy" /></div>
      <div className="ef-wrap ef-meeting-heading"><p className="ef-index">03 / Les entreprises de cette édition</p><h2 id="current-title">De l’autre côté<br />de la <em>rencontre.</em></h2><p>Un échange peut ouvrir une nouvelle voie.<br />Découvrez les onze exposants du Forum.</p></div>
      <ExhibitorWall />
      <div className="ef-wrap ef-allies"><div><p className="ef-index">Ils rendent la rencontre possible</p><h3>Avec le<br /><em>soutien de.</em></h3></div><div className="ef-allies-art">{sponsors.map(([name,slug])=><a key={slug} href={art+slug+'.png'} data-edition-art={slug} aria-haspopup="dialog"><div><img src={art+slug+'.png'} alt={name} loading="lazy" /></div><span>{name} ↗</span></a>)}</div></div>
      <div className="ef-music-finale"><div className="ef-music-staff" aria-hidden="true"><i/><i/><i/><i/><i/></div><div className="ef-wrap ef-music-inner"><div><p className="ef-index">04 / Collaborateur musical</p><h3>Et si l’énergie<br />se faisait <em>entendre.</em></h3><p>Avec Ensta tune.</p></div><a href={art+'ensta-tune.png'} data-edition-art="ensta-tune" aria-haspopup="dialog" aria-label="Ensta tune — voir le logo en grand"><span className="ef-music-art"><img src={art+'ensta-tune.png'} alt="Ensta tune — See life from a different tune" loading="lazy" /></span><span>Voir en grand</span></a></div></div>
      <div className="ef-wrap ef-lineup-outro"><span>Les rencontres de demain commencent ici.</span><a href="#participer">Prendre ma place ↗</a><a href="#film">Dans le rétroviseur ↓</a></div>
    </section>
  </div></EditionArtworkViewer>;
}
