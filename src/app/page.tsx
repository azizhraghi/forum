import type { Metadata } from 'next';
import { ForumCountdown } from '@/components/forum/ForumCountdown';
import { ForumStory } from '@/components/forum/ForumStory';
import { ForumRoute } from '@/components/forum/ForumRoute';
import { ForumContinuation } from '@/components/forum/ForumContinuation';
import { ForumGallery } from '@/components/forum/ForumGallery';
import { ForumLineup } from '@/components/forum/ForumLineup';
import { ForumProgramme } from '@/components/forum/ForumProgramme';
import { enstab } from '@/content/enstab';
import { forum } from '@/content/forum';
import { site } from '@/content/site';
import './forum.css';
import '@/components/forum/forum-continuation.css';
import '@/components/forum/forum-programme.css';

const poster = '/assets/forum/official-poster.jpg';

export const metadata: Metadata = {
  title: 'Forum ENSTAB 2026 — Energy Sovereignty in Action',
  description:
    'Le 9e Forum ENSTAB explore la souveraineté énergétique. Rendez-vous le 25 novembre 2026 à l’ENSTAB, Borj Cédria.',
};

export default function ForumPage() {
  return (
    <div className="ef-page ef-edition" data-forum-preview="true">
      <a className="skip" href="#forum-main">
        Aller au contenu
      </a>
      <header className="ef-header">
        <div className="ef-wrap ef-header-inner">
          <a href="#forum-main" className="ef-wordmark">
            FORUM <strong>ENSTAB</strong>
            <sup>09</sup>
          </a>
          <nav className="ef-direct-nav" aria-label="Accès directs">
            <a href="#invites">Invités</a>
            <a href="#panelistes">Panélistes</a>
            <a href="#programme">Programme</a>
            <a href="#edition-entreprises">Entreprises</a>
            <a className="ef-header-cta" href={forum.registrationUrl!} target="_blank" rel="noreferrer">
              S’inscrire <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      </header>
      <main id="forum-main" tabIndex={-1}>
        <ForumStory preview={true} />
        <ForumContinuation>
          <ForumLineup />
          <section id="film" tabIndex={-1} className="ef-film" aria-labelledby="forum-film-title">
            <div className="ef-wrap ef-film-inner">
              <div className="ef-film-heading">
                <div>
                  <h2 id="forum-film-title">
                    Le Forum <em>en photos.</em>
                  </h2>
                </div>
                <nav id="film-archives" className="ef-archive-nav" aria-label="Archives du Forum">
                  <a href="#rencontres">
                    Revenir au film <span aria-hidden="true">↑</span>
                  </a>
                </nav>
              </div>
              <div className="ef-archive-spread">
                <ForumGallery />
              </div>
              <a href="#programme" className="ef-story-handoff">
                <span>
                  Préparer ma journée <b aria-hidden="true">↘</b>
                </span>
              </a>
            </div>
          </section>

          <ForumProgramme />

          <section
            id="participer"
            tabIndex={-1}
            className="ef-visit ef-destination"
            data-chapter="arrival"
            aria-labelledby="forum-visit-title"
          >
            <div className="ef-destination-backdrop" aria-hidden="true">
              <img src={enstab.aerial} alt="" width="1440" height="810" loading="lazy" />
              <div className="ef-campus-pin">
                <b>ENSTAB</b>
                <small>Borj Cédria</small>
              </div>
              <span className="ef-destination-coordinates">36.70723° N / 10.42673° E</span>
            </div>
            <div className="ef-wrap ef-visit-inner">
              <div className="ef-destination-title">
                <p className="ef-index">Infos pratiques</p>
                <h2 id="forum-visit-title">
                  Rendez-vous
                  <br />
                  <em>à l’ENSTAB.</em>
                </h2>
              </div>
              <div className="ef-arrival-ticket">
                <div className="ef-ticket-heading">
                  <img src="/assets/forum/forum-cube.webp" alt="" width="40" height="45" />
                  <span>
                    Forum ENSTAB
                    <br />
                    <b>9e édition · 2026</b>
                  </span>
                </div>
                <p className="ef-ticket-date">
                  <span>25</span> novembre
                </p>
                <p className="ef-ticket-place">ENSTAB / Borj Cédria</p>
                <dl className="ef-details">
                  <div>
                    <dt>Quand</dt>
                    <dd>
                      <time dateTime={forum.date}>{forum.dateLabel}</time>
                    </dd>
                  </div>
                  <div>
                    <dt>Où</dt>
                    <dd>
                      {forum.venue} · {forum.locality}
                    </dd>
                  </div>
                  <div>
                    <dt>Programme</dt>
                    <dd><a href="#programme">Consulter le programme ↗</a></dd>
                  </div>
                </dl>
                <ForumCountdown />
                <div className="ef-visit-actions">
                  {forum.registrationUrl && (
                    <a
                      className="ef-primary ef-register"
                      href={forum.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      S’inscrire au Forum <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  <a
                    className="ef-outline"
                    href={enstab.directions}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Itinéraire <span aria-hidden="true">↗</span>
                  </a>
                </div>
                <a className="ef-poster" href={poster} target="_blank" rel="noreferrer">
                  <img
                    src={poster}
                    alt="Affiche officielle du 9e Forum ENSTAB"
                    width="1080"
                    height="1350"
                    loading="lazy"
                  />
                  <span>
                    Ouvrir l’affiche officielle <span aria-hidden="true">↗</span>
                  </span>
                </a>
              </div>
            </div>
            <div className="ef-wrap ef-destination-ending">
              <span>Forum ENSTAB · 9e édition</span>
              <a href="#forum-main">Revenir au début ↑</a>
            </div>
          </section>
        </ForumContinuation>
      </main>
      <ForumRoute preview={true} />
      <footer className="ef-footer">
        <div className="ef-wrap">
          <span className="ef-footer-brand">
            <img src="/assets/logo-white.png" width="55" height="34" alt="" /> ETC Junior Entreprise
          </span>
          <a href={`mailto:${site.email}?subject=Forum%20ENSTAB%202026`}>Contacter ETC ↗</a>
          <span>Forum ENSTAB · 2026</span>
        </div>
      </footer>
    </div>
  );
}
