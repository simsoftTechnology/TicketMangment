export interface Contrat {
  id: number;
  dateDebut: Date;
  dateFin?: Date;
  typeContrat: string;
  societePartenaireId?: number;
  clientId?: number;
}
