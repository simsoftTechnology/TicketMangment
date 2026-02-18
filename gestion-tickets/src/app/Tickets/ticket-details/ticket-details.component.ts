import { Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Ticket } from '../../_models/ticket';
import { TicketService } from '../../_services/ticket.service';
import { AccountService } from '../../_services/account.service';
import { User } from '../../_models/user';
import { Comment as TicketComment } from '../../_models/comment';
import { OverlayModalService } from '../../_services/overlay-modal.service';
import { TicketValidationModalComponent } from '../ticket-validation-modal/ticket-validation-modal.component';
import { forkJoin } from 'rxjs';
import { TicketCompletionModalComponent } from '../ticket-completion-modal/ticket-completion-modal.component';
import { FinishTicketDto } from '../../_models/finish-ticket-dto';
import { ToastrService } from 'ngx-toastr';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { CommentService } from '../../_services/comment.service';
import { LoaderService } from '../../_services/loader.service';
import { GlobalLoaderService } from '../../_services/global-loader.service';
import { NotificationService } from 'src/app/_services/notification.service';
import { AppNotification } from 'src/app/_models/notification';
registerLocaleData(localeFr);

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ],
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss']
})
export class TicketDetailsComponent implements OnInit {
  
 selectedFile: File | undefined = undefined;
  ticket: Ticket | null = null;
  currentUser: User | null = null;
  ticketId!: number;
  developers: User[] = [];

  // Pour la gestion des commentaires
  comments: TicketComment[] = [];
  newComment: string = '';
  historyTab:AppNotification[]=[]
  // Propriété pour stocker le responsable sélectionné
  selectedResponsibleId: number | null = null;
  selectedStatus: number | null = null;

  isLoading: boolean = false;
statutList=[
  {id:1, name:'—'},
  {id:2, name:'Accepté'},
  {id:4, name:'En cours'},
  {id:5, name:'Résolu'},
  {id:6, name:'Non Résolu'},

]
  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private accountService: AccountService,
    private overlayModalService: OverlayModalService,
    private toastr: ToastrService,
    private commentService: CommentService,
    private loaderService: LoaderService,
    private globalLoaderService: GlobalLoaderService,
    private notificationService:NotificationService
  ) {
    this.loaderService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
        // this.accountService.getCurrentUser().subscribe((res)=>console.log("current user",res) );
  }
  ngOnInit(): void {
   
    // Souscrire aux changements de paramètres
    this.route.paramMap.subscribe(paramMap => {
      // Récupère l'ID depuis la route à chaque changement
      this.ticketId = +paramMap.get('id')!;
      // Recharge les données associées au ticket
      this.loadTicket();
      this.loadComments();
    });
  
    // Charge une seule fois la liste des développeurs (si elle ne change pas en fonction de l'ID)
    this.loadDevelopers();
    // Récupère l'utilisateur courant
    this.currentUser = this.getcurrentUser;
  }
  
  get getcurrentUser(): User | null {
  this.currentUser= this.accountService.currentUser() 
    return this.currentUser
  }
  loadTicket(): void {
    this.globalLoaderService.showGlobalLoader();
    this.ticketService.getTicket(this.ticketId).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
        if(ticket && ticket.attachments && ticket.attachments.includes('http://192.168.1.230:8055')){
          this.ticket.attachments=   this.ticket.attachments!.replace('http://192.168.1.230:8055', 'https://support.simsoft.tn:8055');
        }
        // Initialiser le responsable sélectionné avec la valeur actuelle du ticket
        this.selectedResponsibleId = ticket.responsibleId || null;
        this.selectedStatus= ticket.statutId;
        this.getHistory()
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du ticket', err);
        const message = err.error || 'Erreur lors de la récupération du ticket';
        this.toastr.error(message, 'Erreur');
      },
      complete: () => {
        this.globalLoaderService.hideGlobalLoader();
      }
    });
  }  
getHistory(){
  if(this.ticket && this.currentUser){
    this.notificationService.getHistory( this.ticket.ownerId,this.ticket.id ).subscribe((res)=>{
      this.historyTab =res
    })

  }
}
  loadDevelopers(): void {
    forkJoin([
      this.accountService.getUsersByRole('collaborateur'),
      this.accountService.getUsersByRole('chef de projet')
    ]).subscribe({
      next: ([collaborateurs, chefs]) => {
        this.developers = collaborateurs.concat(chefs);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des développeurs et chefs de projets', err);
        const message = err.error || 'Erreur lors du chargement des développeurs';
        this.toastr.error(message, 'Erreur');
      }
    });
  }

  loadComments(): void {
    this.commentService.getCommentsByTicket(this.ticketId).subscribe({
      next: (comments) => {
        this.comments = comments;         
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commentaires', err);
      }
    });
  }

  // File selection handler
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0]; 
    }
  }

  onAddComment(): void {
    if (!this.newComment || this.newComment.trim() === '') return;
    this.loaderService.showLoader();
    this.commentService.addCommentwithAttachement({ contenu: this.newComment, ticketId: this.ticketId, file:  this.selectedFile }).subscribe({
      next: (comment) => {
        this.newComment = '';
        this.comments.push(comment);
        this.loadComments();
        this.loaderService.hideLoader();
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du commentaire', err);
        const message = err.error || 'Erreur lors de l\'ajout du commentaire';
        this.toastr.error(message, 'Erreur');
        this.loaderService.hideLoader();
      }
    });
  }

  // Logique pour afficher le bouton de validation
  canValidateTicket(): boolean {
    if (!this.ticket || !this.currentUser) return false;
    const userRole = this.currentUser.role?.toLowerCase() || '';
    const statusIsDefault = (this.ticket.statut?.name === "—");
    return statusIsDefault && (userRole === 'chef de projet' || userRole === 'super admin');
  }

  // Méthode pour déterminer si l'utilisateur peut terminer ou modifier le responsable
  canFinishTicket(): boolean {
  if (!this.ticket || !this.currentUser) return false;
  const userRole = this.currentUser.role.toLowerCase();
  const statusName = this.ticket.statut?.name?.toLowerCase();
  // Clients cannot finish tickets
  if (userRole === 'client') return false;

  // Block if ticket is in a final/invalid status OR not approved
  const invalidStatuses = ['—',  'résolu', 'non résolu'];
  if ((statusName && invalidStatuses.includes(statusName)) || !this.ticket.approvedAt) {
    return false;
  }
  

  // Permissions: super admin, project manager, or responsible user
  return ['chef de projet', 'super admin'].includes(userRole) ||
         this.ticket.responsibleId === this.currentUser.id;
  }
canReopenTicket(): boolean {
  if (!this.ticket || !this.currentUser) return false;

  const userRole = this.currentUser.role.toLowerCase();
  const statusName = this.ticket.statut?.name?.toLowerCase();

  return (
    userRole !== 'client' &&
    !!statusName &&
    ['chef de projet', 'super admin'].includes(userRole) &&
    ['résolu', 'non résolu'].includes(statusName)
  );
}
ReOpenTicket(){
 
 if(this.ticket){
   this.ticketService.ReOpenTicket( this.ticket.id).subscribe(
    {
     next: () => {
    
      
      if(this.ticket && this.ticket.statut)  { 
        this.ticket.statutId=4; 
        this.ticket.statut.name='En cours'; 
        this.selectedStatus=4
      }
      
      
       this.toastr.success('Ticket reouvert avec succès');
     }
     ,
      error: err => {
        
        this.toastr.error(err.error || 'Erreur lors de la reouverture du ticket', 'Erreur');
           this.loaderService.hideLoader();
             this.overlayModalService.close(); 
      }
   },  )
 }
}
  // Pour garder la même condition pour la mise à jour du responsable
  canUpdateResponsible(): boolean {
    return this.canFinishTicket();
  }


  // Ouvre le modal de validation
  openValidationModal(): void {
    const modalInstance = this.overlayModalService.open(TicketValidationModalComponent);
    modalInstance.ticket = this.ticket;
    modalInstance.validated.subscribe(() => {
      this.handleValidationDone();
      this.overlayModalService.close();
    });
    modalInstance.closed.subscribe(() => {
      this.overlayModalService.close();
    });
  }

  handleValidationDone(): void {
    this.loadTicket();
  }

  // Ouvre le modal de clôture du ticket
  openCompletionModal(): void {
    const modalInstance = this.overlayModalService.open(TicketCompletionModalComponent);
    modalInstance.ticket = this.ticket;
    modalInstance.finished.subscribe((finishData: FinishTicketDto) => {
      
      // Appel à la méthode qui gère la validation et les mises à jour
      this.updateTicketCompletion(finishData);
      this.isLoading = !this.isLoading; 
    },
      (err:Error)=>{this.isLoading = !this.isLoading;});
    modalInstance.closed.subscribe(() => {
      this.overlayModalService.close();
      this.isLoading = !this.isLoading;
    });
  }
  
  

  updateTicketCompletion(finishData: any): void {
    this.ticketService.finishTicket(this.ticket!.id, finishData).subscribe({
      next: () => {
        this.toastr.success('Ticket clôturé avec succès');
        this.loadTicket();
        this.loadComments();
        this.overlayModalService.close(); 
         this.loaderService.hideLoader();
      },
      error: err => {
        console.error('Erreur lors de la clôture du ticket', err);
        const message = err.error || 'Erreur lors de la clôture du ticket';
        this.toastr.error(message, 'Erreur');
           this.loaderService.hideLoader();
             this.overlayModalService.close(); 
      }
    });
  }
  

  // Méthode pour mettre à jour le responsable
  updateResponsible(): void {
    if (!this.ticket || (!this.selectedResponsibleId &&  !this.selectedStatus)) {
      this.toastr.error("1 statut ou responsable non défini", 'Erreur');
      return;
    }
    
   
    this.loaderService.showLoader();
    this.ticketService.updateResponsible(this.ticket.id,   this.selectedResponsibleId ,  this.selectedStatus).subscribe({
      next: () => {
        this.loadTicket();
        this.toastr.success('Ticket mis à jour avec succès');
        this.loaderService.hideLoader();
      },
      error: err => {
     
         
        const message = err || 'Erreur lors de la mise à jour du Ticket';
        this.toastr.error(message, 'Erreur');
        this.loaderService.hideLoader();
      }
    });
  }

  getInitials(firstName?: string, lastName?: string): string {
    // Si aucun prénom/nom, on renvoie juste une chaîne vide
    if (!firstName && !lastName) return '';
  
    let initials = '';
    if (firstName && firstName.length > 0) {
      initials += firstName.charAt(0).toUpperCase();
    }
    if (lastName && lastName.length > 0) {
      initials += lastName.charAt(0).toUpperCase();
    }
    return initials;
  }
  


}