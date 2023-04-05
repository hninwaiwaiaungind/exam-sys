
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, } from '@angular/material/dialog';
// Constants

// Interfaces
import { Role } from 'src/app/interfaces/model';

@Component({
  selector: 'app-csv-dialog',
  templateUrl: './csv-dialog.component.html',
  styleUrls: ['./csv-dialog.component.scss']
})
export class CsvDialogComponent implements OnInit {
  userEditForm!: FormGroup;
  roles!: Role[];

  constructor(
    public dialogRef: MatDialogRef<CsvDialogComponent>,
    public dialog: MatDialog,
    fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userEditForm = fb.group({
      username: [data.user.username, Validators.required],
      email: [data.user.email, [Validators.required, Validators.email]],
      role: [+data.user.role, Validators.required],
    });
  }

  ngOnInit(): void {
    this.roles = this.data.roles;
  }

  public myError = (controlName: string, errorName: string) => {
    return this.userEditForm.controls[controlName].hasError(errorName);
  };

  update() {
    this.dialogRef.close({ action: 'update', data: this.userEditForm.value });
  }

  onNoClick(): void {
    this.dialogRef.close({ action: 'cancel' });
  }
}

