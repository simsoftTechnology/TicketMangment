import { CategorieProbleme } from "./categorie-probleme.model";
import { Projet } from "./Projet";
import { User } from "./user";


export interface Ticket {
  id: number;
  titre: string;
  description: string;
  priorite: string;
  statuts: string;
  dateCreation: Date;
  dateModification?: Date;
  utilisateurId: number;
  utilisateur?: User;
  categorieProblemeId: number;
  categorieProbleme?: CategorieProbleme;
  qualification: string;
  attachement?: string; 
  projetId: number;
  projet?: Projet;
  selected?: boolean;
}
