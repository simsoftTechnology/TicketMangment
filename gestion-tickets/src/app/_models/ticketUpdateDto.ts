export interface TicketUpdateDto {
  id: number;
  titre: string;
  description: string;
  priorite: string;
  qualification: string;
  projetId: number;
  categorieProblemeId: number;
  statuts: string;
  attachement?: string;
  developpeurId?: number;
  raisonRejet?: string;
}
