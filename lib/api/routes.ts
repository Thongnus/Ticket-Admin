import { authApi } from "@/lib/api";

export const routesApi = {
  async getAllRoutes() {
    const res = await authApi.fetchWithAuth("/routes");
    if (!res.ok) throw new Error("Lỗi khi lấy danh sách tuyến đường");
    return res.json();
  },
  async getRouteById(id: number) {
    const res = await authApi.fetchWithAuth(`/routes/${id}`);
    if (!res.ok) throw new Error("Lỗi khi lấy chi tiết tuyến đường");
    return res.json();
  },
  async createRoute(route: any) {
    const res = await authApi.fetchWithAuth("/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(route),
    });
    if (!res.ok) {
      try {
        const errorData = await res.json();
        console.log("Backend error response:", errorData);
        console.log("HTTP Status:", res.status);
        console.log("Request payload:", route);
        
        // Handle different error types
        if (res.status === 500) {
          throw new Error(`Lỗi server (500): ${errorData.message || errorData.error || 'Lỗi nội bộ server'}`);
        }
        
        throw new Error(errorData.message || errorData.error || errorData.detail || `Lỗi khi tạo tuyến đường (HTTP ${res.status})`);
      } catch (parseError) {
        console.log("Failed to parse error response:", parseError);
        if (res.status === 500) {
          throw new Error(`${parseError} `);
        }
        throw new Error(`Lỗi khi tạo tuyến đường (HTTP ${res.status})`);
      }
    }
    
    // Handle both JSON and plain text responses
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    } else {
      // For plain text responses (like success messages), return void
      return;
    }
  },
  async updateRoute(id: number, route: any) {
    const res = await authApi.fetchWithAuth(`/routes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(route),
    });
    if (!res.ok) throw new Error("Lỗi khi cập nhật tuyến đường");
    
    // Handle both JSON and plain text responses
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    } else {
      // For plain text responses (like success messages), return void
      return;
    }
  },
  async updateRouteWithStations(id: number, payload: any) {
    const res = await authApi.fetchWithAuth(`/routes/${id}/with-stations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      try {
        const errorData = await res.json();
        console.log("Backend error response:", errorData);
        console.log("HTTP Status:", res.status);
        console.log("Request payload:", payload);
        
        // Handle different error types
        if (res.status === 500) {
          throw new Error(`Lỗi server (500): ${errorData.message || errorData.error || 'Lỗi nội bộ server'}`);
        }
        
        throw new Error(errorData.message || errorData.error || errorData.detail || `Lỗi khi cập nhật tuyến đường (HTTP ${res.status})`);
      } catch (parseError) {
        console.log("Failed to parse error response:", parseError);
        if (res.status === 500) {
          throw new Error(`Lỗi server (500): Không thể cập nhật tuyến đường. Vui lòng thử lại sau.`);
        }
        throw new Error(`Lỗi khi cập nhật tuyến đường (HTTP ${res.status})`);
      }
    }
    
    // Handle both JSON and plain text responses
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    } else {
      // For plain text responses (like success messages), return void
      return;
    }
  },
  async deleteRoute(id: number) {
    const res = await authApi.fetchWithAuth(`/routes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Lỗi khi xóa tuyến đường");
    return;
  },
  async createRouteWithStations(payload: any) {
    const res = await authApi.fetchWithAuth("/routes/with-stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      try {
        const errorData = await res.json();
        console.log("Backend error response:", errorData);
        console.log("HTTP Status:", res.status);
        console.log("Request payload:", payload);
        
        // Handle different error types
        if (res.status === 500) {
          throw new Error(`Lỗi server (500): ${errorData.message || errorData.error || 'Lỗi nội bộ server'}`);
        }
        
        throw new Error(errorData.message || errorData.error || errorData.detail || `Lỗi khi tạo tuyến đường kèm ga dừng (HTTP ${res.status})`);
      } catch (parseError) {
        console.log("Failed to parse error response:", parseError);
        if (res.status === 500) {
          throw new Error(`Lỗi server (500): Không thể tạo tuyến đường. Vui lòng thử lại sau.`);
        }
        throw new Error(`Lỗi khi tạo tuyến đường kèm ga dừng (HTTP ${res.status})`);
      }
    }
    
    // Handle both JSON and plain text responses
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    } else {
      // For plain text responses (like success messages), return void
      return;
    }
  },
  async getStationsByRoute(routeId: number) {
    const res = await authApi.fetchWithAuth(`/routes/${routeId}/stations`);
    if (!res.ok) throw new Error("Lỗi khi lấy ga dừng của tuyến");
    return res.json();
  },
  async addStationsToRoute(routeId: number, stations: any[]) {
    const res = await authApi.fetchWithAuth(`/routes/${routeId}/stations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stations),
    });
    if (!res.ok) throw new Error("Lỗi khi thêm ga dừng cho tuyến");
    return;
  },
  async deleteStationsByRoute(routeId: number) {
    const res = await authApi.fetchWithAuth(`/routes/${routeId}/stations`, { method: "DELETE" });
    if (!res.ok) throw new Error("Lỗi khi xóa ga dừng của tuyến");
    return;
  },
};

export interface Route {
  routeId: number;
  routeName: string;
  originStationName: string;
  destinationStationName: string;
  status: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export async function fetchActiveRoutes(): Promise<Route[]> {
  const res = await fetch(`${API_BASE}/routes/status/active`);
  if (!res.ok) throw new Error("Không thể tải danh sách tuyến đường");
  return res.json();
} 