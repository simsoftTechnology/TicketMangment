export interface CategorieProbleme {
  id: number;
  nom: string;
  selected?: boolean;
  editing?: boolean;      // Propriété pour le mode édition
  originalName?: string;  // Propriété pour sauvegarder le nom original lors de l'édition
}
