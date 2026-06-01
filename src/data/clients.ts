import { Client } from '../types'

export const initialClients: Client[] = [
  {
    idClient: 'CLI-001',
    raisonSociale: 'La Table d\'Or — Groupe',
    email: 'commandes@latabledoor.fr',
    telephone: '01 42 68 55 00',
    adressesLivraison: [
      { id: 'ADR-001', libelle: 'La Table d\'Or — Paris 8e', rue: '24 rue du Faubourg Saint-Honoré', codePostal: '75008', ville: 'Paris', pays: 'France' },
      { id: 'ADR-002', libelle: 'La Table d\'Or — Lyon 2e', rue: '15 place Bellecour', codePostal: '69002', ville: 'Lyon', pays: 'France' },
      { id: 'ADR-003', libelle: 'La Table d\'Or — Bordeaux', rue: '8 allées de Tourny', codePostal: '33000', ville: 'Bordeaux', pays: 'France' },
    ],
    adrFacturationCentralisee: 'La Table d\'Or — Siège\n24 rue du Faubourg Saint-Honoré\n75008 Paris\nFrance',
    siret: '452 178 965 00012',
    contactPrincipal: 'Marie Fontaine',
  },
  {
    idClient: 'CLI-002',
    raisonSociale: 'Le Bistrot du Marché',
    email: 'contact@bistrotdumarche.fr',
    telephone: '04 72 41 22 10',
    adressesLivraison: [
      { id: 'ADR-004', libelle: 'Le Bistrot du Marché — Lyon', rue: '42 rue Mercière', codePostal: '69002', ville: 'Lyon', pays: 'France' },
    ],
    adrFacturationCentralisee: 'Le Bistrot du Marché\n42 rue Mercière\n69002 Lyon\nFrance',
    siret: '891 234 567 00015',
    contactPrincipal: 'Jean-Pierre Moreau',
  },
]
