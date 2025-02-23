export interface Contrat {
  id: number;
  dateDebut: Date;
  dateFin?: Date;
  type: string;
  typeContrat: string;
  societePartenaireId?: number;
  clientId?: number;
}
