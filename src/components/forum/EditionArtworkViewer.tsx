'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { exhibitors, sponsors } from '@/content/edition';
import { editionArtwork } from '@/content/edition-artwork';
import './edition-artwork-viewer.css';

const entries = [...exhibitors, ...sponsors, ['Ensta tune', 'ensta-tune']];

export function EditionLogo({ slug }: { slug: string }) {
  const clip = useId();
  const [width, height, x, y, cropWidth, cropHeight] = editionArtwork[slug];
  return <svg viewBox={`${x} ${y} ${cropWidth} ${cropHeight}`} aria-hidden="true" focusable="false">
    <defs><clipPath id={clip}><rect x={x} y={y} width={cropWidth} height={cropHeight}/></clipPath></defs>
    <image href={'/assets/forum/edition-2026/'+slug+'.png'} width={width} height={height} clipPath={`url(#${clip})`}/>
  </svg>;
}

export function EditionArtworkViewer({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLAnchorElement | null>(null);
  const title = useId();
  const name = entries.find((entry) => entry[1] === slug)?.[0];
  const category = exhibitors.some((entry) => entry[1] === slug) ? 'Exposant' : slug === 'ensta-tune' ? 'Collaborateur musical' : 'Sponsor';

  useEffect(() => {
    if (!slug) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => { document.body.style.overflow = previous; };
  }, [slug]);

  return <div onClick={(event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>('a[data-edition-art]');
    const next = link?.dataset.editionArt;
    if (!link || !next || !editionArtwork[next]) return;
    event.preventDefault();
    trigger.current = link;
    setSlug(next);
  }}>
    {children}
    <dialog ref={dialog} className="ef-artwork-dialog" aria-labelledby={title}
      onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onClose={() => { setSlug(null); trigger.current?.focus({ preventScroll: true }); }}>
      <div className="ef-artwork-content">
        <header><div><p>{category} · Forum ENSTAB 2026</p><h2 id={title}>{name}</h2></div><form method="dialog"><button autoFocus aria-label="Fermer l’aperçu" type="submit">×</button></form></header>
        <div className="ef-artwork-logo" data-company={slug ?? undefined}>{slug && <EditionLogo slug={slug}/>}</div>
        <footer><span>25 novembre 2026 · ENSTAB</span><span>Borj Cédria</span></footer>
      </div>
    </dialog>
  </div>;
}
