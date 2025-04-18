import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component'; // Composant qui contient header + sidenav
import { TestErrorsComponent } from './errors/test-errors/test-errors.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { authGuard } from './_guards/auth.guard';
import { TableauBordComponent } from './tableau-bord/tableau-bord.component';
import { ListTicketsComponent } from './Tickets/list-tickets/list-tickets.component';
import { TicketDetailsComponent } from './Tickets/ticket-details/ticket-details.component';
import { AjouterTicketComponent } from './Tickets/ajouter-ticket/ajouter-ticket.component';

export const routes: Routes = [
  // Page de login
  { path: '', component: LoginComponent },

  // Layout principal : header + sidenav
  {
    path: 'home',
    component: LayoutComponent,       // <-- Le composant parent (layout)
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: TableauBordComponent },
      {
        path: 'MesTickets',
        loadChildren: () =>
          import('./Tickets/tickets.module').then(m => m.TicketsModule),
        data: { filterType: 'associated' }
      },
      {
        path: 'Tickets',
        loadChildren: () =>
          import('./Tickets/tickets.module').then(m => m.TicketsModule),
        data: { filterType: '' }
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./user-profile/user-profile.module').then(m => m.UserProfileModule),
      },
      {
        path: 'utilisateurs',
        loadChildren: () =>
          import('./utilisateurs/utilisateurs.module').then(m => m.UtilisateursModule),
      },
      {
        path: 'Pays',
        loadChildren: () =>
          import('./PaysFile/pays.module').then(m => m.PaysModule),
      },
      {
        path: 'Projets',
        loadChildren: () =>
          import('./Projets/projets.module').then(m => m.ProjetsModule),
      },
      {
        path: 'Societes',
        loadChildren: () =>
          import('./Societes/societes.module').then(m => m.SocietesModule),
      },
      {
        path: 'Categories',
        loadChildren: () =>
          import('./Categoriess/categories.module').then(m => m.CategoriesModule),
      },
      // Route par défaut quand on tape /home
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Routes d'erreur
  { path: 'errors', component: TestErrorsComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  // { path: '**', component: LoginComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      useHash: true, // active la stratégie avec hash
      anchorScrolling: 'enabled',
      scrollOffset: [0, 1000],
      onSameUrlNavigation: 'reload'

    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }