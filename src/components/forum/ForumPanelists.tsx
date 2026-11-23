'use client';

import { useEffect, useId, useRef } from 'react';
import { moderator, panelists } from '@/content/edition';
import './forum-panelists.css';

function PanelistPortrait({ panelist }: { panelist: { name: string; photo: string; frame: readonly [number, number, number, number, number, number] } }) {
  const clip = useId();
  const [width, height, x, y, cropWidth, cropHeight] = panelist.frame;
  return <svg viewBox={`${x} ${y} ${cropWidth} ${cropHeight}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={panelist.name} focusable="false">
    <defs><clipPath id={clip}><rect x={x} y={y} width={cropWidth} height={cropHeight}/></clipPath></defs>
    <image href={'/assets/forum/panelists/'+panelist.photo} width={width} height={height} clipPath={`url(#${clip})`}/>
  </svg>;
}

export function ForumPanelists() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = root.current;
    if (!section || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cards = section.querySelectorAll<HTMLElement>('.ef-panelist');
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) {
        (entry.target as HTMLElement).dataset.visible = 'true';
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    section.dataset.enhanced = 'true';
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return <section id="panelistes" ref={root} className="ef-panelists" aria-labelledby="panelists-title" tabIndex={-1}>
    <div className="ef-wrap">
      <header className="ef-panelists-heading"><div><p className="ef-index">Les panélistes · Édition 2026</p><h2 id="panelists-title">Des regards croisés.<br/><em>Une énergie commune.</em></h2></div><p>Quatre voix pour nourrir les échanges autour de l’énergie, de l’innovation et du développement.</p></header>
      <div className="ef-panelists-grid">
        {panelists.map((panelist, index) => <article key={panelist.name} className="ef-panelist" aria-labelledby={'panelist-'+index}>
          <div className="ef-panelist-portrait"><PanelistPortrait panelist={panelist}/></div>
          <div className="ef-panelist-copy"><p className="ef-panelist-label">Panéliste</p><h3 id={'panelist-'+index}>{panelist.name}</h3><p className="ef-panelist-role" lang="en">{panelist.role}</p></div>
        </article>)}
      </div>
      <article className="ef-moderator" aria-labelledby="moderator-name">
        <div className="ef-moderator-portrait"><PanelistPortrait panelist={moderator}/></div>
        <div className="ef-moderator-copy"><p className="ef-panelist-label">La modératrice · Au cœur du dialogue</p><h3 id="moderator-name">{moderator.name}</h3><p>{moderator.role}</p><a href="#programme">Le panel · 12h10 <span aria-hidden="true">↗</span></a></div>
      </article>
      <div className="ef-panelists-ending"><span>Le dialogue continue, au-delà de la scène.</span><a href="#edition-entreprises">Rencontrer les entreprises <span aria-hidden="true">↓</span></a></div>
    </div>
  </section>;
}
