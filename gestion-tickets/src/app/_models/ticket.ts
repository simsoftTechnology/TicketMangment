import { CategorieProbleme } from './categorie-probleme.model';
import { Projet } from './Projet';
import { User } from './user';


export interface Ticket {
  id: number;
  title: string;
  description: string;
  priorityId: number;
  statutId: number;
  createdAt: Date;
  updatedAt?: Date;
  ownerId: number;
  owner?: User;
  problemCategoryId: number;
  problemCategory?: CategorieProbleme;
  qualificationId: number;
  attachment?: string;
  projetId: number;
  projet?: Projet;
  selected?: boolean;
  responsibleId?: number;
  responsible?: User;
  reasonRejection?: string; // Si nécessaire pour le workflow (ex : raison de rejet)
}
