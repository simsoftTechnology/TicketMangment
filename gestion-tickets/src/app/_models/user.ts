import { Contrat } from "./contrat";
import { ProjetMember } from "./projet-member"; // Assurez-vous du bon chemin

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  numTelephone: string;
  pays: string;
  email: string;
  role: 'Super Admin' | 'Chef de Projet' | 'Développeur' | 'Client';
  actif: boolean;
  contrat?: Contrat;
  dateDebut?: Date;
  dateFin?: Date;
  selected?: boolean;
  token: string;
  societeId?: number;
  projetMembers?: ProjetMember[]; // Ajout de la relation aux projets
}
