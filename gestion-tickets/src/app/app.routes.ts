import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { ListsComponent } from './lists/lists.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './_guards/auth.guard';
import { TestErrorsComponent } from './errors/test-errors/test-errors.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ListUtilisateursComponent } from './utilisateurs/list-utilisateurs/list-utilisateurs.component';
import { AjouterUtilisateurComponent } from './utilisateurs/ajouter-utilisateur/ajouter-utilisateur.component';
import { PaysComponent } from './PaysFile/pays/pays.component';
import { ModifierPaysComponent } from './PaysFile/modifier-pays/modifier-pays.component';
import { AjouterPaysComponent } from './PaysFile/ajouter-pays/ajouter-pays.component';
import { ListeProjetsComponent } from './Projets/liste-projets/liste-projets.component';
import { ListeSocietesComponent } from './Societes/liste-societes/liste-societes.component';
import { AjouterProjetComponent } from './Projets/ajouter-projet/ajouter-projet.component';
import { DetailsProjetComponent } from './Projets/details-projet/details-projet.component';
import { AjouterSocieteComponent } from './Societes/ajouter-societe/ajouter-societe.component';
import { ModifierSocieteComponent } from './Societes/modifier-societe/modifier-societe.component';
import { DetailsUtilisateurComponent } from './utilisateurs/details-utilisateur/details-utilisateur.component';
import { CategoriesComponent } from './Categoriess/categories/categories.component';
import { RoleGuard } from './_guards/role.guard';
import { ListTicketsComponent } from './Tickets/list-tickets/list-tickets.component';
import { AjouterTicketComponent } from './Tickets/ajouter-ticket/ajouter-ticket.component';
import { TicketDetailsComponent } from './Tickets/ticket-details/ticket-details.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'home',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    component: HomeComponent,
    children: [
      { path: 'members', component: MemberListComponent },
      { path: 'members/:id', component: MemberDetailComponent },
      { path: 'lists', component: ListsComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'Tickets', component: ListTicketsComponent },
      { path: 'Tickets/ajouterTicket', component: AjouterTicketComponent },
      { path: 'Tickets/details/:id', component: TicketDetailsComponent },
      // Utilisateurs : Super Admin uniquement
      {
        path: 'utilisateurs',
        component: ListUtilisateursComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin'] }
      },
      {
        path: 'utilisateurs/AjouterUtilisateur',
        component: AjouterUtilisateurComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin'] }
      },
      {
        path: 'utilisateurs/details/:id',
        component: DetailsUtilisateurComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin'] }
      },
      {
        path: 'Pays',
        component: PaysComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin'] }
      },
      {
        path: 'Pays/ajouterPays',
        component: AjouterPaysComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin'] }
      },
      {
        path: 'Pays/ModifierPays/:id',
        component: ModifierPaysComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin'] }
      },
      {
        path: 'Projets',
        component: ListeProjetsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin', 'Chef de Projet', 'Collaborateur'] }
      },
      {
        path: 'Projets/ajouterProjet',
        component: AjouterProjetComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin', 'Chef de Projet'] }
      },
      {
        path: 'Projets/details/:id',
        component: DetailsProjetComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin', 'Chef de Projet', 'Collaborateur'] }
      },
      {
        path: 'Societes',
        component: ListeSocietesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin'] }
      },
      {
        path: 'Societes/ajouterSociete',
        component: AjouterSocieteComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin'] }
      },
      {
        path: 'Societes/modifierSociete/:id',
        component: ModifierSocieteComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin'] }
      },
      {
        path: 'Categories',
        component: CategoriesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Super Admin'] }
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ]
  },
  { path: 'errors', component: TestErrorsComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: '**', component: LoginComponent, pathMatch: 'full' }
];
