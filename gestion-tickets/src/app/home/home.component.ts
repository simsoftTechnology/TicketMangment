import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DashboardComponent } from "../dashboard/dashboard.component";
import { HeaderComponent } from "../header/header.component";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    imports: [MatToolbarModule, DashboardComponent, HeaderComponent, CommonModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent {

}
