export const site = {
  email: 'etc.contact.je@gmail.com',
  location: 'ENSTAB · Borj Cédria, Tunisie',
} as const;

export const inquiryIntents = [
  'Parler d’un projet',
  'Forum 2026',
  'Devenir partenaire',
  'Sponsoring du Forum 2026',
  'Rejoindre ETC',
] as const;
export type InquiryIntent = (typeof inquiryIntents)[number];
