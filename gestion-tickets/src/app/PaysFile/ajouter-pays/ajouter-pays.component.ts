import { Component } from '@angular/core';
import { PaysService } from '../../_services/pays.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ajouter-pays',
  standalone: true,
  imports: [ FormsModule, RouterLink ],
  templateUrl: './ajouter-pays.component.html',
  styleUrl: './ajouter-pays.component.css'
})
export class AjouterPaysComponent {
  nom: string = '';
  selectedFile: File | null = null;

  constructor(private paysService: PaysService, private router: Router) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (!this.nom || !this.selectedFile) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    this.paysService.addPays(this.nom, this.selectedFile).subscribe({
      next: () => {
        this.router.navigate(['/Pays']);
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'ajout du pays.");
      },
    });
  }

}