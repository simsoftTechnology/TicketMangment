import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaysService } from '../../_services/pays.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Pays } from '../../_models/pays';

@Component({
    selector: 'app-modifier-pays',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './modifier-pays.component.html',
    styleUrl: './modifier-pays.component.css'
})
export class ModifierPaysComponent implements OnInit {
  paysForm: FormGroup;
  selectedFile: File | undefined;
  paysId: number | null = null;
  originalPays: Pays | null = null; // Stocker les données originales

  constructor(
    private fb: FormBuilder,
    private paysService: PaysService,
    private router: Router,
    public route: ActivatedRoute
  ) {
    this.paysForm = this.fb.group({
      nom: [''],
      file: [null],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.paysId = +id;
        this.paysService.getPaysById(this.paysId).subscribe((pays: Pays) => {
          this.originalPays = { ...pays }; // Copie des données originales
          this.paysForm.patchValue({
            nom: pays.nom,
          });
        });
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.paysId === null || !this.originalPays) return;
  
    // Détecter les changements
    const hasNomChanged = this.paysForm.value.nom.trim() !== this.originalPays.nom.trim();
    const hasFileChanged = !!this.selectedFile;
  
    // Si aucun changement, ne pas envoyer de requête et rediriger l'utilisateur
    if (!hasNomChanged && !hasFileChanged) {
      this.router.navigate(['/home/Pays']);
      return;
    }
  
    // Toujours inclure le nom, même s'il n'a pas changé
    const paysUpdateDto: any = {
      nom: this.paysForm.value.nom || this.originalPays.nom, // Conserver l'ancien nom si non modifié
    };
  
    // Envoyer le fichier seulement s'il a été modifié
    const fileToSend = hasFileChanged ? this.selectedFile : undefined;
  
    this.paysService.updatePays(this.paysId, paysUpdateDto, fileToSend).subscribe(() => {
      this.router.navigate(['/home/Pays']);
    });
  }
  
  
}