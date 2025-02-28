import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { AccountService } from './_services/account.service';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatDialogModule, OverlayModule],
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