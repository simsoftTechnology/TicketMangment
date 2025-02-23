import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SidenavService } from '../_services/sideNavService.service';
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
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
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

  // Sections pour les menus
  isBaseDataOpen = false;
  isAccountOpen = false;

  constructor(
    private sidenavService: SidenavService,
    private breakpointObserver: BreakpointObserver, 
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Gestion des écrans responsives
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
      if (result.matches) {
        this.sidenavMode = 'over';
        this.isSidenavOpen = false;
      } else {
        this.sidenavMode = 'side';
        this.isSidenavOpen = true;
      }
    });

    // Gestion de l'état du sidenav
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
}
