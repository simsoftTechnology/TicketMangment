import { Projet } from "./Projet";
import { User } from "./user";

export interface Societe {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  selected?: boolean;
  utilisateurs: User[];
  projets: Projet[]; 
  contrat?: any
}
