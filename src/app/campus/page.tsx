import type { Metadata } from 'next';
import Link from 'next/link';
import { CampusExplorer } from '@/components/forum/CampusExplorer';
import '../forum.css';

export const metadata: Metadata = {
  title: 'Visite du campus — Forum ENSTAB 2026',
  description: 'Explorez le campus ENSTAB à Borj Cédria et retrouvez le plan d’accès au Forum.',
};

export default function ForumCampusPage() {
  return (
    <div className="ef-page">
      <a className="skip" href="#campus">
        Aller au parcours
      </a>
      <header className="ef-header">
        <div className="ef-wrap ef-header-inner">
          <Link href="/" className="ef-wordmark">
            ← Forum ENSTAB
          </Link>
          <nav className="ef-direct-nav" aria-label="Accès directs">
            <Link href="/#film">Archives</Link>
            <Link className="ef-header-cta" href="/#participer">
              Infos pratiques
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <CampusExplorer
          intro={
            <>
              <p className="ef-expedition-kicker">Borj Cédria · Forum ENSTAB</p>
              <h1>
                Le campus <em>en 3D</em>
              </h1>
              <p className="ef-tour-intro">
                Du parvis au plan d’accès, faites défiler pour découvrir le lieu du Forum.
              </p>
            </>
          }
        />
        <div className="ef-wrap ef-tour-return">
          <Link href="/">← Revenir au Forum</Link>
        </div>
      </main>
    </div>
  );
}
