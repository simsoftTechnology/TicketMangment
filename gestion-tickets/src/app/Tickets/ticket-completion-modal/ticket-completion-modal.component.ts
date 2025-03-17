import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FinishTicketDto } from '../../_models/finish-ticket-dto';

@Component({
  selector: 'app-ticket-completion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-completion-modal.component.html',
  styleUrls: ['./ticket-completion-modal.component.css']
})
export class TicketCompletionModalComponent {
  @Input() ticket: any; // Adaptez le type à votre modèle Ticket si nécessaire
  @Output() finished = new EventEmitter<FinishTicketDto>();
  @Output() closed = new EventEmitter<void>();

  // Initialisation des données de fin de ticket
  finishData: FinishTicketDto = {
    isResolved: true,
    comment: '',
    hoursSpent: 0,
    completionDate: new Date() // Date initiale qui sera mise à jour lors de la soumission
  };

  // Flag pour suivre si le formulaire a été soumis
  formSubmitted: boolean = false;

  onSubmit(form: NgForm): void {
    this.formSubmitted = true;
    // Si le formulaire n'est pas valide, ne pas émettre l'événement et laisser Angular afficher les erreurs
    if (form.invalid) {
      return;
    }
    // Mettre à jour la date de fin avec la date actuelle au moment de la soumission
    this.finishData.completionDate = new Date();
    this.finished.emit(this.finishData);
  }

  onClose(): void {
    this.closed.emit();
  }

  onIsResolvedChange(): void {
    // Réinitialiser le flag de soumission pour masquer les messages d'erreur
    this.formSubmitted = false;

    // Si le ticket est marqué comme résolu, on peut vider le champ commentaire
    if (this.finishData.isResolved) {
      this.finishData.comment = '';
    }
  }
}