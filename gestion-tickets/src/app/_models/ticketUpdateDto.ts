export interface TicketUpdateDto {
  id: number;
  title: string;
  description: string;
  priorityId: number;
  qualificationId: number;
  projetId: number;
  problemCategoryId: number;
  statutId: number;
  attachments?: string;
  responsibleId?: number;
  reasonRejection?: string;
}
