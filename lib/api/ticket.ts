import { fetchWithAuth } from "@/app/admin/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Interface cho Ticket
export interface Ticket {
  ticketId: number;
  ticketCode: string;
  passengerName: string;
  identityCard: string;
  seatNumber: string;
  carriageNumber: string;
  ticketStatus: string;
  ticketType: string;
  price: number;
  bookingCode: string;
  tripCode: string;
  routeName: string;
  departureTime: string;
  arrivalTime: string;
  originStation: string;
  destinationStation: string;
  issuedDate: string;
  validUntil: string;
  passengerType: string;
  discountPercent: number;
  finalPrice: number;
}

// Interface cho response pagination
export interface TicketResponse {
  content: Ticket[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Interface cho params tìm kiếm
export interface TicketSearchParams {
  search?: string;
  ticketStatus?: string;
  ticketType?: string;
  page?: number;
  size?: number;
}

// Lấy danh sách tickets với filter và pagination
export async function getTickets(params?: TicketSearchParams): Promise<TicketResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.search) {
    searchParams.append("search", params.search);
  }
  
  if (params?.ticketStatus && params.ticketStatus !== "all") {
    searchParams.append("ticketStatus", params.ticketStatus);
  }
  
  if (params?.ticketType && params.ticketType !== "all") {
    searchParams.append("ticketType", params.ticketType);
  }
  
  if (params?.page) {
    searchParams.append("page", params.page.toString());
  }
  
  if (params?.size) {
    searchParams.append("size", params.size.toString());
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/tickets?${queryString}` : "/tickets";
  
  const res = await fetchWithAuth(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Không thể lấy danh sách vé");
  }
  
  return res.json();
}

// Lấy chi tiết một ticket
export async function getTicketById(ticketId: number): Promise<Ticket> {
  const res = await fetchWithAuth(`/tickets/${ticketId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Không thể lấy thông tin vé");
  }
  
  return res.json();
}

// Hủy ticket
export async function cancelTicket(ticketId: number): Promise<void> {
  const res = await fetchWithAuth(`/tickets/${ticketId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Không thể hủy vé");
  }
}

// In ticket (có thể trả về PDF hoặc URL để in)
export async function printTicket(ticketId: number): Promise<{ printUrl: string }> {
  const res = await fetchWithAuth(`/tickets/${ticketId}/print`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Không thể in vé");
  }
  
  return res.json();
}

// Tạo ticket mới (từ booking)
export async function createTicket(bookingId: number, ticketData: {
  passengerName: string;
  identityCard: string;
  seatNumber: string;
  carriageNumber: string;
  ticketType: string;
  passengerType: string;
}): Promise<Ticket> {
  const res = await fetchWithAuth(`/bookings/${bookingId}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Không thể tạo vé");
  }
  
  return res.json();
}

// Cập nhật thông tin ticket
export async function updateTicket(ticketId: number, ticketData: Partial<Ticket>): Promise<Ticket> {
  const res = await fetchWithAuth(`/tickets/${ticketId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Không thể cập nhật vé");
  }
  
  return res.json();
}

// Lấy thống kê tickets
export async function getTicketStats(): Promise<{
  totalTickets: number;
  activeTickets: number;
  usedTickets: number;
  cancelledTickets: number;
  expiredTickets: number;
  refundedTickets: number;
  revenue: number;
}> {
  const res = await fetchWithAuth("/tickets/stats", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Không thể lấy thống kê vé");
  }
  
  return res.json();
}

// Lấy tickets theo booking
export async function getTicketsByBooking(bookingId: number): Promise<Ticket[]> {
  const res = await fetchWithAuth(`/bookings/${bookingId}/tickets`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Không thể lấy vé theo đặt vé");
  }
  
  return res.json();
}

// Lấy tickets theo trip
export async function getTicketsByTrip(tripId: number): Promise<Ticket[]> {
  const res = await fetchWithAuth(`/trips/${tripId}/tickets`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Không thể lấy vé theo chuyến tàu");
  }
  
  return res.json();
}
