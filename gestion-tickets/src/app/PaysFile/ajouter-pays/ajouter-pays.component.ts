import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PaysService } from '../../_services/pays.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LoaderService } from '../../_services/loader.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ajouter-pays',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, NgIf, MatSidenavModule],
  templateUrl: './ajouter-pays.component.html',
  styleUrls: ['./ajouter-pays.component.css']
})
export class AjouterPaysComponent {
  paysForm: FormGroup;
  selectedFile: File | null = null;
  
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private paysService: PaysService, private router: Router, 
              public route: ActivatedRoute,
              private loaderService: LoaderService,
              private toastr: ToastrService,
            ) 
  {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
    this.paysForm = this.fb.group({
      nom: ['', Validators.required],
      codeTel: ['', Validators.required],
      selectedFile: [null, Validators.required]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file || null;
    this.paysForm.get('selectedFile')?.setValue(this.selectedFile);
  }

  async onSubmit(): Promise<void> {
    if (this.paysForm.invalid) {
      this.paysForm.markAllAsTouched();
      return;
    }
  
    const nom = this.paysForm.value.nom;
    const codeTel = this.paysForm.value.codeTel;
    this.loaderService.showLoader();
  
    try {
      const observable = await this.paysService.addPays(nom, codeTel, this.selectedFile!);
      observable.subscribe({
        next: () => {
          this.toastr.success("Pays créé avec succès");
          this.loaderService.hideLoader();
          this.router.navigate(['/home/Pays']);
        },
        error: (err) => {
          this.loaderService.hideLoader();
          this.toastr.error(err, "Erreur lors de la création du pays");
          console.error(err);
        },
      });
    } catch (err) {
      this.loaderService.hideLoader();
      this.toastr.error("Erreur inattendue", err as string);
      console.error(err);
    }
  }
  
}
