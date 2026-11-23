import { forum } from '@/content/forum';
import { enstab } from '@/content/enstab';
import { programme, workshop } from '@/content/programme';
import { ProgrammeTimeline } from './ProgrammeTimeline';

export function ForumProgramme() {
  return (
    <>
      <section id="programme" tabIndex={-1} className="ef-programme" aria-labelledby="forum-programme-title">
        <div className="ef-wrap ef-programme-masthead">
          <p className="ef-index">Le programme · 9e édition</p>
          <span>25.11.2026 <span aria-hidden="true">/</span> ENSTAB</span>
        </div>
        <div className="ef-wrap ef-programme-inner">
          <div className="ef-programme-intro">
            <h2 id="forum-programme-title">Une journée.<br /><em>Des possibles.</em></h2>
            <p className="ef-programme-deck">Se rencontrer. Partager les idées.<br />Leur donner une suite.</p>
            <div className="ef-programme-place">
              <img src={enstab.aerial} width="1440" height="810" alt="" loading="lazy" />
              <div className="ef-programme-date"><time dateTime={forum.date}><b>25</b><span>novembre<br />2026</span></time><p>ENSTAB · Borj Cédria<br /><span>Accueil dès 08h00</span></p></div>
            </div>
            <div className="ef-programme-actions">
              <a href="/assets/forum/programme/programme-officiel.png" target="_blank" rel="noreferrer">Programme officiel ↗</a>
              <a href="/assets/forum/forum-enstab.ics" download>Ajouter au calendrier ↓</a>
              <a href="#formation">La formation GOMYCODE ↓</a>
            </div>
          </div>
          <ProgrammeTimeline>
            <ol className="ef-agenda" aria-label="Programme du 25 novembre">
            {programme.map((item, index) => (
              <li key={item.time} className={item.time === '14:00' ? 'ef-agenda-workshop' : undefined}>
                <div className="ef-agenda-hour"><span>{Number(item.time.slice(0, 2)) < 12 ? 'Matin' : 'Après-midi'}</span><time dateTime={`${forum.date}T${item.time}:00+01:00`}>{item.time.replace(':', 'h')}</time></div>
                <div className="ef-agenda-session">
                  <span className="ef-agenda-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  {item.time === '14:00' && <span className="ef-agenda-tag">Formation · GOMYCODE</span>}
                  <h3>{item.title}</h3>
                  {'detail' in item && <p>{item.detail}</p>}
                  {'href' in item && <a href={item.href}>{item.link} <span aria-hidden="true">↗</span></a>}
                </div>
              </li>
            ))}
            </ol>
            <a className="ef-programme-handoff" href="#formation">Et si vous passiez à la pratique ? <span aria-hidden="true">↓</span></a>
          </ProgrammeTimeline>
        </div>
      </section>
      <section id="formation" tabIndex={-1} className="ef-workshop" aria-labelledby="forum-workshop-title">
        <div className="ef-wrap ef-workshop-inner">
          <div className="ef-workshop-copy">
            <p className="ef-index">Formation · GOMYCODE × ETC</p>
            <p className="ef-workshop-kicker">De l’idée à la pratique.</p>
            <h2 id="forum-workshop-title" lang="en">Generative AI<br /><em>for Data Analytics.</em></h2>
            <p className="ef-workshop-trainer">Avec <strong>{workshop.instructor}</strong><br />Instructrice GOMYCODE</p>
            <dl className="ef-workshop-facts">
              <div><dt>Quand</dt><dd><time dateTime="2026-11-25T14:00:00+01:00">25 novembre · 14h00</time></dd></div>
              <div><dt>Où</dt><dd>ENSTAB · Borj Cédria</dd></div>
            </dl>
            <a className="ef-primary ef-workshop-register" href={workshop.registrationUrl} target="_blank" rel="noreferrer">S’inscrire à la formation <span aria-hidden="true">↗</span></a>
            <p className="ef-workshop-note">Inscription à la formation via un formulaire dédié.</p>
            <a className="ef-workshop-poster" href="/assets/forum/programme/workshop-gomycode.png" target="_blank" rel="noreferrer">Voir l’affiche de la formation ↗</a>
          </div>
          <figure className="ef-workshop-portrait">
            <svg viewBox="760 825 580 884" role="img" aria-label="Hajer Betabessi, instructrice GOMYCODE">
              <defs><clipPath id="workshop-portrait-crop"><rect x="760" y="825" width="580" height="884" rx="34" /></clipPath></defs>
              <image href="/assets/forum/programme/workshop-gomycode.png" width="1448" height="2048" clipPath="url(#workshop-portrait-crop)" />
            </svg>
            <figcaption><span>GOMYCODE</span><strong>Hajer Betabessi</strong><span>25.11.2026 / 14h00</span></figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
