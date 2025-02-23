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
      { path: 'utilisateurs', component: ListUtilisateursComponent},
      { path: 'utilisateurs/AjouterUtilisateur', component: AjouterUtilisateurComponent},
      { path: 'Pays', component: PaysComponent},
      { path: 'Pays/ajouterPays', component: AjouterPaysComponent},
      { path :'Pays/ModifierPays/:id', component: ModifierPaysComponent},
      { path: 'Projets', component: ListeProjetsComponent},
      { path: 'Projets/ajouterProjet', component: AjouterProjetComponent},
      { path: 'Projets/details/:id', component: DetailsProjetComponent },
      { path: 'Societes', component: ListeSocietesComponent},
      { path: 'Societes/ajouterSociete', component: AjouterSocieteComponent },
      { path: 'Societes/modifierSociete/:id', component: ModifierSocieteComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ]
  },
  {path: 'errors', component: TestErrorsComponent},
  {path: 'not-found', component: NotFoundComponent},
  {path: 'server-error', component: ServerErrorComponent},
  { path: '**', component: LoginComponent, pathMatch: 'full' }
];
