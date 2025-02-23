import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PaysService } from '../../_services/pays.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-ajouter-pays',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink, NgIf], 
  templateUrl: './ajouter-pays.component.html',
  styleUrl: './ajouter-pays.component.css',
})
export class AjouterPaysComponent {
  paysForm: FormGroup;
  selectedFile: File | null = null; // Garde ce nom pour correspondre au HTML

  constructor(private fb: FormBuilder, private paysService: PaysService, private router: Router, 
    public route: ActivatedRoute) {
    this.paysForm = this.fb.group({
      nom: ['', Validators.required],  
      selectedFile: [null, Validators.required] // On garde "selectedFile" comme dans le HTML
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file || null;
    this.paysForm.get('selectedFile')?.setValue(this.selectedFile); // Met à jour le champ "selectedFile"
  }

  onSubmit(): void {
    if (this.paysForm.invalid) {
      this.paysForm.markAllAsTouched(); // Affiche les erreurs sur les champs invalides
      return;
    }

    const nom = this.paysForm.value.nom;

    this.paysService.addPays(nom, this.selectedFile!).subscribe({
      next: () => {
        this.router.navigate(['/home/Pays']);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
