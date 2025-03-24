import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaysService } from '../../_services/pays.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Pays } from '../../_models/pays';
import { LoaderService } from '../../_services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modifier-pays',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './modifier-pays.component.html',
  styleUrls: ['./modifier-pays.component.css']
})
export class ModifierPaysComponent implements OnInit {
  paysForm: FormGroup;
  selectedFile: File | undefined;
  paysId: number | null = null;
  originalPays: Pays | null = null;

  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private paysService: PaysService,
    private router: Router,
    public route: ActivatedRoute,
    private loaderService: LoaderService,
    private toastr: ToastrService,
  ) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
    this.paysForm = this.fb.group({
      nom: [''],
      codeTel: [''],
      file: [null]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.paysId = +id;
        this.paysService.getPaysById(this.paysId).subscribe((pays: Pays) => {
          this.originalPays = { ...pays };
          this.paysForm.patchValue({
            nom: pays.nom,
            codeTel: pays.codeTel
          });
        });
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.paysForm.get('file')?.setValue(this.selectedFile);
  }

  onSubmit(): void {
    if (this.paysId === null || !this.originalPays) return;
  
    // Détecter les changements sur le nom et le code téléphonique
    const hasNomChanged = this.paysForm.value.nom.trim() !== this.originalPays.nom.trim();
    const hasCodeTelChanged = this.paysForm.value.codeTel.trim() !== this.originalPays.codeTel.trim();
    const hasFileChanged = !!this.selectedFile;
  
    // Si aucun changement, ne pas envoyer de requête et rediriger l'utilisateur
    // if (!hasNomChanged && !hasFileChanged) {
    //   this.router.navigate(['/home/Pays']);
    //   return;
    // }
    if (!hasNomChanged && !hasCodeTelChanged && !hasFileChanged) {
      this.toastr.error("Erreur lors de la mis à jour du pays");
      this.router.navigate(['/home/Pays']);
      return;
    }
  
    // Toujours inclure le nom et le code téléphonique, même s'ils n'ont pas changé
    const paysUpdateDto: any = {
      nom: this.paysForm.value.nom || this.originalPays.nom,
      codeTel: this.paysForm.value.codeTel || this.originalPays.codeTel
    };
  
    const fileToSend = hasFileChanged ? this.selectedFile : undefined;
    this.loaderService.showLoader();
    this.paysService.updatePays(this.paysId, paysUpdateDto, fileToSend).subscribe(() => {
      // this.router.navigate(['/home/Pays']);
      this.loaderService.hideLoader();
      this.toastr.success("Pays mis à jour avec succéss");
      this.router.navigate(['/home/Pays']);
    });
  }
}
