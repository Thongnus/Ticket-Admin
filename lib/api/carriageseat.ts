import { authApi } from "../api";

export interface CarriageDto {
  carriageId: number;
  carriageNumber: string;
  carriageType: string;
  capacity: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  trainId: number;
  trainName?: string;
}

export interface SeatDto {
  seatId: number;
  seatNumber: string;
  seatType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  price: number | null;
  booked: boolean;
  carriage: CarriageDto;
}

export interface CarriageWithSeatsDto {
  carriage: CarriageDto;
  seats: SeatDto[];
}

export const carriageSeatApi = {
  getCarriageWithSeats: async (carriageId: number): Promise<CarriageWithSeatsDto> => {
    const response = await authApi.fetchWithAuth(`/carriages/${carriageId}/with-seats`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    console.log(response.json)
    return response.json();
  },
  getAllCarriagesWithSeats: async (): Promise<CarriageWithSeatsDto[]> => {
    const response = await authApi.fetchWithAuth(`/carriages/with-seats`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    } console.log(response.json)
    return response.json();
  },
  updateCarriage: async (id: number, dto: CarriageDto): Promise<CarriageDto> => {
    const response = await authApi.fetchWithAuth(`/carriages/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  createCarriage: async (dto: CarriageDto): Promise<CarriageDto> => {
    const response = await authApi.fetchWithAuth(`/carriages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  deleteCarriage: async (carriageId: number): Promise<void> => {
    const response = await authApi.fetchWithAuth(`/carriages/${carriageId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return;
  },
  createSeat: async (seatDto: SeatDto): Promise<SeatDto> => {
    const response = await authApi.fetchWithAuth(`/seats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(seatDto),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  updateSeat: async (seatId: number, seatDto: SeatDto): Promise<SeatDto> => {
    const response = await authApi.fetchWithAuth(`/seats/${seatId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(seatDto),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  getSeat: async (seatId: number): Promise<SeatDto> => {
    const response = await authApi.fetchWithAuth(`/seats/${seatId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  deleteSeat: async (seatId: number): Promise<void> => {
    const response = await authApi.fetchWithAuth(`/seats/${seatId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return;
  },
}; 