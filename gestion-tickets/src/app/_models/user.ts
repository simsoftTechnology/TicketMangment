export interface User {
  id: number;
  firstName: any;
  lastName: string;
  numTelephone: string;
  pays: number;
  email: string;
  role: string;
  actif: boolean;
  contrat: boolean;
  dateDebut?: Date;
  dateFin?: Date;
  selected?: boolean;
  token: string;
  societeId?: number; // Add this optional property
}
