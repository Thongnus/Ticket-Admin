import { fetchWithAuth } from "@/app/admin/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function getRefundRequests(
  page = 0,
  size = 5,
  status?: string,
  search?: string,
  fromDate?: string,
  toDate?: string
) {
  let url = `/refunds/requests?page=${page}&size=${size}`;
  if (status) url += `&status=${status}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (fromDate) url += `&fromDate=${encodeURIComponent(fromDate)}`;
  if (toDate) url += `&toDate=${encodeURIComponent(toDate)}`;

  const res = await fetchWithAuth(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Không thể lấy danh sách yêu cầu hoàn tiền");

  const data = await res.json();
  return data.data;
}


export async function getRefundRequestById(refundRequestId: number) {
  const res = await fetchWithAuth(`/refunds/${refundRequestId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Không thể lấy chi tiết yêu cầu hoàn tiền");
  const data = await res.json();
  return data.data;
}

export async function approveRefundRequest(refundRequestId: number, adminNote?: string) {
  const params = adminNote ? `?adminNote=${encodeURIComponent(adminNote)}` : '';
  const res = await fetchWithAuth(`/refunds/${refundRequestId}/approve${params}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Không thể duyệt yêu cầu hoàn tiền");
  return res.json();
}

export async function rejectRefundRequest(refundRequestId: number, reason: string) {
  const params = `?reason=${encodeURIComponent(reason)}`;
  const res = await fetchWithAuth(`/refunds/${refundRequestId}/reject${params}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Không thể từ chối yêu cầu hoàn tiền");
  return res.json();
}

export async function getRefundStatistics() {
  const res = await fetchWithAuth(`/refunds/statistics`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Không thể lấy thống kê hoàn tiền");
  const data = await res.json();

  return data.data;
} 