import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Pays } from '../../_models/pays';
import { PaysService } from '../../_services/pays.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OverlayModalService } from '../../_services/overlay-modal.service';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';

@Component({
    selector: 'app-pays',
    imports: [NgFor, NgIf, RouterLink],
    templateUrl: './pays.component.html',
    styleUrls: ['./pays.component.css']
})
export class PaysComponent {
  private paysService = inject(PaysService);
  private router = inject(Router);
  private overlayModalService = inject(OverlayModalService);
  paysList: Pays[] = [];
  selectedFile: File | null = null; // Pour stocker le fichier sélectionné
  selectedPaysId: number | null = null; // ID du pays sélectionné pour l'ajout de la photo

  constructor(
    public route: ActivatedRoute,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.loadPays();
  }

  loadPays() {
    this.paysService.getPays().subscribe({
      next: (pays: Pays[]) => this.paysList = pays,
      error: (err) => console.error('Erreur lors de la récupération des pays', err)
    });
  }  

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null; // Réinitialisez si aucun fichier n'est sélectionné
    }
  }
  
  uploadPhoto(): void {
    if (this.selectedPaysId && this.selectedFile) {
      this.paysService.addPhoto(this.selectedPaysId, this.selectedFile).subscribe({
        next: () => {
          this.toastr.success('Photo ajoutée avec succès !');
          this.loadPays(); // Rafraîchir la liste des pays
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de la photo', err);
          this.toastr.error(err,'Erreur lors de l\'ajout de la photo');
        },
      });
    } else {
      this.toastr.warning('Veuillez sélectionner un pays et un fichier.');
    }
  }

  editPays(idPays: string): void {
    // Logique pour rediriger ou ouvrir un formulaire de modification
    console.log('Modifier le pays avec ID :', idPays);
    // Exemple : Navigation vers une page de modification
    this.router.navigate(['/home/Pays/ModifierPays', idPays]);
  }

  deletePays(idPays: number): void {
    // Remplace la fonction native confirm() par le modal de confirmation
    const modalInstance = this.overlayModalService.open(ConfirmModalComponent);
    modalInstance.message = 'Êtes-vous sûr de vouloir supprimer ce pays ?';

    modalInstance.confirmed.subscribe(() => {
      this.paysService.deletePays(idPays).subscribe({
        next: () => {
          // Met à jour la liste localement après suppression réussie
          this.paysList = this.paysList.filter((p) => p.idPays !== idPays);
          this.toastr.success('Pays supprimé avec succès.');
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Une erreur s\'est produite lors de la suppression du pays.');
        },
      });
      this.overlayModalService.close();
    });

    modalInstance.cancelled.subscribe(() => {
      this.overlayModalService.close();
    });
  }
}
