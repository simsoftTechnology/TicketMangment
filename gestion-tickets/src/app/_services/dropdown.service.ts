import { Injectable } from '@angular/core';
import { Pays } from '../_models/pays';
import { Societe } from '../_models/societe';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root',
})
export class DropdownService {
  constructor() {}

  // Filtre générique réutilisable
  private filterItems<T>(
    items: T[],
    searchTerm: string,
    getText: (item: T) => string
  ): T[] {
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter((item) =>
      getText(item).toLowerCase().includes(lowerSearch)
    );
  }

  // Méthodes spécifiques
  filterPays(items: Pays[], searchTerm: string): Pays[] {
    return this.filterItems(items, searchTerm, (p) => p.nom);
  }

  filterSocietes(items: Societe[], searchTerm: string): Societe[] {
    return this.filterItems(items, searchTerm, (s) => s.nom);
  }

  filterChefs(items: User[], searchTerm: string): User[] {
    return this.filterItems(items, searchTerm, (c) => `${c.firstName} ${c.lastName}`);
  }

  filterDevelopers(items: User[], searchTerm: string): User[] {
    return this.filterItems(items, searchTerm, (d) => `${d.firstName} ${d.lastName}`);
  }

  getDeveloperName(developers: User[], devId: number): string {
    const dev = developers.find((d) => d.id === devId);
    return dev ? `${dev.firstName} ${dev.lastName}` : '';
  }
}