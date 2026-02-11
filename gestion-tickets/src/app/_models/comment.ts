import { User } from "./user";

export interface Comment {
  id: number;
  contenu: string;
  date: Date;
  utilisateurId: number;
  utilisateur?: User;
  ticketId: number;
  attachement?: string;
}

export interface Commentexport {
  
  contenu: string;
  
  ticketId: number;
  attachmentBase64? :string;
  attachmentFileName? : string;
}