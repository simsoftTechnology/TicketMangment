import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SocieteService } from '../../_services/societe.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ajouter-societe',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ajouter-societe.component.html',
  styleUrls: ['./ajouter-societe.component.css']
})
export class AjouterSocieteComponent implements OnInit {
  societeForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private societeService: SocieteService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.societeForm = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^[+0-9\\-\\s]+$')]]
    });
  }

  // ajouter-societe.component.ts
onSubmit(): void {
  if (this.societeForm.valid) {
    this.societeService.addSociete(this.societeForm.value).subscribe({
      next: () => {
        this.toastr.success("Ajouté avec succès");
        this.router.navigate(['/Societes']);
      },
      error: (err) => {
        this.toastr.error("Erreur lors de l\'ajout de la société");
        console.error('Erreur lors de l\'ajout:', err);
        // Afficher un message à l'utilisateur
      }
    });
  }
}
}
