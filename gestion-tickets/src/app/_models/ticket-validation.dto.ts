export interface TicketValidationDto {
  isAccepted: boolean;
  // Raison du refus (optionnel, obligatoire en cas de refus)
  reason?: string;
  // ID du responsable à assigner (optionnel, si le ticket est accepté)
  responsibleId?: number | null;
}
