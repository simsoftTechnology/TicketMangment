export interface ProjetMember {
  userId: number;
  projetId: number;
  firstName: string;
  lastName: string;
  role: string;
  selected?: boolean;
}
