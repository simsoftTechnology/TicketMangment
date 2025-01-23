import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { AccountService } from '../../_services/account.service';

import { NgClass, NgFor, NgIf } from '@angular/common';
import { User } from '../../_models/user';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-utilisateurs',
  standalone: true,
  imports: [ NgFor, NgIf, NgClass, FormsModule, RouterLink],
  templateUrl: './list-utilisateurs.component.html',
  styleUrl: './list-utilisateurs.component.css'
})
export class ListUtilisateursComponent implements OnInit {
  http = inject(HttpClient);
  private accountService = inject(AccountService);
  title = 'gestion-tickets';
  users: User[] = [];

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
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (user && user.token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${user.token}`);

      this.http.get<User[]>('https://localhost:5001/api/users', { headers }).subscribe({
        next: (response) => {
          this.users = response.map(user => ({
            ...user,
            selected: false
          }));
          console.log('Users fetched successfully:', this.users);
        },
        error: (error) => {
          console.error('Error fetching users:', error);
          if (error.status === 401) {
            console.error('Unauthorized access. Redirecting to login...');
          }
        },
        complete: () => {
          console.log('Request has completed');
        }
      });
    } else {
      console.error('No user or token found in localStorage.');
    }
  }

  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'super admin': return 'super-admin';
      case 'chef de projet': return 'chef-de-projet';
      case 'développeur': return 'developpeur';
      case 'client': return 'client';
      default: return '';
    }
  }

  selectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.users = this.users.map(user => ({
      ...user,
      selected: checkbox.checked
    }));
  }

  toggleSelection(user: User): void {
    user.selected = !user.selected;
    const allSelected = this.users.every(u => u.selected);
    const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = allSelected;
    }
  }
  
  
  
}
