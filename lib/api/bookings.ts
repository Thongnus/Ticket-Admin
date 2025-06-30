import { fetchWithAuth } from "@/app/admin/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function getBookings() {
  const res = await fetchWithAuth("/bookings", {
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