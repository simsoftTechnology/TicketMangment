import { Component, Inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Projet } from '../../_models/Projet';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjetService } from '../../_services/projet.service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-attach-project-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, FormsModule],
  templateUrl: './attach-project-dialog.component.html',
  styleUrls: ['./attach-project-dialog.component.css']
})
export class AttachProjectDialogComponent implements OnInit {
  societeId!: number;
  projets: Projet[] = [];
  filteredProjects: Projet[] = [];
  selectedProject: Projet | null = null;
  searchQuery = '';
  form: FormGroup;
  private overlayRef: OverlayRef | null = null;

  @ViewChild('dropdownTemplate') dropdownTemplate!: TemplateRef<any>;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private dialogRef: MatDialogRef<AttachProjectDialogComponent>,
    private projetService: ProjetService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any // Injection des données envoyées par le parent
  ) {
    this.form = this.fb.group({
      projetId: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Récupérer l'id de la société depuis les données injectées
    this.societeId = this.data.societeId;
    // Utiliser la méthode getProjetsBySocieteId pour récupérer uniquement les projets de la société
    this.projetService.getProjetsBySocieteId(this.societeId).subscribe(projets => {
      this.projets = projets;
      this.filteredProjects = [...projets];
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
    this.closeDropdownOverlay();
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
