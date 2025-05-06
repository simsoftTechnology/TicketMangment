export interface FinishTicketDto {
  isResolved:         boolean;
  comment:            string;
  durationInMinutes:  number;
  completionDate:     Date;
}