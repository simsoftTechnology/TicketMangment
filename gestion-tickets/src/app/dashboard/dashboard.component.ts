import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SidenavService } from '../_services/sideNavService.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgIf } from '@angular/common';
import { User } from '../_models/user';

@Component({
    selector: 'app-dashboard',
    imports: [
        MatToolbarModule,
        MatSidenavModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatIconModule,
        MatListModule,
        FormsModule,
        MatExpansionModule,
        NgIf,
        RouterModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  isSidenavOpen: boolean = true;
  sidenavMode: 'side' | 'over' = 'side';
  private sidenavSubscription?: Subscription;

  // Pour les menus déroulants
  isBaseDataOpen = false;
  isAccountOpen = false;

  isModalOpen = false;

  constructor(
    private sidenavService: SidenavService,
    private breakpointObserver: BreakpointObserver, 
    public route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    // Gestion de la réactivité selon la taille de l'écran
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
      if (result.matches) {
        this.sidenavMode = 'over';
        this.isSidenavOpen = false;
      } else {
        this.sidenavMode = 'side';
        this.isSidenavOpen = true;
      }
    });

    // Abonnement à l'état du sidenav
    this.sidenavSubscription = this.sidenavService.sidenavState$.subscribe(state => {
      this.isSidenavOpen = state;
    });
  }

  ngOnDestroy() {
    if (this.sidenavSubscription) {
      this.sidenavSubscription.unsubscribe();
    }
  }

  toggleBaseData() {
    this.isBaseDataOpen = !this.isBaseDataOpen;
  }

  toggleAccount() {
    this.isAccountOpen = !this.isAccountOpen;
  }

  // Méthodes d'aide pour vérifier le rôle de l'utilisateur
  get currentUser(): User | null {
    return this.accountService.currentUser();
  }
  
  

  isSuperAdmin(): boolean {
    return this.currentUser?.role?.toLowerCase() === 'super admin';
  }
  
  isChefDeProjet(): boolean {
    return this.currentUser?.role?.toLowerCase() === 'chef de projet';
  }
  
  isDeveloppeur(): boolean {
    return this.currentUser?.role?.toLowerCase() === 'développeur';
  }
  
  isClient(): boolean {
    return this.currentUser?.role?.toLowerCase() === 'client';
  }
  
}
