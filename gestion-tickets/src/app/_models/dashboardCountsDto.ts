
export interface DashboardCountsDto {
  categoriesCount: number;
  paysCount: number;
  societesCount: number;
  statutsCount: number;
  usersCount: number;
  clientsCount: number;
  personnelCount: number;
  projectsCount: number;
  ticketsCount: number;
  ticketCountByStatus: {
    id: number;
    name: string;
    count: number;
  }[];
}
