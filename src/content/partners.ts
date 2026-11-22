export interface PartnerReference {
  slug: string;
  name: string;
}

// A mixed historical reference list supplied by ETC. Individual organizations
// must not be assigned a role or presented as confirmed 2026 sponsors.
export const partners: readonly PartnerReference[] = [
  { slug: 'pwc', name: 'PwC' },
  { slug: 'ey', name: 'EY' },
  { slug: 'onetech', name: 'OneTech' },
  { slug: 'stb-bank', name: 'STB Bank' },
  { slug: 'actia', name: 'ACTIA' },
  { slug: 'talys', name: 'Talys — The House of Digital Experts' },
  { slug: 'deepvolt', name: 'DeepVolt' },
  { slug: 'global-enr', name: 'Global ENR' },
  { slug: 'batteries-nour', name: 'Batteries Nour' },
  { slug: 'managers', name: 'Managers' },
  { slug: 'mnc-aero', name: 'MNC Aero' },
  { slug: 'bako', name: 'BAKO — Driven by sun' },
  { slug: 'elaco', name: 'ELACO Working Space' },
  { slug: 'rse-time', name: 'RSE Time' },
  { slug: 'eagle-tn', name: 'Eagle TN' },
];
