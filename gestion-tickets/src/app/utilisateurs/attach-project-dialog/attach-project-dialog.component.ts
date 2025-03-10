import { Component, HostListener, OnInit, ViewChild, ElementRef, TemplateRef, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Projet } from '../../_models/Projet';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjetService } from '../../_services/projet.service';
import { NgFor, NgIf } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';
import { SocieteService } from '../../_services/societe.service';

@Component({
  selector: 'app-attach-project-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, FormsModule],
  templateUrl: './attach-project-dialog.component.html',
  styleUrls: ['./attach-project-dialog.component.css']
})
export class AttachProjectDialogComponent implements OnInit {
  projets: Projet[] = [];
  filteredProjects: Projet[] = [];
  selectedProject: Projet | null = null;
  searchQuery = '';
  form: FormGroup;
  private overlayRef: OverlayRef | null = null;

  @ViewChild('dropdownTemplate') dropdownTemplate!: TemplateRef<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,  // Injecting dialog data
    private toastr: ToastrService,               // Injecting the Toastr service
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private dialogRef: MatDialogRef<AttachProjectDialogComponent>,
    private projetService: ProjetService,
    private societeService: SocieteService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      projetId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.projetService.getProjets().subscribe(projets => {
      this.projets = projets;
      this.projets.forEach(project => {
        if (project.societeId) {
          this.societeService.getSociete(project.societeId).subscribe({
            next: (societe) => {
              project.nomSociete = societe.nom;
            },
            error: () => {
              project.nomSociete = 'Nom non disponible';
            }
          });
        } else {
          project.nomSociete = 'Nom non disponible';
        }
      });
      this.filteredProjects = [...this.projets];
    });
  }
  
  openDropdownOverlay(triggerElement: HTMLElement): void {
    if (this.overlayRef) {
      this.closeDropdownOverlay();
      return;
    }
  
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(triggerElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }
      ]);
  
    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'custom-backdrop'
    });
  
    this.overlayRef.backdropClick().subscribe(() => this.closeDropdownOverlay());
  
    const portal = new TemplatePortal(this.dropdownTemplate, this.viewContainerRef);
    this.overlayRef.attach(portal);
  }
  
  closeDropdownOverlay(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef = null;
    }
  }

  filterProjects(): void {
    this.filteredProjects = this.projets.filter(p =>
      p.nom.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectProject(project: Projet): void {
    this.selectedProject = project;
    this.form.patchValue({ projetId: project.id });
    
    if (project.societeId) {
      this.societeService.getSociete(project.societeId).subscribe({
        next: (societe) => {
          this.selectedProject!.nomSociete = societe.nom;
        },
        error: () => {
          this.selectedProject!.nomSociete = 'Nom non disponible';
        }
      });
    } else {
      this.selectedProject!.nomSociete = 'Nom non disponible';
    }
    
    this.closeDropdownOverlay();
  }
  
  onSubmit(): void {
    this.projetService
      .ajouterUtilisateurAuProjet(this.data.projetId, this.data.userId)
      .subscribe({
        next: () => {
          this.toastr.success('Projet associé avec succès');
          this.dialogRef.close(true);
        },
        error: (err) => {
          const errorMessage = err.message || "Erreur lors de l'association";
          this.toastr.error(errorMessage);
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
