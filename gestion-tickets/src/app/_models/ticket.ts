import { CategorieProbleme } from './categorie-probleme.model';
import { Priorite } from './priorite.model';
import { Projet } from './Projet';
import { Qualification } from './qualification.model';
import { StatutDesTicket } from './statut-des-ticket.model';
import { User } from './user';


export interface Ticket {
  id: number;
  title: string;
  description: string;
  priorityId: number;
  priority?: Priorite;
  statutId: number;
  statut?: StatutDesTicket;
  createdAt: Date;
  updatedAt?: Date;
  ownerId: number;
  owner?: User;
  problemCategoryId: number;
  problemCategory?: CategorieProbleme;
  qualificationId: number;
  qualification?: Qualification;
  attachments?: string;
  attachmentBase64?: string;
  attachmentFileName?: string;
  projetId: number;
  projet?: Projet;
  selected?: boolean;
  responsibleId?: number;
  responsible?: User;
  reasonRejection?: string; 
  approvedAt?: Date;
  solvedAt?: Date;

  completionComment?: string;
  hoursSpent?: number;
  finishedAt?: Date;
}
