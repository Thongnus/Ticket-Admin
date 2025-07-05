import { fetchWithAuth } from "@/app/admin/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function getBookings(params?: {
  bookingStatus?: string;
  identityCard?: string;
  page?: number;
  size?: number;
}) {
  const searchParams = new URLSearchParams();
  
  if (params?.bookingStatus && params.bookingStatus !== "all") {
    searchParams.append("bookingStatus", params.bookingStatus);
  }
  
  if (params?.identityCard) {
    searchParams.append("identityCard", params.identityCard);
  }
  
  if (params?.page) {
    searchParams.append("page", params.page.toString());
  }
  
  if (params?.size) {
    searchParams.append("size", params.size.toString());
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/bookings?${queryString}` : "/bookings";
  
  const res = await fetchWithAuth(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách đặt vé");
  return res.json();
}

export async function cancelBookingByAdmin(bookingId: number) {
  const res = await fetchWithAuth(`/bookings/cancel/${bookingId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Hủy đặt vé thất bại");
  }
  return res.json();
} 