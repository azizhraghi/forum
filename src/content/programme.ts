export const workshop = {
  title: 'Generative AI for Data Analytics',
  instructor: 'Hajer Betabessi',
  registrationUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScvb0mmPu6JpuWuZXyDjww-9Dh_ID6vry-TrtDX5s_TTDVwcQ/viewform?usp=publish-editor',
} as const;

export const programme = [
  { time: '08:00', title: 'Accueil et check-in' },
  { time: '09:00', title: 'Cérémonie d’ouverture' },
  { time: '09:40', title: 'Financement, innovation et transition énergétique' },
  { time: '10:00', title: 'Exposition des entreprises et posters de projets' },
  { time: '10:40', title: 'Projets et initiatives de coopération', detail: 'Présentation d’AFRICXJOB par Mme Samia Chelbi.' },
  { time: '12:10', title: 'Panel', href: '#panelistes', link: 'Rencontrer les panélistes' },
  { time: '14:00', title: `Atelier « ${workshop.title} »`, detail: 'Avec GOMYCODE · Hajer Betabessi', href: '#formation', link: 'Découvrir la formation' },
  { time: '16:30', title: 'Cérémonie de clôture' },
] as const;
