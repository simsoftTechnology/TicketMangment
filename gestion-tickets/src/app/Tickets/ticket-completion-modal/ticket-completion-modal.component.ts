import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FinishTicketDto } from '../../_models/finish-ticket-dto';
import { LoaderService } from '../../_services/loader.service';
import { FinishTicketForm } from 'src/app/_models/finish-ticket-form';

@Component({
  selector: 'app-ticket-completion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-completion-modal.component.html',
  styleUrls: ['./ticket-completion-modal.component.css']
})
export class TicketCompletionModalComponent {
  @Input() ticket: any;
  @Output() finished = new EventEmitter<FinishTicketDto>();
  @Output() closed = new EventEmitter<void>();

  finishData: FinishTicketForm = {
    isResolved:    true,
    comment:       '',
    duration:      0,
    durationUnit: 'hours',
    completionDate: new Date()
  };

  formSubmitted: boolean = false;
  isLoading: boolean = false; // Nouvel attribut pour le loader

  constructor(private loaderService: LoaderService) {
    // Souscrire aux changements d’état de chargement
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
  
  onSubmit(form: NgForm): void {
    this.formSubmitted = true;
    if (form.invalid) return;
  
    // Mise à jour de la date de fin
    this.finishData.completionDate = new Date();
  
    // Conversion en minutes
    const totalMinutes = this.finishData.durationUnit === 'hours'
      ? this.finishData.duration * 60
      : this.finishData.duration;
  
    // 💥 Le bon payload
    const payload: FinishTicketDto = {
      isResolved:        this.finishData.isResolved,
      comment:           this.finishData.comment,
      durationInMinutes: totalMinutes,
      completionDate:    this.finishData.completionDate
    };
  
    this.loaderService.showLoader();
  
    // Ici on émet bien le `payload`, pas finishData
    this.finished.emit(payload);
    
   
  }
  
  

  onClose(): void {
    // Empêcher la fermeture si l'opération est en cours
    if (!this.isLoading) {
      this.closed.emit();
    }
  }

  onIsResolvedChange(): void {
    // Réinitialiser le flag de soumission pour masquer les messages d'erreur
    this.formSubmitted = false;
    // Si le ticket est marqué comme résolu, vider le commentaire
    if (this.finishData.isResolved) {
      this.finishData.comment = '';
    }
  }
}