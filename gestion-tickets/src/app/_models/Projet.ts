import { User } from "./user";

export interface Projet {
  id: number;
  nom: string;
  description?: string;
  societeId: number;
  idPays: number;
  nomSociete?: string;  
  nomPays?: string;    
  selected?: boolean; 
  utilisateurs?: User[];
}
