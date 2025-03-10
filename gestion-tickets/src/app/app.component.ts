import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { AccountService } from './_services/account.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgxEditorModule } from 'ngx-editor';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, MatDialogModule, OverlayModule,
      AngularEditorModule,
      NgxEditorModule,],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  http = inject(HttpClient);
  private accountService = inject(AccountService);
  private router = inject(Router);
  title = 'gestion-tickets';
  users: any;

  ngOnInit(): void {
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    this.accountService.currentUser.set(user);
    
    // Valider le token avec le backend
    setTimeout(() => {
      this.accountService.validateToken().subscribe({
        error: () => {
          this.accountService.logout();
          this.router.navigate(['/login']);
        }
      });
    }, 0);
  }
}