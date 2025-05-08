export interface FinishTicketForm {
  isResolved: boolean;
  comment: string;
  duration: number;
  durationUnit: 'hours' | 'minutes';
  completionDate: Date;
}