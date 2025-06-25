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
  tripId?: number;
  route: RouteDto;
  train: TrainDto;
  tripCode: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  delayMinutes?: number;
  delayReason?: string;
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

import { authApi } from "../api";

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

// Create a new trip
export async function createTrip(trip: TripDto): Promise<any> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  const url = `/trips`;
  const res = await authApi.fetchWithAuth(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trip),
  });
  if (!res.ok) throw new Error("Failed to create trip");
  return res.json();
}

// Update a trip
export async function updateTrip(id: number, trip: TripDto): Promise<any> {
  const res = await authApi.fetchWithAuth(`/trips/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });
  if (!res.ok) throw new Error("Failed to update trip");
  return res.json();
}

// Delete a trip
export async function deleteTrip(id: number): Promise<void> {
  const res = await authApi.fetchWithAuth(`/trips/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete trip");
}

// Get trip detail
export async function getTrip(id: number): Promise<TripDto> {
  const res = await authApi.fetchWithAuth(`/trips/${id}`);
  if (!res.ok) throw new Error("Failed to get trip detail");
  const json = await res.json();
  return json.data;
}

// Update trip status
export async function updateTripStatus(id: number, status: string): Promise<any> {
  const res = await authApi.fetchWithAuth(`/trips/${id}/status?status=${status}`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to update trip status");
  return res.json();
}

// Mark trip as delayed
export async function markTripDelayed(id: number, delayInMinutes: number, delayReason?: string): Promise<any> {
  const params = new URLSearchParams();
  params.append("delayInMinutes", delayInMinutes.toString());
  if (delayReason) params.append("delayReason", delayReason);
  const res = await authApi.fetchWithAuth(`/trips/${id}/delay?${params.toString()}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to mark trip as delayed");
  return res.text();
}

// Get carriages with seats for a trip
export async function getCarriagesWithSeats(tripId: number): Promise<any> {
  const res = await authApi.fetchWithAuth(`/trips/${tripId}/carriages-with-seats`);
  if (!res.ok) throw new Error("Failed to get carriages with seats");
  return res.json();
}

// Get tracking info for a trip
export async function getTracking(tripId: number): Promise<any> {
  const res = await authApi.fetchWithAuth(`/trips/${tripId}/tracking`);
  if (!res.ok) throw new Error("Failed to get trip tracking");
  return res.json();
} 