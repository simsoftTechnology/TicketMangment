import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalLoaderService } from '../_services/global-loader.service';

@Component({
  selector: 'app-global-loader',
  imports: [ CommonModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.css'
})
export class GlobalLoaderComponent implements OnInit {
  isLoading = false;

  constructor(public globalLoaderService: GlobalLoaderService) {}

  ngOnInit(): void {
    this.globalLoaderService.isGlobalLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }
}