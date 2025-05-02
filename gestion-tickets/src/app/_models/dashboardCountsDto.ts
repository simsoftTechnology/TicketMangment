
export interface DashboardCountsDto {
  categoriesCount: number;
  paysCount: number;
  societesCount: number;
  statutsCount: number;
  usersCount: number;
  projectsCount: number;
  ticketsCount: number;
  ticketCountByStatus: {
    id: number;
    name: string;
    count: number;
  }[];
}
