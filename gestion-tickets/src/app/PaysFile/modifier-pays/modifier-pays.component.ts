import { Component, OnInit } from '@angular/core';
import { PaysService } from '../../_services/pays.service';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // Importer Router et ActivatedRoute

@Component({
  selector: 'app-modifier-pays',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './modifier-pays.component.html',
  styleUrl: './modifier-pays.component.css',
})
export class ModifierPaysComponent implements OnInit {
  paysUpdateDto = { nom: '' };
  selectedFile: File | null = null;
  paysId: number | null = null; // Variable pour stocker l'ID du pays

  constructor(
    private paysService: PaysService,
    private router: Router,
    private route: ActivatedRoute // Injecter ActivatedRoute pour accéder aux paramètres de l'URL
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du pays depuis l'URL
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.paysId = +id; // Convertir l'ID en nombre
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.paysId === null) {
      alert("Impossible de mettre à jour : l'ID du pays est introuvable.");
      return;
    }

    if (this.selectedFile) {
      this.paysService.updatePays(this.paysId, this.paysUpdateDto, this.selectedFile).subscribe(() => {
        this.router.navigate(['/Pays']); // Redirection vers /pays après mise à jour
      });
    } else {
      this.paysService.updatePays(this.paysId, this.paysUpdateDto).subscribe(() => {
        this.router.navigate(['/Pays']); // Redirection vers /pays après mise à jour
      });
    }
  }
}
