import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-contract-dialog',
    imports: [ReactiveFormsModule, NgIf],
    templateUrl: './contract-dialog.component.html',
    styleUrls: ['./contract-dialog.component.css']
})
export class ContractDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ContractDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { contractForm: FormGroup }
  ) {}

  ngOnInit(): void {
    // Si le formulaire n'existe pas encore, on le crée
    if (!this.data.contractForm) {
      this.data.contractForm = new FormGroup({
        dateDebut: new FormControl('', Validators.required),
        dateFin: new FormControl('', Validators.required),
        type: new FormControl('Standard', Validators.required)
      });
    }
  }

  onSave(): void {
    if (this.data.contractForm.valid) {
      this.dialogRef.close(this.data.contractForm.value);
    }
  }

  onClose(): void {
    // Retourne false pour indiquer que rien n'a été sauvegardé
    this.dialogRef.close(false);
  }
}
