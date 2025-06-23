export interface RouteDto {
  routeId: number;
  routeName: string;
  originStationId: number;
  destinationStationId: number;
  originStationName: string;
  destinationStationName: string;
  distance: number;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainDto {
  trainId: number;
  trainNumber: string;
  trainName: string;
  trainType: string;
  capacity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripDto {
  tripId: number;
  route: RouteDto;
  train: TrainDto;
  tripCode: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  delayMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  pageable: any;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: any;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface FetchTripsParams {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export async function fetchTripsPaged(params: FetchTripsParams): Promise<Page<TripDto>> {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.status) query.append("status", params.status);
  if (params.page !== undefined) query.append("page", params.page.toString());
  if (params.size !== undefined) query.append("size", params.size.toString());
  if (params.sort) params.sort.forEach(s => query.append("sort", s));

  const url = `${API_BASE}/trips/paged/search?${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
} 