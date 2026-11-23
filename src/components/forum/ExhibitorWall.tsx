import { exhibitors } from '@/content/edition';

import { EditionLogo } from './EditionArtworkViewer';

export function ExhibitorWall() {
  return <div className="ef-wrap ef-exhibitor-wall">
    <div className="ef-wall-caption"><span>Le Forum, côté rencontres</span><span>25 novembre · ENSTAB</span></div>
    <div className="ef-wall-composition"><aside className="ef-wall-intro"><span className="ef-wall-total" aria-hidden="true">11<span>entreprises</span></span><h3>Un premier échange.<br/><em>Et la suite à écrire.</em></h3><p>Découvrez les exposants, préparez vos questions et venez à leur rencontre.</p><a className="ef-wall-register" href="https://www.volunteery.tn/listing/event/166" target="_blank" rel="noreferrer">Je serai au rendez-vous</a><span className="ef-wall-location">Borj Cédria, Tunisie<br/>9e édition du Forum ENSTAB</span></aside>
    <ul className="ef-logo-wall" aria-label="Les onze exposants du Forum">
      {exhibitors.map(([name, slug], index) => {
        return <li key={slug}><a className="ef-logo-tile" href={'/assets/forum/edition-2026/'+slug+'.png'} data-edition-art={slug} aria-haspopup="dialog" aria-label={name+' — voir le logo en grand'}>
          <span className="ef-logo-order" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><span className="ef-logo-window" data-company={slug}><EditionLogo slug={slug}/></span>
          <span className="ef-logo-name">{name}</span><span className="ef-logo-detail" aria-hidden="true">Voir en grand</span>
        </a></li>;
      })}

    </ul></div>
    <div className="ef-wall-footnote"><span>Des rencontres réelles. De nouvelles perspectives.</span><span>Meet. Network. Connect.</span></div>
  </div>;
}
