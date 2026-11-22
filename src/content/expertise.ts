export type DomainKey = 'energy' | 'embedded';
export interface ExpertiseDomain {
  label: string;
  kicker: string;
  title: readonly [string, string];
  description: string;
  tags: readonly string[];
  inquiryName: string;
}

export const domains: Record<DomainKey, ExpertiseDomain> = {
  energy: {
    label: 'Systèmes énergétiques',
    kicker: 'UNE ÉNERGIE QUI A DU SENS',
    title: ['Penser l’énergie.', 'Construire durablement.'],
    description:
      'Étudier, simuler et optimiser les systèmes énergétiques pour accompagner une gestion plus durable des ressources.',
    tags: [
      'Études énergétiques',
      'Dimensionnement photovoltaïque',
      'Efficacité énergétique',
      'Valorisation des déchets',
    ],
    inquiryName: 'systèmes énergétiques',
  },
  embedded: {
    label: 'Systèmes embarqués',
    kicker: 'L’INTELLIGENCE AU CŒUR DES SYSTÈMES',
    title: ['Connecter les idées.', 'Donner vie aux systèmes.'],
    description:
      'Concevoir et simuler des solutions électroniques et informatiques pour répondre à des besoins concrets, de l’IoT à l’automatisation.',
    tags: [
      'Internet des objets',
      'Circuits électroniques',
      'Capteurs & cartes',
      'Solutions industrielles basées sur l’IA',
    ],
    inquiryName: 'systèmes embarqués',
  },
};
