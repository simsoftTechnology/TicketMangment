import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private accountService: AccountService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Récupère la liste des rôles autorisés pour cette route
    const allowedRoles = route.data['roles'] as string[];
    // Récupère l'utilisateur courant via le signal en appelant la fonction
    const user: User | null = this.accountService.currentUser();
    
    // Si l'utilisateur est connecté et que son rôle figure dans la liste autorisée, on autorise l'accès
    if (user && allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())) {
      return true;
    }    

    // Sinon, redirige vers une page d'erreur ou de non-autorisation (ici, on redirige vers 'not-found')
    this.router.navigate(['/not-found']);
    return false;
  }
}
