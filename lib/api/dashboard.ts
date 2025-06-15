
import { authApi } from '../api'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

interface DashboardOverviewResponse {
  totalRevenue: number
  revenueGrowth: number
  totalTickets: number
  ticketsLast24h: number
  cancellationRate: number
  cancellationRateChange: number
  activeTrips: number
  tripsChange: number
}

interface DailyRevenueResponse {
  dates: string[]
  revenue: number[]
  tickets: number[]
}

interface PopularRouteDTO {
  id: number
  name: string
  bookings: number
  revenue: number
}

interface TicketCarriageDistributionDTO {
  name: string
  count: number
  percentage: number
}

interface RevenueAnalysisResponse {
  periods: string[]
  revenue: number[]
  growth: number[]
  averageTicketPrice: number[]
}

const fetchWithAuth = async (url: string) => {
  let token = localStorage.getItem("token")
  if (!token) {
    throw new Error("NO_TOKEN")
  }

  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.status === 401) {
      // Token expired, try to refresh
      token = await authApi.refreshToken()
      // Retry the request with new token
      const retryResponse = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!retryResponse.ok) {
        throw new Error("Failed to fetch data after token refresh")
      }
      return retryResponse
    }

    if (!response.ok) {
      throw new Error("Failed to fetch data")
    }

    return response
  } catch (error: any) {
    console.error("Error fetching data:", error)
    throw error
  }
}

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverviewResponse> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/overview`)
    return response.json()
  },

  getDailyRevenue: async (): Promise<DailyRevenueResponse> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/daily-revenue`)
    return response.json()
  },

  getPopularRoutes: async (): Promise<PopularRouteDTO[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/popular-routes`)
    return response.json()
  },

  getTicketDistribution: async (): Promise<TicketCarriageDistributionDTO[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/ticket-distribution`)
    return response.json()
  },

  getRevenueAnalysis: async (): Promise<RevenueAnalysisResponse> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/revenue-analysis`)
    return response.json()
  }
} 