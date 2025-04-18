export interface TicketCreateDto {
  title: string;
  description: string;
  qualificationId: number;
  priorityId: number;
  problemCategoryId: number;
  projetId: number;
  ownerId: number;
  attachmentBase64?: string;
  attachmentFileName?: string;
}
