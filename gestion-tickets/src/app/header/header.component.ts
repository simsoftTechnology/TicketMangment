import { Component, OnInit, NgZone, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { SidenavService } from '../_services/sideNavService.service';
import { User } from '../_models/user';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchResultDTO, SearchService } from '../_services/search.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  userInitials = "";
  isMenuOpen: boolean = false;
  
  query: string = '';
  results: SearchResultDTO[] = [];
  private searchSubject = new Subject<string>();
  isSearchActive: boolean = false;
  @ViewChild('searchBar') searchBar!: ElementRef;
  
  constructor(
    private accountService: AccountService,
    private router: Router,
    private ngZone: NgZone,
    private sidenavService: SidenavService,
    private searchService: SearchService,
    private elementRef: ElementRef
  ) {
    // Débouncer la recherche pour éviter des appels API trop fréquents
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(q => this.executeSearch(q));
  }

  ngOnInit(): void {
    this.currentUser = this.accountService.currentUser();
    if (this.currentUser) {
      this.userInitials =
        this.currentUser.firstName.charAt(0).toUpperCase() +
        this.currentUser.lastName.charAt(0).toUpperCase();
    }
  }

  

  toggleSidenav() {
    this.sidenavService.toggleSidenav();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Méthode pour naviguer vers le profil utilisateur
  navigateToProfile(): void {
    // Remplacez '/profile' par la route correspondante à votre profil
    this.router.navigate(['home/profile']);
    this.isMenuOpen = false; // Ferme le menu après navigation
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }

  onSearchChange(): void {
    this.searchSubject.next(this.query);
  }

  
  executeSearch(query: string): void {
    if (!query) {
      this.results = [];
      return;
    }
    this.searchService.search(query).subscribe(data => {
      this.results = data;
    });
    this.isSearchActive = this.query.length > 0;
  }

  // Redirige l'utilisateur selon le type du résultat cliqué
  navigateToResult(result: SearchResultDTO): void {
    let route: string[];
    const queryParams = { t: new Date().getTime().toString() };
  
    switch (result.type) {
      case 'User':
        route = ['/home/utilisateurs/details', result.id.toString()];
        break;
      case 'Projet':
        route = ['/home/Projets/details', result.id.toString()];
        break;
      case 'Societe':
        route = ['/home/Societes/modifierSociete', result.id.toString()];
        break;
      case 'Role':
        route = ['/home/utilisateurs/details', result.id.toString()];
        break;
      case 'Ticket':
      case 'Qualification':
      case 'Priorite':
      case 'CategorieProbleme':
      case 'StatutDesTicket':
      case 'Commentaire':
        route = ['/home/Tickets/details', result.id.toString()];
        break;
      case 'Pays':
        route = ['home/Pays/ModifierPays', result.id.toString()];
        break;
      case 'ContratSociete':
        route = ['/home/Societes/modifierSociete', result.id.toString()];
        break;
      case 'ContratUser':
        route = ['/home/utilisateurs/details', result.id.toString()];
        break;
      default:
        return;
    }
  
    this.router.navigate(route, { 
      queryParams: queryParams,
      queryParamsHandling: 'merge' // 🛠️ Permet d'ajouter un paramètre pour forcer le changement
    }).then(() => {
      this.query = '';
      this.results = [];
    });
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Vérifiez si le clic est à l'intérieur du composant
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isMenuOpen = false;
      // Pour la recherche, vous pouvez conserver l'ancien comportement:
      if (!clickedInside) {
        this.isSearchActive = false;
      }
    }
  }


}
