export interface FinishTicketDto {
  isResolved: boolean;
  comment: string;
  hoursSpent: number;
  completionDate: Date;
}
