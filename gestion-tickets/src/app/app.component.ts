import { AccountService } from './_services/account.service';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  http = inject(HttpClient);
  private accountService = inject(AccountService);
  title = 'gestion-tickets';
  users: any;

  ngOnInit(): void {
    this.getUsers();
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    this.accountService.currentUser.set(user);
  }

  getUsers() {
    // Retrieve the user object from localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
  
    if (user && user.token) {
      // If a user exists and a token is available, set the Authorization header
      const headers = new HttpHeaders().set('Authorization', `Bearer ${user.token}`);
      
      // Make the GET request with the Authorization header
      this.http.get('https://localhost:5001/api/users', { headers }).subscribe({
        next: (response) => {
          this.users = response;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
          // Handle errors (e.g., token expired, 401 Unauthorized)
          if (error.status === 401) {
            console.error('Unauthorized access. Redirecting to login...');
            // Optionally, redirect to login if token is invalid or expired
            // this.router.navigate(['/login']);
          }
        },
        complete: () => {
          console.log('Request has completed');
        }
      });
    } else {
      console.error('No user or token found in localStorage.');
      // Handle the case of missing user or token (e.g., redirect to login)
      // this.router.navigate(['/login']);
    }
  }
}
